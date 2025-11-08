'use client';

import { useRef } from 'react';
import { Download } from 'lucide-react';
import { showToast } from '@/lib/toast';
import {
  isIOS,
  waitForFonts,
  makeFilename,
  saveBlob,
  buildOptions,
  getSafeScale,
  captureIOSUltraHD,
} from '@/lib/capture';
import { domToBlob } from 'modern-screenshot';

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
      showToast('Rendering Ultra-HD…', 'loading', 900);
      await waitForFonts();

      const scale = Math.min(getSafeScale(), 6);
      let blob: Blob | null;

      if (isIOS()) {
        // iOS path: 1× snapshot → true Hi-DPI redraw
        blob = await captureIOSUltraHD(node);
      } else {
        // Desktop / Android: direct 4–6× capture via modern-screenshot
        const rect = node.getBoundingClientRect();
        blob = await domToBlob(node, {
          ...buildOptions('image/png', scale),
          width: Math.round(rect.width * scale),
          height: Math.round(rect.height * scale),
          style: { transform: 'none', zoom: scale },
        });
      }

      if (!blob) throw new Error('Image generation failed.');
      await saveBlob(blob, makeFilename(filename, 'png'));
      showToast('✅ Downloaded in razor-sharp quality', 'success', 1600);
    } catch (e) {
      console.error(e);
      showToast('❌ Export failed', 'error', 1800);
    }
  };

  return (
    <button
      ref={btnRef}
      onClick={handleDownload}
      type="button"
      className="flex-1 m-1 mr-0 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all"
    >
      <Download className="w-4 h-4" />
      Download
    </button>
  );
}