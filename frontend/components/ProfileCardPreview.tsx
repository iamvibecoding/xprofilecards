"use client";

import { useRef, useState, RefObject, forwardRef, useEffect } from "react";
import React from 'react';

// --- Dependency Adapters / Mocks ---
// We cannot rely on external modules (html-to-image, dom-to-image) being available,
// so we'll rely on the parent environment to provide image generation capability,
// using an adapter that safely fails if the function isn't provided globally.
declare global {
  interface Window {
    domtoimage: {
      toBlob: (node: HTMLElement, options: any) => Promise<Blob>;
    };
  }
}

// Adapter for 'toBlob' - Attempts to use a global function, otherwise throws.
async function toBlobAdapter(node: HTMLElement, options: any): Promise<Blob> {
  // Check for a globally available image generation library (e.g., domtoimage, html2canvas)
  if (typeof (window as any).domtoimage !== 'undefined' && (window as any).domtoimage.toBlob) {
    try {
      return await (window as any).domtoimage.toBlob(node, options);
    } catch (e) {
      console.error("Image generation (dom-to-image) failed:", e);
      throw new Error("Image generation failed with global library.");
    }
  }
  
  // FINAL FALLBACK: Throw a clear error that the necessary library is missing.
  throw new Error("Image generation library (dom-to-image or html-to-image) not available.");
}
const toBlob = toBlobAdapter; 
import { Download } from 'lucide-react'; 

// --- TYPE DEFINITIONS ---
type Theme = any; 
interface ProfileData {
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  followingCount: string;
  followersCount: string;
  location: string | null;
  website: string | null;
}

interface CardItemProps {
  data: ProfileData;
  theme: Theme;
}
interface ProfileCardPreviewProps {
  data: ProfileData;
  theme: Theme;
}
interface DownloadCardButtonProps {
  targetRef: React.RefObject<HTMLDivElement>;
  filename: string;
}

// --- UTILITY: Toast Placeholder ---
const showToast = (message: string, type: 'loading' | 'success' | 'error' | 'info', duration: number = 3000) => {
  console.log(`[Toast ${type.toUpperCase()}]: ${message}`);
};


// --- UTILITY: Image Helpers ---

const AVATAR_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"%3E%3Cdefs%3E%3CradialGradient id="g" cx="50%25" cy="35%25" r="75%25"%3E%3Cstop offset="0%25" stop-color="%2394a3b8"/%3E%3Cstop offset="100%25" stop-color="%23475569"/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx="64" cy="64" r="64" fill="url(%23g)"/%3E%3Ccircle cx="64" cy="52" r="22" fill="rgba(255,255,255,0.85)"/%3E%3Cpath d="M24 110a40 28 0 0 1 80 0" fill="rgba(255,255,255,0.85)"/%3E%3C/svg%3E';

function formatCount(count: string | number): string {
  if (!count && count !== 0) return '0';

  const num = typeof count === 'string'
    ? parseFloat(count.replace(/,/g, ''))
    : count;

  if (isNaN(num) || !isFinite(num)) return '0';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1_000_000_000) {
    const billions = absNum / 1_000_000_000;
    return sign + (billions >= 10 ? billions.toFixed(0) : billions.toFixed(1)) + 'B';
  }

  if (absNum >= 1_000_000) {
    const millions = absNum / 1_000_000;
    return sign + (millions >= 10 ? millions.toFixed(0) : millions.toFixed(1)) + 'M';
  }

  if (absNum >= 1_000) {
    const thousands = absNum / 1_000;
    return sign + (thousands >= 10 ? thousands.toFixed(0) : thousands.toFixed(1)) + 'K';
  }

  return sign + absNum.toString();
}

