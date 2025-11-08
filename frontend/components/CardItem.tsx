'use client';

import { useRef, useState } from 'react';
import { domToBlob } from 'modern-screenshot';
import { showToast } from '@/lib/toast';
import { ProfileCardPreview } from '@/components/ProfileCardPreview';
import { DownloadCardButton } from '@/components/DownloadCardButton';
import {
  buildOptions,
  waitForFonts,
  makeFilename,
  copyBlob,
  getSafeScale,
  saveBlob,
  isIOS,
} from '@/lib/capture';

const MESSAGES = [
  "Just upgraded my X profile — clean, bold, and built to stand out. https://xprofilecards.com",
  "This hits different. My new X card looks like something straight out of a design keynote. https://xprofilecards.com",
  "Built my new X card today — clean, premium, and way more *me*. https://xprofilecards.com",
];
const msg = () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

export function CardItem({ data, theme }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    const node = ref.current;
    if (!node) return;
    setSharing(true);

    try {
      showToast('Preparing HD share...', 'loading', 800);
      await waitForFonts();

      const scale = getSafeScale();
      const blob = await domToBlob(node, {
        ...buildOptions('image/png', scale),
        width: node.offsetWidth * scale,
        height: node.offsetHeight * scale,
      });
      if (!blob) throw new Error('Failed to render image');

      const filename = makeFilename('xprofilecard', 'png');
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My X Profile Card',
          text: msg(),
        });
        showToast('📸 Saved or shared successfully!', 'success', 1200);
      } else {
        await saveBlob(blob, filename);
        showToast('💾 Saved locally', 'success', 1200);
      }

      const encoded = encodeURIComponent(msg());
      const appLink = `twitter://post?message=${encoded}`;
      const webLink = `https://x.com/intent/tweet?text=${encoded}`;
      const start = Date.now();

      window.location.href = appLink;
      setTimeout(() => {
        if (Date.now() - start < 1500) window.open(webLink, '_blank');
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast('❌ Share failed', 'error', 1800);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <ProfileCardPreview ref={ref} data={data} theme={theme} />
      <div className="flex gap-3 justify-center">
        <DownloadCardButton targetRef={ref} filename="xprofilecard" />
        <button
          disabled={sharing}
          onClick={handleShare}
          className="flex-1 m-1 ml-0 py-3 bg-black text-white rounded-full text-sm font-bold shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z" />
          </svg>
          {sharing ? 'Preparing…' : 'Share to X'}
        </button>
      </div>
    </div>
  );
}