'use client';

import { useRef } from 'react';
import { domToBlob } from 'modern-screenshot';
import { Download } from 'lucide-react';
import { showToast } from '@/lib/toast';
import {
  buildOptions,
  makeFilename,
  saveBlob,
  waitForFonts,
  getSafeScale,
  isIOS,
  applyIOSTextFix,
  removeIOSTextFix,
} from '@/lib/capture';

/** Utility: preload image as a Blob URL to avoid CORS tainting */
async function preloadImage(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;
  try {
    const res = await fetch(url, { mode: 'cors', cache: 'force-cache' });
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return url;
  }
}

/**
 * --- iOS-safe Ultra HD capture ---
 * Preloads background + avatar → captures at 1× → upscales 4×
 */
async function captureUltraHDIOS(node: HTMLElement, scale = 4) {
  // Step 1: Preload all <img> elements to blob URLs (avoid CORS)
  const imgEls = Array.from(node.querySelectorAll('img'));
  const restoreMap: Record<string, string> = {};

  for (const img of imgEls) {
    const src = img.getAttribute('src');
    if (!src) continue;
    const safeSrc = await preloadImage(src);
    restoreMap[safeSrc] = src;
    img.setAttribute('src', safeSrc);
  }

  // Step 2: Capture low-DPI base for text accuracy
  const rect = node.getBoundingClientRect();
  const baseBlob = await domToBlob(node, {
    ...buildOptions('image/png', 1),
    width: rect.width,
    height: rect.height,
  });
  if (!baseBlob) throw new Error('Base capture failed');

  // Step 3: Upscale manually on a color-managed canvas
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = URL.createObjectURL(baseBlob);
  });

  const upscale = Math.min(scale, 4);
  const canvas = document.createElement('canvas');
  canvas.width = rect.width * upscale;
  canvas.height = rect.height * upscale;
  // @ts-ignore
  if ('colorSpace' in canvas) canvas.colorSpace = 'srgb';

  const ctx = canvas.getContext('2d', {
    alpha: true,
    willReadFrequently: false,
  })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.scale(upscale, upscale);
  ctx.drawImage(img, 0, 0);

  // Step 4: Clean up object URLs
  URL.revokeObjectURL(img.src);
  for (const [safe, orig] of Object.entries(restoreMap)) {
    imgEls.forEach((img) => {
      if (img.getAttribute('src') === safe) img.setAttribute('src', orig);
    });
    URL.revokeObjectURL(safe);
  }

  // Step 5: Return high-quality PNG blob
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas export failed'))),
      'image/png',
      1.0
    );
  });
}

interface DownloadCardButtonProps {
  targetRef: React.RefObject<HTMLDivElement>;
  filename: string;
}

export function DownloadCardButton({ targetRef, filename }: DownloadCardButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleDownload = async () => {
    const node = targetRef.current;
    if (!node) return;

    try {
      showToast('Rendering 4× HD image...', 'loading', 1000);
      await waitForFonts();

      const scale = Math.min(getSafeScale() * (window.devicePixelRatio || 2), 8);
      if (isIOS()) applyIOSTextFix();

      const blob = isIOS()
        ? await captureUltraHDIOS(node, 4)
        : await domToBlob(node, {
            ...buildOptions('image/png', scale),
            width: node.offsetWidth * scale,
            height: node.offsetHeight * scale,
            style: { transform: 'none', zoom: scale },
          });

      if (isIOS()) removeIOSTextFix();

      if (!blob) throw new Error('Failed to capture image');
      await saveBlob(blob, makeFilename(filename, 'png'));
      showToast('✅ Downloaded 4× HD image', 'success', 2000);
    } catch (err) {
      console.error(err);
      if (isIOS()) removeIOSTextFix();
      showToast('❌ Export failed', 'error', 2200);
    }
  };

  return (
    <button
      ref={btnRef}
      onClick={handleDownload}
      className="flex-1 m-1 mr-0 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all"
      type="button"
    >
      <Download className="w-4 h-4" />
      Download
    </button>
  );
}
