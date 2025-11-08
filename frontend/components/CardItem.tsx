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

// ------------------- Viral Text -------------------
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

// ------------------- Helper: iOS HD Capture -------------------
async function captureHighResIOS(node: HTMLElement, scale: number) {
  const rect = node.getBoundingClientRect();

  const baseBlob = await domToBlob(node, {
    ...buildOptions('image/png', 1),
    width: rect.width,
    height: rect.height,
  });
  if (!baseBlob) throw new Error('Base capture failed');

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = URL.createObjectURL(baseBlob);
  });

  const canvas = document.createElement('canvas');
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(img.src);

  return await new Promise<Blob | null>((res) =>
    canvas.toBlob((b) => res(b), 'image/png', 1.0)
  );
}

// ------------------- UI -------------------
const XLogo = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface CardItemProps {
  data: ProfileData;
  theme: Theme;
}

// ------------------- Main Component -------------------
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

      const scale = getSafeScale();
      const blob = isIOS()
        ? await captureHighResIOS(node, scale)
        : await domToBlob(node, {
            ...buildOptions('image/png', scale),
            width: node.offsetWidth * scale,
            height: node.offsetHeight * scale,
            style: { transform: 'none', zoom: scale },
          });

      if (isIOS()) removeIOSTextFix();
      if (!blob) throw new Error('Image generation failed');

      const filename = makeFilename(baseName, 'png');

      try {
        if (await copyBlob(blob))
          showToast('📋 Copied to clipboard', 'success', 1200);
      } catch {}

      // --- Native Share (iOS "Save to Photos") ---
      if (navigator.canShare?.({ files: [new File([blob], filename)] })) {
        try {
          await navigator.share({
            files: [new File([blob], filename)],
            title: 'My X Profile Card',
            text: getRandomViralMessage(),
          });
          showToast('📸 Saved to Photos', 'success', 1500);
        } catch (err: any) {
          if (err?.name !== 'AbortError')
            console.warn('Share failed:', err);
        }
      } else {
        await saveBlob(blob, filename, { useShare: false });
        showToast('💾 Saved image', 'success', 1200);
      }

      // --- Open X (App first, fallback to Web) ---
      const text = encodeURIComponent(getRandomViralMessage());
      const appLink = `twitter://post?message=${text}`;
      const webLink = `https://x.com/intent/tweet?text=${text}`;

      const openXApp = () => {
        const start = Date.now();
        window.location.href = appLink;
        setTimeout(() => {
          if (Date.now() - start < 1500)
            window.open(webLink, '_blank');
        }, 1500);
      };

      showToast('✨ Opening X…', 'success', 800);
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