// --- COMPONENT: VerifiedIcon (Inline SVG) ---
const VerifiedIcon = ({
  color = '#1D9BF0',
  className = 'inline-flex items-center align-middle',
}: {
  color?: string;
  className?: string;
}) => (
  <span className={className}>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 16 16" 
      className="w-3 h-3 flex-shrink-0"
      fill={color} 
      role="img" 
      aria-label="Verified account"
    >
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022l-4.2 4.6-1.543-1.493a.75.75 0 0 0-1.07.014a.75.75 0 0 0-.014 1.082l2 1.95a.75.75 0 0 0 1.07.016l4.75-5.25a.75.75 0 0 0-.012-1.08z"/>
    </svg>
  </span>
);

// --- COMPONENT: ProfileCardPreview (Inlined) ---
export const ProfileCardPreview = forwardRef<HTMLDivElement, ProfileCardPreviewProps>(
  ({ data, theme }, ref) => {
    const bioRef = useRef<HTMLParagraphElement>(null);
    
    function useIsMobile(): boolean {
      const [isMobile, setIsMobile] = useState(false);

      useEffect(() => {
        if (typeof window !== 'undefined') {
          setIsMobile(window.innerWidth < 768);

          const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
          };

          window.addEventListener('resize', handleResize);
          return () => window.removeEventListener('resize', handleResize);
        }
        return () => {}; 
      }, []);

      return isMobile;
    }
    
    const isMobile = useIsMobile(); 

    useEffect(() => {
      if (bioRef.current && data.bio && !isMobile) {
        const maxHeight = bioRef.current.parentElement?.offsetHeight || 100; 
        const scrollHeight = bioRef.current.scrollHeight;

        if (scrollHeight > maxHeight * 1.15) {
          let fontSize = parseFloat(window.getComputedStyle(bioRef.current).fontSize);
          let attempts = 0;

          while (bioRef.current.scrollHeight > maxHeight * 1.1 && fontSize > 6 && attempts < 3) {
            fontSize -= 0.5;
            bioRef.current.style.fontSize = fontSize + 'px';
            attempts++;
          }
        }
      }
    }, [data.bio, isMobile]);

    const avatarSrc = data.avatarUrl
      ? `https://wsrv.nl/?url=${encodeURIComponent(data.avatarUrl)}&w=128&h=128&fit=cover&output=webp`
      : AVATAR_FALLBACK;

    const formattedFollowers = formatCount(data.followersCount);
    const formattedFollowing = formatCount(data.followingCount);

    return (
      <div className="relative w-full aspect-video">
        <div
          ref={ref}
          // FIX: Removing transition-shadow duration-300 to eliminate any built-in hover/animation effects
          className="relative w-full h-full overflow-hidden shadow-2xl" 
        >
          <img
            src={theme.image || '/themes/city.png'} 
            alt={theme.name || 'Theme background'}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/themes/city.png';
            }}
          />

          <div
            className={`
              absolute
              flex flex-col px-4
              transition-all duration-300
              ${theme.cardClassName}
              ${
                isMobile
                  ? 'left-[12px] right-[12px] top-[10px] bottom-[12px] px-[6px] py-[4px] gap-[3px] justify-between' 
                  : 'left-[clamp(8px,1.8vw,18px)] right-[clamp(8px,1.8vw,18px)] top-[clamp(6px,1.2vw,14px)] bottom-[clamp(8px,1.8vw,18px)] px-[clamp(6px,1vw,12px)] py-[clamp(4px,0.7vw,6px)] gap-[clamp(4px,0.8vw,6px)]'
              }
            `}
          >
            {/* Top Section: Avatar + Profile Info */}
            <div className="relative z-10 w-full flex flex-col flex-grow">
              {/* Avatar */}
              <img
                src={avatarSrc}
                alt={`${data.name}'s avatar`}
                className={`
                  rounded-full border-white/50 object-cover
                  ${
                  isMobile
                    ? 'w-[32px] h-[32px] border-[1px] ring-0.5 ring-white/50 mb-[1px]' 
                    : 'w-[clamp(20px,2.8vw,28px)] h-[clamp(20px,2.8vw,28px)] border-[clamp(0.5px,0.15vw,1px)] ring-0.5 ring-white/50 mb-[clamp(3px,0.5vw,4px)]'
                }

                `}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK;
                }}
              />

              {/* Name with Verified */}
              <div className="w-full mt-1 overflow-hidden">
                <h2
                  className={`
                    font-bold flex items-center
                    ${theme.textColor}
                    ${isMobile ? 'text-[13px] leading-tight' : 'text-[clamp(10px,1.1vw,13px)] leading-tight'} 
                    gap-[1px]
                    truncate
                  `}
                >
                  <span className="inline truncate">{data.name}</span>
                  <VerifiedIcon 
                    color={theme.accentColor || '#1D9BF0'}
                    className={`inline-flex flex-shrink-0 items-center ${
                      isMobile ? 'text-[13px] ml-[1px]' : 'text-[clamp(8px,0.9vw,11px)] ml-[1px]'
                    }`}
                  />
                </h2>
              </div>

              {/* Handle */}
              <p
                className={`
                  ${theme.handleColor}
                  truncate
                  ${isMobile ? 'text-[10px] mb-[0px]' : 'text-[clamp(8px,0.9vw,10px)] mb-[clamp(2px,0.4vw,3px)]'} 
                `}
                title={data.handle}
              >
                {data.handle}
              </p>

              {/* Bio */}
              {data.bio && (
                <div className="flex-grow min-h-0 w-full">
                  <p
                    ref={bioRef}
                    className={`
                      ${theme.textColor}
                      max-w-full relative z-10 break-words overflow-hidden
                      ${isMobile 
                        ? 'text-[9px] leading-snug' 
                        : 'text-[clamp(8px,0.9vw,11px)] leading-relaxed'
                      }
                    `}
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: isMobile ? 3 : (data.bio.length > 200 ? 4 : (data.bio.length > 100 ? 3 : 2)), 
                      overflow: 'hidden',
                      lineHeight: isMobile ? '1.1' : '1.5', 
                    }}
                    title={data.bio}
                  >
                    {data.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Section: Stats */}
            <div
              className={`
                flex gap-[2px] relative z-10 p-1 ${theme.statColor}
                leading-tight whitespace-nowrap text-nowrap
                ${isMobile ? 'text-[9px] mt-[1px]' : 'text-[clamp(8px,0.9vw,10px)] mt-[clamp(2px,0.4vw,3px)]'}
              `}
            >
              <p className="truncate">
                <span className={`font-bold ${theme.textColor}`}>{formattedFollowing}</span>
                <span className="ml-0.5">Following</span>
              </p>
              <p className="truncate">
                <span className={`font-bold ${theme.textColor}`}>{formattedFollowers}</span>
                <span className="ml-0.5">Followers</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ProfileCardPreview.displayName = 'ProfileCardPreview';


