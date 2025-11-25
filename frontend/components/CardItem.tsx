'use client';

import { useRef, useState, RefObject } from 'react';
import { ProfileCardPreview } from '@/components/ProfileCardPreview';
import { showToast } from '@/lib/toast';
import { domToPng } from 'modern-screenshot';
import {
  copyBlob, makeFilename, saveBlob, waitForFonts, getSafeScale, isIOS, applyIOSTextFix, removeIOSTextFix,
} from '@/lib/capture';
import type { Theme } from '@/lib/themes';
import type { ProfileData } from '@/app/page';
import { Download } from 'lucide-react';

// X Logo Component
const XLogo = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const VIRAL_MESSAGES = [
  "Just upgraded my X profile. Clean, bold, and built to stand out.\n\nGenerate yours → https://xprofilecards.com",
  "Your profile is your first impression. Make it count.\n\nCreated with X Profile Cards → https://xprofilecards.com",
  "This hits different. My new X card looks straight out of a keynote.\n\nhttps://xprofilecards.com",
  "Small detail. Big difference. Turned my profile into a brand.\n\nhttps://xprofilecards.com",
];

const pickMsg = () => VIRAL_MESSAGES[Math.floor(Math.random() * VIRAL_MESSAGES.length)];

export function CardItem({ data, theme }: { data: ProfileData; theme: Theme }) {
  const cardRef: RefObject<HTMLDivElement> = useRef(null);
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cleanHandle = data.handle?.replace(/[@\s]/g, '') || 'card';
  const baseName = `${Date.now()}-${cleanHandle}-${theme.id}`;

  const captureCard = async (): Promise<Blob> => {
    const node = cardRef.current;
    if (!node) throw new Error('Card not ready');
    await waitForFonts();
    await new Promise(r => setTimeout(r, 500));
    if (isIOS()) applyIOSTextFix();

    try {
      const dataUrl = await domToPng(node, {
        scale: getSafeScale(),
        quality: 1,
        backgroundColor: null,
        style: { margin: '0', padding: '0' },
      });
      if (isIOS()) removeIOSTextFix();
      const res = await fetch(dataUrl);
      return await res.blob();
    } catch (error: any) {
      if (isIOS()) removeIOSTextFix();
      throw new Error(error?.message || 'Capture failed');
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      showToast('Preparing...', 'loading', 800);
      const blob = await captureCard();
      const file = new File([blob], makeFilename(baseName, 'png'), { type: 'image/png' });
      const text = pickMsg();

      // Check if it's mobile/tablet to prioritize native share
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // Priority 1: Native Web Share API (Mobile/Tablet)
      if (isMobile && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'My X Profile Card',
            text: text,
          });
          showToast('Shared successfully', 'success', 2000);
          return; // Exit if share was successful or initiated
        } catch (shareError: any) {
          if (shareError.name !== 'AbortError') {
             // If share fails (not cancelled), continue to fallback
             console.warn('Native share failed, trying fallback', shareError);
          } else {
            return; // User cancelled share
          }
        }
      } 
      
      // Priority 2: Fallback to Clipboard + App Launch (Desktop or failed mobile share)
      await copyBlob(blob);
      showToast('Image copied! Opening X...', 'success', 2000);
      
      const encodedText = encodeURIComponent(text);
      const appUrl = `twitter://post?message=${encodedText}`;
      const webUrl = `https://x.com/intent/tweet?text=${encodedText}`;

      if (isMobile) {
        // Try to open the app directly
        window.location.href = appUrl;
        
        // Fallback to web if app doesn't open within a short timeout
        setTimeout(() => {
           window.open(webUrl, '_blank');
        }, 1500);
      } else {
        // Desktop: Open web intent directly
        window.open(webUrl, '_blank');
      }

    } catch (err: any) {
      console.error(err);
      if (err.name !== 'AbortError') {
         showToast('Could not share automatically. Image saved.', 'error', 3000);
         // Last resort: just download it
         try {
             const blob = await captureCard();
             await saveBlob(blob, makeFilename(baseName, 'png'), { useShare: false });
         } catch {}
      }
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const blob = await captureCard();
      await saveBlob(blob, makeFilename(baseName, 'png'), { useShare: false });
      showToast('Saved to device', 'success', 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div ref={cardRef}>
        <ProfileCardPreview data={data} theme={theme} />
      </div>
      
      {/* Action Bar - X Style */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-black border-t border-slate-100 dark:border-[#2f3336]">
        <button 
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {downloading ? 'Saving...' : <><Download className="w-4 h-4" /> Save</>}
        </button>
        
        <div className="w-3" /> {/* Spacer */}
        
        <button 
          onClick={handleShare}
          disabled={sharing}
          className="flex-1 flex items-center justify-center gap-2 h-9 rounded-full border border-slate-300 dark:border-[#536471] text-slate-700 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-[#1d1f23] transition-colors disabled:opacity-50"
        >
          {sharing ? '...' : <><XLogo className="w-4 h-4" /> Share</>}
        </button>
      </div>
    </div>
  );
}