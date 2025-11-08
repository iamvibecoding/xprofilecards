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

const pickMsg = () => VIRAL_MESSAGES[Math.floor(Math.random() * VIRAL_MESSAGES.length)];

// --- Improved iOS high-fidelity capture ---
async function captureUltraHDIOS(node: HTMLElement, scale = 4) {
  const rect = node.getBoundingClientRect();

  // 1️⃣ Capture low-DPI base (fonts correct)
  const baseBlob = await domToBlob(node, {
    ...buildOptions('image/png', 1),
    width: rect.width,
    height: rect.height,
  });
  if (!baseBlob) throw new Error('Base capture failed');

  // 2️⃣ Upscale manually using a canvas that iOS respects
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = URL.createObjectURL(baseBlob);
  });

  const upscale = Math.min(scale, 5); // limit for iOS memory
  const canvas = document.createElement('canvas');
  canvas.width = rect.width * upscale;
  canvas.height = rect.height * upscale;
  // @ts-ignore
  if ('colorSpace' in canvas) canvas.colorSpace = 'srgb';

  const ctx = canvas.getContext('2d', {
    alpha: true,
    willReadFrequently: false,
  })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.scale(upscale, upscale);
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(img.src);

  return await new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob((b) => (b ? resolve(b) : reject('Failed to export')), 'image/png', 1);
    } catch {
      reject('Canvas export failed');
    }
  });
}

const XLogo = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function CardItem({ data, theme }: { data: ProfileData; theme: Theme }) {
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

      const scale = Math.min(getSafeScale() * (window.devicePixelRatio || 2), 8);
      const blob = isIOS()
        ? await captureUltraHDIOS(node, scale)
        : await domToBlob(node, {
            ...buildOptions('image/png', scale),
            width: node.offsetWidth * scale,
            height: node.offsetHeight * scale,
            style: { transform: 'none', zoom: scale },
          });

      if (isIOS()) removeIOSTextFix();
      if (!blob) throw new Error('Image generation failed');

      const filename = makeFilename(baseName, 'png');
      const viral = pickMsg();

      // Copy (non-blocking)
      try {
        if (await copyBlob(blob)) showToast('📋 Copied to clipboard', 'success', 1000);
      } catch {}

      // --- Native Share / Save to Photos ---
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

      // Wait for user to finish sharing before opening app
      if (isIOS()) {
        setTimeout(() => {
          const encoded = encodeURIComponent(viral);
          window.location.href = `twitter://post?message=${encoded}`;
        }, 1200);
      } else {
        const encoded = encodeURIComponent(viral);
        window.location.href = `twitter://post?message=${encoded}`;
      }

      showToast('✨ Opening X App…', 'success', 900);
    } catch (err) {
      console.error(err);
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
        >
          <XLogo className="w-4 h-4" />
          {sharing ? 'Preparing…' : 'Share to X'}
        </button>
      </div>
    </div>
  );
}