// --- COMPONENT: DownloadCardButton (Inlined) ---

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
      });

      if (!blob) {
        throw new Error('Failed to generate image');
      }

      await downloadBlob(blob, filename);

      showToast('✨ Downloaded successfully!', 'success', 2000);
    } catch (error) {
      console.error('Download error:', error);
      const msg = error instanceof Error ? error.message : "Unknown download error";
      showToast(`❌ Download failed: ${msg.includes("library") ? "Image library missing" : "Try again"}`, 'error', 3000);
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

// --- COMPONENT: CardItem (The main exported component) ---

const XLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Reworked to use the standard download link method for maximum compatibility
async function saveImageToGallery(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function copyImageToClipboard(blob: Blob): Promise<void> {
  if (!navigator.clipboard?.write)
    throw new Error("Clipboard API not supported");
  
  const item = new (window as any).ClipboardItem({ [blob.type]: blob });
  await navigator.clipboard.write([item]);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error("Timeout: Image generation took too long")),
        timeoutMs
      )
    ),
  ]);
}

// Keep viral messages array (Truncated for brevity)
const VIRAL_MESSAGES = [
  "Just dropped my X Profile Card — this thing looks unreal 🎨\n\n26+ handcrafted themes • instant export • no sign-up needed\n\nMake yours now → https://xprofilecards.com",
  "Design that actually *feels* premium 🔥\n\nCreated my X Profile Card in seconds — 26+ beautiful themes and zero hassle.\n\nTry it free → https://xprofilecards.com",
  "Your profile deserves a glow-up ✨\n\nX Profile Cards gives you 26+ stunning themes, instant previews, and one-click downloads.\n\nFree and fast → https://xprofilecards.com",
];

