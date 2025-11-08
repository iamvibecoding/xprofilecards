'use client';

import { useRef } from 'react';
import { domToBlob as toBlob } from 'modern-screenshot';
import { Download } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface DownloadCardButtonProps {
  targetRef: React.RefObject<HTMLDivElement>;
  filename: string;
}

export function DownloadCardButton({ targetRef, filename }: DownloadCardButtonProps) {
  const downloadRef = useRef<HTMLButtonElement>(null);

  const handleDownload = async (): Promise<void> => {
    const node = targetRef.current;
    if (!node) return;

    try {
      showToast('Generating image...', 'loading', 2000);

      const blob = await toBlob(node, {
        type: 'image/jpeg',
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        skipAutoScale: false,
        crossOrigin: 'anonymous',
      });

      if (!blob) throw new Error('Failed to generate image.');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

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
      title="Download card as JPEG"
    >
      <Download className="w-4 h-4" />
      Download
    </button>
  );
}
