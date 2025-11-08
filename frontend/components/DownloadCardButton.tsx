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

/**
 * Button component for exporting profile cards in Ultra-HD,
 * designed to work perfectly across iOS Safari, Chrome, and desktop browsers.
 */
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
      showToast('Rendering Ultra-HD image...', 'loading', 1000);
      await waitForFonts();

      const scale = Math.min(getSafeScale(), 6);
      let blob: Blob | null = null;

      if (isIOS()) {
        // iOS: Use advanced raster + manual 4× redraw
        blob = await captureIOSUltraHD(node);
      } else {
        // Desktop & Android: native modern-screenshot 4×
        const rect = node.getBoundingClientRect();
        blob = await domToBlob(node, {
          ...buildOptions('image/png', scale),
          width: rect.width * scale,
          height: rect.height * scale,
          style: {
            transform: 'none',
            zoom: scale,
          },
        });
      }

      if (!blob) throw new Error('Image generation failed.');

      await saveBlob(blob, makeFilename(filename, 'png'));
      showToast('✅ Downloaded in 4× HD quality', 'success', 1800);
    } catch (err) {
      console.error('Download error:', err);
      showToast('❌ Export failed', 'error', 2200);
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