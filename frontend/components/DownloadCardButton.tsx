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
 * --- iOS high-quality 2-pass capture ---
 * 1️⃣ Render once at 1× to avoid Safari text/font distortion.
 * 2️⃣ Manually upscale on a separate HD canvas using true-color sampling.
 */
async function captureHighResIOS(node: HTMLElement, scale: number) {
  const rect = node.getBoundingClientRect();

  // --- step 1: safe base capture (no Safari text shrink) ---
  const baseBlob = await domToBlob(node, {
    ...buildOptions('image/png', 1),
    width: rect.width,
    height: rect.height,
  });
  if (!baseBlob) throw new Error('Base capture failed');

  // --- step 2: upscale pass (sRGB for better contrast on iPhones) ---
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = URL.createObjectURL(baseBlob);
  });

  const canvas = document.createElement('canvas');
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;
  // @ts-ignore
  if ('colorSpace' in canvas) canvas.colorSpace = 'srgb';

  const ctx = canvas.getContext('2d', { willReadFrequently: false })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // draw the image once per pixel to avoid aliasing
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(img.src);

  // --- step 3: export blob (with fallback if toBlob fails) ---
  return await new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Canvas export failed'));
        },
        'image/png',
        1.0
      );
    } catch (err) {
      try {
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const byteString = atob(dataUrl.split(',')[1]);
        const mime = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const intArray = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
          intArray[i] = byteString.charCodeAt(i);
        }
        resolve(new Blob([arrayBuffer], { type: mime }));
      } catch (fallbackErr) {
        reject(fallbackErr);
      }
    }
  });
}

/**
 * --- Desktop/Universal capture ---
 * Standard modern-screenshot at hi-DPI scale.
 */
async function captureUniversal(node: HTMLElement, scale: number) {
  return await domToBlob(node, {
    ...buildOptions('image/png', scale),
    width: node.offsetWidth * scale,
    height: node.offsetHeight * scale,
    style: { transform: 'none', zoom: scale },
  });
}

export function DownloadCardButton({ targetRef, filename }: DownloadCardButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleDownload = async () => {
    const node = targetRef.current;
    if (!node) return;

    try {
      showToast('Rendering image...', 'loading', 800);
      await waitForFonts();

      const dpr = window.devicePixelRatio || 1;
      const baseScale = getSafeScale();
      const scale = Math.min(baseScale * dpr, 8); // hard-limit to avoid memory blowout

      if (isIOS()) applyIOSTextFix();

      const blob = isIOS()
        ? await captureHighResIOS(node, scale)
        : await captureUniversal(node, scale);

      if (isIOS()) removeIOSTextFix();

      if (!blob) throw new Error('Failed to capture image');
      await saveBlob(blob, makeFilename(filename, 'png'));
      showToast('✅ Downloaded in HD', 'success', 1600);
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
