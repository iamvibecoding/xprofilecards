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
 * On Safari, scaling the DOM causes black renders for blurred/transparent layers.
 * Instead, capture at 1x and upscale the resulting canvas manually.
 */
async function captureHighResSafari(node: HTMLElement, scale: number) {
  const rect = node.getBoundingClientRect();

  // 1️⃣ capture normal-resolution blob
  const baseBlob = await domToBlob(node, {
    ...buildOptions('image/png', 1),
    width: rect.width,
    height: rect.height,
  });
  if (!baseBlob) throw new Error('Failed base capture');

  // 2️⃣ read it into an <img> and paint to scaled canvas
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
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(img.src);

  // 3️⃣ convert canvas back to blob
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

      // 🧩 use safe upscale on Safari
      const blob = isIOS()
        ? await captureHighResSafari(node, scale)
        : await domToBlob(node, {
            ...buildOptions('image/png', scale),
            width: node.offsetWidth * scale,
            height: node.offsetHeight * scale,
            style: { transform: 'none', zoom: scale },
          });

      if (isIOS()) removeIOSTextFix();

      if (!blob) throw new Error('Failed to capture image');
      await saveBlob(blob, makeFilename(filename, 'png'));
      showToast('✅ Downloaded', 'success', 2000);
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
