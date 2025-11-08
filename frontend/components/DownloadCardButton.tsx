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

/**
 * --- Ultra HD iOS Fallback ---
 * 1️⃣ Capture at 1× for accuracy
 * 2️⃣ Manually upscale to 4× using canvas resampling
 */
async function captureUltraHDIOS(node: HTMLElement, scale: number) {
  const rect = node.getBoundingClientRect();

  // Step 1: low-DPI capture (avoids iOS text/blur issues)
  const baseBlob = await domToBlob(node, {
    ...buildOptions('image/png', 1),
    width: rect.width,
    height: rect.height,
  });
  if (!baseBlob) throw new Error('Base capture failed');

  // Step 2: upscale manually using color-managed canvas
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = URL.createObjectURL(baseBlob);
  });

  const upscale = Math.min(scale, 4); // 4× max for iOS Retina
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
  URL.revokeObjectURL(img.src);

  return await new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob((b) => (b ? resolve(b) : reject('Canvas export failed')), 'image/png', 1.0);
    } catch (err) {
      reject(err);
    }
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
      showToast('Rendering HD image...', 'loading', 1000);
      await waitForFonts();

      const scale = Math.min(getSafeScale() * (window.devicePixelRatio || 2), 8);
      if (isIOS()) applyIOSTextFix();

      const blob = isIOS()
        ? await captureUltraHDIOS(node, 4) // forced 4× retina quality for iOS
        : await domToBlob(node, {
            ...buildOptions('image/png', scale),
            width: node.offsetWidth * scale,
            height: node.offsetHeight * scale,
            style: { transform: 'none', zoom: scale },
          });

      if (isIOS()) removeIOSTextFix();

      if (!blob) throw new Error('Failed to capture image');
      await saveBlob(blob, makeFilename(filename, 'png'));
      showToast('✅ Downloaded in HD (4×)', 'success', 1800);
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
