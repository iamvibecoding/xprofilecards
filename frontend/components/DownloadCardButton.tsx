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

// --- NEW: Safari high-res capture wrapper ---
async function captureForSafari(node: HTMLElement, scale: number) {
  const rect = node.getBoundingClientRect();

  // Clone the card node
  const clone = node.cloneNode(true) as HTMLElement;
  clone.style.transform = `scale(${scale})`;
  clone.style.transformOrigin = 'top left';
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.position = 'absolute';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.zIndex = '-9999';

  // Wrapper to avoid iOS composition issues
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';
  wrapper.style.width = `${rect.width * scale}px`;
  wrapper.style.height = `${rect.height * scale}px`;
  wrapper.style.overflow = 'hidden';
  wrapper.style.background = 'transparent';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  const blob = await domToBlob(wrapper, {
    ...buildOptions('image/png', 1), // <- already scaled via transform
    width: rect.width * scale,
    height: rect.height * scale,
  });

  wrapper.remove();
  return blob;
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

      // Safari uses transform scale wrapper to maintain size
      const blob = isIOS()
        ? await captureForSafari(node, scale)
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
