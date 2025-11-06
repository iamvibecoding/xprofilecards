'use client';

import { useRef } from 'react';
// Using html-to-image/toJpeg instead of toBlob for JPEG export
import { toJpeg } from 'html-to-image'; 
import { Download } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface DownloadCardButtonProps {
  targetRef: React.RefObject<HTMLDivElement>;
  filename: string;
}

// Helper to convert base64 data URL to Blob (since toJpeg returns a Data URL)
function dataURLtoBlob(dataurl: string): Blob {
    const arr = dataurl.split(',');
    // @ts-ignore
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

async function downloadDataUrl(dataUrl: string, filename: string): Promise<void> {
  // We use the dataUrl directly for download since it's cleaner than converting to Blob then URL.
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function DownloadCardButton({ targetRef, filename }: DownloadCardButtonProps) {
  const downloadRef = useRef<HTMLButtonElement>(null);

  const handleDownload = async () => {
    if (!targetRef.current) return;

    try {
      showToast('Generating image...', 'loading', 2000); 

      const pixelRatio = 3;

      // Using toJpeg for JPEG export
      const dataUrl = await toJpeg(targetRef.current, {
        cacheBust: true,
        pixelRatio, 
        backgroundColor: '#ffffff', // Use solid color for JPEG conversion
        quality: 0.95, // High quality
        // **FIX for iOS Cross-Origin Image Capture**
        fetchRequestInit: { mode: 'cors' }, 
        crossOrigin: 'anonymous', 
      });

      if (!dataUrl) {
        throw new Error('Failed to generate image');
      }

      await downloadDataUrl(dataUrl, filename);

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