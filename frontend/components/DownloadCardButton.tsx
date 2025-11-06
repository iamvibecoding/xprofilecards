'use client';

import { useRef } from 'react';
import { toBlob } from 'html-to-image'; 
import { Download } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface DownloadCardButtonProps {
  targetRef: React.RefObject<HTMLDivElement>;
  filename: string;
}

async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function DownloadCardButton({ targetRef, filename }: DownloadCardButtonProps) {
  const downloadRef = useRef<HTMLButtonElement>(null);

  const handleDownload = async () => {
    if (!targetRef.current) return;

    try {
      showToast('Generating image...', 'loading', 0); 

      const pixelRatio = 3;

      const blob = await toBlob(targetRef.current, {
        cacheBust: true,
        pixelRatio, 
        backgroundColor: 'transparent',
        canvasHeight: targetRef.current.offsetHeight * pixelRatio,
        canvasWidth: targetRef.current.offsetWidth * pixelRatio,
        imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGD4DwABAgEAiQm4VwAAAABJRU5ErkJggg==',
        // **FIX for iOS Cross-Origin Image Capture**
        fetchRequestInit: { mode: 'cors' }, 
        crossOrigin: 'anonymous', 
      });

      if (!blob) {
        throw new Error('Failed to generate image');
      }

      await downloadBlob(blob, filename);

      showToast('✨ Downloaded successfully!', 'success', 2000);
    } catch (error) {
      console.error('Download error:', error);
      showToast('❌ Download failed', 'error', 3000);
    }
  };

  return (
  <button
    ref={downloadRef}
    onClick={handleDownload}
    className="flex-1 m-1 mr-0 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all"
    title="Download card as PNG"
  >
    <Download className="w-4 h-4" />
    Download
  </button>
);

}