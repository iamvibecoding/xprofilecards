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
  "Built my new X card today — clean, premium, and way more *me*.\n\nSee why everyone’s switching → https://xprofilecards.com",
];

function getRandomViralMessage() {
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
      if (isIOS()) applyIOSTextFix();

      const rect = node.getBoundingClientRect();
      const scale = getSafeScale();
      const blob = await domToBlob(node, {
        ...buildOptions('image/png', scale),
        width: rect.width * scale,
        height: rect.height * scale,
      });

      if (isIOS()) removeIOSTextFix();
      if (!blob) throw new Error('Image generation failed');

      const filename = makeFilename(baseName, 'png');
      try {
        if (await copyBlob(blob)) showToast('📋 Copied to clipboard', 'success', 1200);
      } catch {}

      await saveBlob(blob, filename, { useShare: true });

      // --- Open X ---
      const text = encodeURIComponent(getRandomViralMessage());
      const appLink = `twitter://post?message=${text}`;
      const webLink = `https://x.com/intent/tweet?text=${text}`;

      const openXApp = () => {
        const start = Date.now();
        window.location.href = appLink;
        setTimeout(() => {
          if (Date.now() - start < 1500)
            window.open(webLink, '_blank', 'width=550,height=700,menubar=no,toolbar=no');
        }, 1500);
      };

      showToast('✨ Opening X…', 'success', 800);

      // Run inside a trusted gesture on iOS
      if (isIOS()) openXApp();
      else requestAnimationFrame(openXApp);
    } catch (e) {
      console.error(e);
      showToast('❌ Share failed', 'error', 2000);
    } finally {
      if (isIOS()) removeIOSTextFix();
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
