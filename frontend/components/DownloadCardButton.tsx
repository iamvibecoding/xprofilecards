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

/* ---------- helpers ---------- */

// Fetch <img src> to a same-origin Blob URL so Safari won’t taint the canvas.
async function toLocalUrl(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;
  try {
    const res = await fetch(url, { mode: 'cors', cache: 'force-cache', credentials: 'omit' });
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return url;
  }
}

// Preload all <img> descendants and swap to blob URLs. Returns a cleanup function.
async function localizeImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll('img'));
  const swaps: Array<{ el: HTMLImageElement; old: string; obj?: string }> = [];
  for (const el of imgs) {
    const old = el.getAttribute('src') || '';
    if (!old) continue;
    const obj = await toLocalUrl(old);
    if (obj !== old) {
      el.setAttribute('src', obj);
      swaps.push({ el, old, obj });
    }
  }
  return () => {
    for (const s of swaps) {
      if (s.obj) URL.revokeObjectURL(s.obj);
      s.el.setAttribute('src', s.old);
    }
  };
}

// Draw one image onto a canvas with max quality (bicubic-ish).
function drawHiQ(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  scale: number,
  w: number,
  h: number
) {
  // @ts-ignore
  if ('colorSpace' in canvas) canvas.colorSpace = 'srgb';
  const ctx = canvas.getContext('2d', { alpha: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.drawImage(img, 0, 0, w, h);
}

// Progressive upscale (2× then 4×) to keep edges super crisp.
async function progressiveUpscale(baseBlob: Blob, baseW: number, baseH: number, targetScale = 4) {
  const load = (blob: Blob) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = URL.createObjectURL(blob);
    });

  // 2× stage
  const img1 = await load(baseBlob);
  await img1.decode?.();
  const midCanvas = document.createElement('canvas');
  midCanvas.width = Math.floor(baseW * 2);
  midCanvas.height = Math.floor(baseH * 2);
  drawHiQ(midCanvas, img1, 2, baseW, baseH);
  URL.revokeObjectURL(img1.src);

  const midBlob: Blob = await new Promise((res, rej) =>
    midCanvas.toBlob((b) => (b ? res(b) : rej(new Error('mid toBlob failed'))), 'image/png', 1)
  );

  if (targetScale <= 2) return midBlob;

  // 4× stage
  const img2 = await load(midBlob);
  await img2.decode?.();
  const outCanvas = document.createElement('canvas');
  outCanvas.width = Math.floor(baseW * targetScale);
  outCanvas.height = Math.floor(baseH * targetScale);
  drawHiQ(outCanvas, img2, targetScale / 2, midCanvas.width, midCanvas.height);
  URL.revokeObjectURL(img2.src);

  return await new Promise<Blob>((res, rej) =>
    outCanvas.toBlob((b) => (b ? res(b) : rej(new Error('final toBlob failed'))), 'image/png', 1)
  );
}

/* ---------- iOS pipeline ---------- */

async function captureTrueHDIOS(node: HTMLElement, desiredScale = 4) {
  // Cap scale to Safari’s ~4096px canvas edge
  const rect = node.getBoundingClientRect();
  const maxEdge = 4096;
  const safeScale = Math.max(
    2,
    Math.min(
      desiredScale,
      Math.floor(maxEdge / Math.max(rect.width, rect.height)) || 2
    )
  );

  // Swap all <img> to same-origin blobs (fix missing background)
  const restore = await localizeImages(node);

  // Disable transforms/filters that cause WebKit soft rasterization
  const prevTransform = node.style.transform;
  const prevFilter = node.style.filter;
  node.style.transform = 'none';
  node.style.filter = 'none';

  try {
    // Base snapshot at 2× if possible (sharper glyphs than 1×)
    const baseScale = Math.min(2, safeScale);
    const baseBlob = await domToBlob(node, {
      ...buildOptions('image/png', baseScale),
      width: rect.width * baseScale,
      height: rect.height * baseScale,
      // IMPORTANT: no extra style overrides; we already neutralized transforms above
    });

    if (!baseBlob) throw new Error('Base capture failed');

    // If safeScale == 2, we’re done. Else progressively upscale to 4×.
    if (safeScale <= 2) return baseBlob;

    return await progressiveUpscale(
      baseBlob,
      rect.width * baseScale,
      rect.height * baseScale,
      Math.min(4, safeScale)
    );
  } finally {
    // restore DOM
    node.style.transform = prevTransform;
    node.style.filter = prevFilter;
    restore();
  }
}

/* ---------- component ---------- */

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
      showToast('Rendering 4× HD…', 'loading', 900);
      await waitForFonts();
      if (isIOS()) applyIOSTextFix();

      const dpr = Math.max(2, window.devicePixelRatio || 1);
      const desktopScale = Math.min(getSafeScale() * dpr, 8); // non-iOS

      // iOS: bulletproof 4× pipeline; Desktop/Android: direct hi-DPI render
      const blob = isIOS()
        ? await captureTrueHDIOS(node, 4)
        : await domToBlob(node, {
            ...buildOptions('image/png', desktopScale),
            width: node.offsetWidth * desktopScale,
            height: node.offsetHeight * desktopScale,
            style: { transform: 'none', zoom: desktopScale },
          });

      if (!blob) throw new Error('Failed to capture image');

      await saveBlob(blob, makeFilename(filename, 'png'));
      showToast('✅ Downloaded (true 4×)', 'success', 1600);
    } catch (err) {
      console.error(err);
      showToast('❌ Export failed', 'error', 2000);
    } finally {
      if (isIOS()) removeIOSTextFix();
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
