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

/** Preload image and return blob URL (fixes Safari CORS taint) */
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
 * True-HD Capture for iOS Safari/Chrome
 * 1️⃣ Preloads all images as blob URLs
 * 2️⃣ Captures clean 1× snapshot (no CSS transforms)
 * 3️⃣ Upscales manually to 4× using high-quality resampling
 */
async function captureTrueHDIOS(node: HTMLElement, scale = 4) {
  const rect = node.getBoundingClientRect();

  // Preload and localize all images
  const imgs = Array.from(node.querySelectorAll('img'));
  const restoreMap: Record<string, string> = {};
  for (const img of imgs) {
    const src = img.getAttribute('src');
    if (!src) continue;
    const safe = await preloadImage(src);
    restoreMap[safe] = src;
    img.setAttribute('src', safe);
  }

  // Temporarily disable GPU effects for cleaner rasterization
  const prevTransform = node.style.transform;
  const prevFilter = node.style.filter;
  node.style.transform = 'none';
  node.style.filter = 'none';

  // Capture at 1× (no Safari text scaling)
  const baseBlob = await domToBlob(node, {
    ...buildOptions('image/png', 1),
    width: rect.width,
    height: rect.height,
  });
  if (!baseBlob) throw new Error('Base capture failed');

  // Load image to upscale
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const el = new Image();
    el.onload = () => res(el);
    el.onerror = rej;
    el.src = URL.createObjectURL(baseBlob);
  });

  // Create HD canvas
  const canvas = document.createElement('canvas');
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;
  // @ts-ignore
  if ('colorSpace' in canvas) canvas.colorSpace = 'srgb';
  const ctx = canvas.getContext('2d', { alpha: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0);

  // Restore original transforms and URLs
  node.style.transform = prevTransform;
  node.style.filter = prevFilter;
  URL.revokeObjectURL(img.src);
  for (const [safe, orig] of Object.entries(restoreMap)) {
    imgs.forEach((i) => {
      if (i.getAttribute('src') === safe) i.setAttribute('src', orig);
    });
    URL.revokeObjectURL(safe);
  }

  // Export at max quality
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject('Export failed')), 'image/png', 1.0)
  );
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
      showToast('Rendering in 4× HD...', 'loading', 1000);
      await waitForFonts();
      if (isIOS()) applyIOSTextFix();

      const scale = Math.min(getSafeScale() * (window.devicePixelRatio || 2), 8);
      const blob = isIOS()
        ? await captureTrueHDIOS(node, 4)
        : await domToBlob(node, {
            ...buildOptions('image/png', scale),
            width: node.offsetWidth * scale,
            height: node.offsetHeight * scale,
            style: { transform: 'none', zoom: scale },
          });

      if (isIOS()) removeIOSTextFix();

      if (!blob) throw new Error('Failed to capture');
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
