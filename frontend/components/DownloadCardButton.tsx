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

interface DownloadCardButtonProps {
  targetRef: React.RefObject<HTMLDivElement>;
  filename: string;
}

/**
 * --- iOS high-quality fallback ---
 * 1. Capture at 1× (no Safari black/blur bug)
 * 2. Manually upscale to full DPI with quality resampling
 */
async function captureHighResIOS(node: HTMLElement, scale: number) {
  const rect = node.getBoundingClientRect();

  // 1️⃣ normal low-scale capture (works fine on iOS)
  const baseBlob = await domToBlob(node, {
    ...buildOptions('image/png', 1),
    width: rect.width,
    height: rect.height,
  });
  if (!baseBlob) throw new Error('Base capture failed');

  // 2️⃣ upscale manually on 2D canvas with high-quality sampling
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = URL.createObjectURL(baseBlob);
  });

  const canvas = document.createElement('canvas');
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(img.src);

  return await new Promise<Blob | null>((res) =>
    canvas.toBlob((b) => res(b), 'image/png', 1.0)
  );
}

export function DownloadCardButton({ targetRef, filename }: DownloadCardButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleDownload = async () => {
    const node = targetRef.current;
    if (!node) return;

    try {
      showToast('Rendering image...', 'loading', 800);
      await waitForFonts();

      const scale = getSafeScale();
      if (isIOS()) applyIOSTextFix();

      const blob = isIOS()
        ? await captureHighResIOS(node, scale)
        : await domToBlob(node, {
            ...buildOptions('image/png', scale),
            width: node.offsetWidth * scale,
            height: node.offsetHeight * scale,
            style: { transform: 'none', zoom: scale },
          });

      if (isIOS()) removeIOSTextFix();

      if (!blob) throw new Error('Failed to capture image');
      await saveBlob(blob, makeFilename(filename, 'png'));
      showToast('✅ Downloaded in HD', 'success', 2000);
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
