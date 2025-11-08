'use client';

import { useRef, useState, RefObject } from 'react';
import { ProfileCardPreview } from '@/components/ProfileCardPreview';
import { DownloadCardButton } from '@/components/DownloadCardButton';
import { showToast } from '@/lib/toast';
import { domToBlob } from 'modern-screenshot';
import {
  buildOptions,
  copyBlob,
  makeFilename,
  saveBlob,
  waitForFonts,
  getSafeScale,
  prepareSafariCapture,
  cleanupSafariCapture,
} from '@/lib/capture';
import type { Theme } from '@/lib/themes';
import type { ProfileData } from '@/app/page';

const VIRAL_MESSAGES = [
  "Just upgraded my X profile — clean, bold, and built to stand out.\n\nMade it in seconds → https://xprofilecards.com",
  "Your profile is your first impression. Make it look intentional.\n\nBuilt mine with X Profile Cards → https://xprofilecards.com",
  "This hits different.\n\nMy new X card looks like something straight out of a design keynote.\n\nhttps://xprofilecards.com",
  "Small detail. Big difference.\n\nTurned my X profile into a brand with one click.\n\nhttps://xprofilecards.com",
  "Built my new X card today — clean, premium, and way more *me*.\n\nSee why everyone’s switching → https://xprofilecards.com",
];

function getRandomViralMessage(): string {
  return VIRAL_MESSAGES[Math.floor(Math.random() * VIRAL_MESSAGES.length)];
}

const XLogo = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface CardItemProps {
  data: ProfileData;
  theme: Theme;
}

export function CardItem({ data, theme }: CardItemProps) {
  const cardRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  const cleanHandle = data.handle?.replace(/[@\s]/g, '') || 'card';
  const baseName = `${Date.now()}-${cleanHandle}-${theme.id}`;

  const handleShare = async () => {
    const node = cardRef.current;
    if (!node) return;
    setSharing(true);

    try {
      showToast('Rendering...', 'loading', 800);
      await waitForFonts();

      const rect = node.getBoundingClientRect();
      const scale = getSafeScale();
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      // iOS font scaling fix
      if (isIOS) prepareSafariCapture(node);

      const originalTransform = node.style.transform;
      const originalZoom = node.style.zoom;
      node.style.transform = 'none';
      node.style.zoom = '1';

      const blob = await domToBlob(node, {
        ...buildOptions('image/png', scale),
        width: rect.width * scale,
        height: rect.height * scale,
      });

      node.style.transform = originalTransform;
      node.style.zoom = originalZoom;
      if (isIOS) cleanupSafariCapture(node);

      if (!blob) throw new Error('Image generation failed');
      const filename = makeFilename(baseName, 'png');

      // Copy to clipboard
      try {
        if (await copyBlob(blob)) showToast('📋 Copied to clipboard', 'success', 1000);
      } catch {}

      // Native iOS/Android share
      if (navigator.canShare?.({ files: [new File([blob], filename)] })) {
        try {
          await navigator.share({
            files: [new File([blob], filename)],
            title: 'My X Profile Card',
            text: getRandomViralMessage(),
          });
          showToast('📸 Saved to Photos', 'success', 1200);
        } catch (err: any) {
          if (err?.name !== 'AbortError') console.warn('Share failed:', err);
        }
      } else {
        await saveBlob(blob, filename, { useShare: false });
        showToast('💾 Saved image', 'success', 1200);
      }

      // --- Safari-safe deep-link (no double launch) ---
      const text = encodeURIComponent(getRandomViralMessage());
      const appLink = `twitter://post?message=${text}`;
      const webLink = `https://x.com/intent/tweet?text=${text}`;
      const timeout = 1500;
      const start = Date.now();

      showToast('✨ Opening X…', 'success', 1000);
      window.location.href = appLink;

      setTimeout(() => {
        const elapsed = Date.now() - start;
        if (elapsed < timeout + 200) {
          window.open(
            webLink,
            '_blank',
            'width=550,height=700,menubar=no,toolbar=no'
          );
        }
      }, timeout);
    } catch (err) {
      console.error(err);
      showToast('❌ Share failed', 'error', 1800);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="bg-transparent w-full flex flex-col gap-4">
      <ProfileCardPreview ref={cardRef} data={data} theme={theme} />
      <div className="flex gap-3 w-full justify-center">
        <DownloadCardButton targetRef={cardRef} filename={baseName} />
        <button
          type="button"
          onClick={handleShare}
          disabled={sharing}
          className="flex-1 m-1 ml-0 py-3 bg-black text-white rounded-full text-sm font-bold shadow-md hover:bg-gray-900 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          title="Copy, save, and post on X"
        >
          <XLogo className="w-4 h-4" />
          {sharing ? 'Preparing…' : 'Share to X'}
        </button>
      </div>
    </div>
  );
}
