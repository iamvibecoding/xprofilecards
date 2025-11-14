'use client';

import { useRef, useState, RefObject } from 'react';
import { ProfileCardPreview } from '@/components/ProfileCardPreview';
import { DownloadCardButton } from '@/components/DownloadCardButton';
import { showToast } from '@/lib/toast';
import { domToPng } from 'modern-screenshot';
import {
  copyBlob,
  makeFilename,
  saveBlob,
  waitForFonts,
  getSafeScale,
  isIOS,
  applyIOSTextFix,
  removeIOSTextFix,
} from '@/lib/capture';
import type { Theme } from '@/lib/themes';
import type { ProfileData } from '@/app/page';

const VIRAL_MESSAGES = [
  "Just upgraded my X profile — clean, bold, and built to stand out.\n\nMade it in seconds → https://xprofilecards.com",
  "Your profile is your first impression. Make it look intentional.\n\nBuilt mine with X Profile Cards → https://xprofilecards.com",
  "This hits different.\n\nMy new X card looks like something straight out of a design keynote.\n\nhttps://xprofilecards.com",
  "Small detail. Big difference.\n\nTurned my X profile into a brand with one click.\n\nhttps://xprofilecards.com",
  "Built my new X card today — clean, premium, and way more *me*.\n\nSee why everyone's switching → https://xprofilecards.com",
];

const pickMsg = () => VIRAL_MESSAGES[Math.floor(Math.random() * VIRAL_MESSAGES.length)];

const XLogo = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

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
      const scale = getSafeScale();
      
      const dataUrl = await domToPng(node, {
        scale,
        quality: 1,
        backgroundColor: null,
        style: {
          margin: '0',
          padding: '0',
        },
      });

      if (isIOS()) removeIOSTextFix();

      const res = await fetch(dataUrl);
      const blob = await res.blob();

      if (!blob || blob.size === 0) {
        throw new Error('Generated empty image');
      }

      return blob;
    } catch (error: any) {
      if (isIOS()) removeIOSTextFix();
      const msg = error?.message || 'Capture failed';
      console.error('Capture error:', msg);
      throw new Error(msg);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      showToast('Rendering...', 'loading', 800);
      const blob = await captureCard();
      const filename = makeFilename(baseName, 'png');
      const viral = pickMsg();

      try {
        if (await copyBlob(blob)) showToast('📋 Copied to clipboard', 'success', 1000);
      } catch {}

      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My X Profile Card',
          text: viral,
        });
        showToast('📸 Saved to Photos', 'success', 1800);
      } else {
        await saveBlob(blob, filename, { useShare: false });
        showToast('💾 Saved image', 'success', 1200);
      }

      const encoded = encodeURIComponent(viral);
      if (isIOS()) {
        setTimeout(() => {
          window.location.href = `twitter://post?message=${encoded}`;
        }, 1200);
      } else {
        window.location.href = `twitter://post?message=${encoded}`;
      }

      showToast('✨ Opening X App…', 'success', 900);
    } catch (err: any) {
      const msg = err?.message || 'Share failed';
      console.error('Share error:', err);
      showToast(`❌ ${msg}`, 'error', 2000);
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      showToast('Rendering...', 'loading', 800);
      const blob = await captureCard();
      const filename = makeFilename(baseName, 'png');
      await saveBlob(blob, filename, { useShare: false });
      showToast('💾 Downloaded!', 'success', 1500);
    } catch (err: any) {
      const msg = err?.message || 'Download failed';
      console.error('Download error:', err);
      showToast(`❌ ${msg}`, 'error', 2000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div ref={cardRef}>
        <ProfileCardPreview data={data} theme={theme} />
      </div>
      <div className="flex gap-2">
        <DownloadCardButton onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Downloading…' : '💾 Download'}
        </DownloadCardButton>
        <DownloadCardButton onClick={handleShare} disabled={sharing}>
          <XLogo className="w-4 h-4" />
          {sharing ? 'Preparing…' : 'Share to X'}
        </DownloadCardButton>
      </div>
    </div>
  );
}
