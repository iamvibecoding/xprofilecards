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

/** Preload image and return blob URL (Safari-safe) */
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
 * iOS "Retina Fix" — Hybrid Capture for max sharpness and no color washout.
 * 1️⃣ Neutralize transforms/filters.
 * 2️⃣ Preload all images (fix background loss).
 * 3️⃣ Capture 2× for glyph fidelity.
 * 4️⃣ Manually upscale to 4× using SRGB-correct resampling.
 */
async function captureRetinaIOS(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const baseScale = 2; // optimal text crispness
  const finalScale = 4;

  // Preload all images
  const imgs = Array.from(node.querySelectorAll('img'));
  const replaced: { el: HTMLImageElement; orig: string; blob?: string }[] = [];
  for (const el of imgs) {
    const src = el.getAttribute('src');
    if (!src) continue;
    const blobUrl = await preloadImage(src);
    if (blobUrl !== src) {
      el.setAttribute('src', blobUrl);
      replaced.push({ el, orig: src, blob: blobUrl });
    }
  }

  // Neutralize transform/filter for clean rasterization
  const prevTransform = node.style.transform;
  const prevFilter = node.style.filter;
  node.style.transform = 'none';
  node.style.filter = 'none';

  // Capture base at 2×
  const baseBlob = await domToBlob(node, {
    ...buildOptions('image/png', baseScale),
    width: rect.width * baseScale,
    height: rect.height * baseScale,
  });
  if (!baseBlob) throw new Error('Base capture failed');

  // Load and upscale manually
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const el = new Image();
    el.onload = () => res(el);
    el.onerror = rej;
    el.src = URL.createObjectURL(baseBlob);
  });

  const canvas = document.createElement('canvas');
  canvas.width = rect.width * finalScale;
  canvas.height = rect.height * finalScale;

  // @ts-ignore
  if ('colorSpace' in canvas) canvas.colorSpace = 'srgb';

  const ctx = canvas.getContext('2d', { alpha: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.setTransform(finalScale / baseScale, 0, 0, finalScale / baseScale, 0, 0);
  ctx.drawImage(img, 0, 0, rect.width * baseScale, rect.height * baseScale);

  URL.revokeObjectURL(img.src);

  // Restore DOM
  node.style.transform = prevTransform;
  node.style.filter = prevFilter;
  for (const r of replaced) {
    r.el.setAttribute('src', r.orig);
    if (r.blob) URL.revokeObjectURL(r.blob);
  }

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject('Export failed')),
      'image/png',
      1.0
    )
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
      showToast('Rendering Retina HD...', 'loading', 1000);
      await waitForFonts();
      if (isIOS()) applyIOSTextFix();

      const scale = Math.min(getSafeScale() * (window.devicePixelRatio || 2), 8);
      const blob = isIOS()
        ? await captureRetinaIOS(node)
        : await domToBlob(node, {
            ...buildOptions('image/png', scale),
            width: node.offsetWidth * scale,
            height: node.offsetHeight * scale,
            style: { transform: 'none', zoom: scale },
          });

      if (isIOS()) removeIOSTextFix();

      if (!blob) throw new Error('Failed to capture');
      await saveBlob(blob, makeFilename(filename, 'png'));
      showToast('✅ Downloaded Retina HD', 'success', 2000);
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
