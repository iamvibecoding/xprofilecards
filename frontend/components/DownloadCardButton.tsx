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
  applyIOSFontFix,
  removeIOSFontFix,
  isIOS,
} from '@/lib/capture';

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
      showToast('Rendering image...', 'loading', 800);
      await waitForFonts();

      if (isIOS()) applyIOSFontFix();

      const rect = node.getBoundingClientRect();
      const scale = 8;
      const blob = await domToBlob(node, {
        ...buildOptions('image/png', scale),
        width: rect.width * scale,
        height: rect.height * scale,
        style: { transform: 'none', zoom: scale },
      });

      if (isIOS()) removeIOSFontFix();

      if (!blob) throw new Error('Failed to capture image');
      await saveBlob(blob, makeFilename(filename, 'png'));
      showToast('✅ Downloaded', 'success', 2000);
    } catch (err) {
      console.error(err);
      removeIOSFontFix();
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
