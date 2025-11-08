'use client';

import { useRef } from 'react';
import { Download } from 'lucide-react';
import { showToast } from '@/lib/toast';
import {
  buildOptions,
  makeFilename,
  saveBlob,
  waitForFonts,
  getSafeScale,
  isIOS,
  captureIOSUltraHD,
} from '@/lib/capture';

export function DownloadCardButton({
  targetRef,
  filename,
}: {
  targetRef: React.RefObject<HTMLDivElement>;
  filename: string;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleDownload = async () => {
    const node = targetRef.current;
    if (!node) return;

    try {
      showToast('Rendering 4× HD…', 'loading', 900);
      await waitForFonts();

      let blob: Blob | null = null;

      if (isIOS()) {
        // iOS: strict ultra-HD pipeline
        blob = await captureIOSUltraHD(node);
      } else {
        // others: straight hi-DPI capture
        const { domToBlob } = await import('modern-screenshot');
        const scale = Math.min(getSafeScale(), 8);
        blob = await domToBlob(node, {
          ...buildOptions('image/png', scale),
          width: Math.round(node.offsetWidth * scale),
          height: Math.round(node.offsetHeight * scale),
          style: { transform: 'none' as any },
        });
      }

      if (!blob) throw new Error('Capture failed');
      await saveBlob(blob, makeFilename(filename, 'png'));
      showToast('✅ Downloaded (true 4×)', 'success', 1600);
    } catch (e) {
      console.error(e);
      showToast('❌ Export failed', 'error', 2000);
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