function getRandomViralMessage(): string {
  return VIRAL_MESSAGES[Math.floor(Math.random() * VIRAL_MESSAGES.length)];
}

export function CardItem({ data, theme }: CardItemProps) {
  const cardRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  const cleanHandle = data.handle?.replace(/[@\s]/g, "") || "card";
  const filename = `${Date.now()}-${cleanHandle}-${theme.id}.png`;

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    showToast("⬇️ Generating image...", "loading", 1000);

    try {
      const pixelRatio = 3;

      const blob = await withTimeout(
        toBlob(cardRef.current, {
          cacheBust: true,
          pixelRatio,
          backgroundColor: "transparent",
          canvasHeight: cardRef.current.offsetHeight * pixelRatio,
          canvasWidth: cardRef.current.offsetWidth * pixelRatio,
          imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGD4DwABAgEAiQm4VwAAAABJRU5ErkJggg==',
        }),
        8000
      );

      if (!blob) throw new Error("Image generation failed");

      // 1. Save (Download) the image to the user's device/gallery first
      showToast("💾 Saving image to gallery...", "loading", 1000);
      await saveImageToGallery(blob, filename);

      // 2. Attempt to copy to clipboard (optional but nice UX)
      try {
        await copyImageToClipboard(blob);
        showToast("📋 Copied to clipboard!", "success", 1200);
      } catch {
        showToast("⚠️ Clipboard unsupported, saved only", "info", 1200);
      }

      // 3. Smart Redirect to X app/web
      const shareText = getRandomViralMessage();
      const encodedText = encodeURIComponent(shareText);
      const appLink = `twitter://post?message=${encodedText}`;
      const webLink = `https://x.com/intent/tweet?text=${encodedText}`;
      
      const timeout = 1500; 
      const now = Date.now();

      showToast("✨ Opening X...", "success", 1500);
      
      window.location.href = appLink;

      setTimeout(() => {
        if (Date.now() - now < timeout + 200) {
          window.open(
            webLink,
            "_blank",
            "width=550,height=700,menubar=no,toolbar=no"
          );
        }
      }, timeout);

    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      if (msg.includes("Timeout"))
        showToast("⏱️ Image generation timeout.", "error", 3000);
      else if (msg.includes("Save cancelled"))
        showToast("Save cancelled", "info", 2000);
      else if (msg.includes("Image generation library"))
        showToast("❌ Image generation library not found. Cannot download/share.", "error", 5000);
      else showToast("❌ Share failed. Try download instead.", "error", 3000);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="bg-transparent w-full flex flex-col gap-4">
      <ProfileCardPreview ref={cardRef} data={data} theme={theme} />
      <div className="bg-transparent flex gap-3 w-full justify-center">
        <DownloadCardButton targetRef={cardRef} filename={filename} />
        <button
          type="button"
          onClick={handleShare}
          disabled={sharing}
          className="flex-1 m-1 ml-0 py-3 bg-black text-white rounded-full text-sm font-bold shadow-md hover:bg-gray-900 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          title="Download image & open X to post"
        >
          <XLogo className="w-4 h-4" />
          {sharing ? "Downloading..." : "Share to X"}
        </button>
      </div>
    </div>
  );
}