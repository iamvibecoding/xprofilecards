"use client";

import { useRef, useState, RefObject } from "react"; 
import { ProfileCardPreview } from "@/components/ProfileCardPreview";
import { DownloadCardButton } from "@/components/DownloadCardButton";
// Updated to import toJpeg for JPEG export
import { toJpeg } from "html-to-image"; 
import { showToast } from "@/lib/toast";
import type { Theme } from "@/lib/themes";
import type { ProfileData } from "@/app/page";

interface CardItemProps {
  data: ProfileData;
  theme: Theme;
}

const XLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Helper to convert base64 data URL to Blob for saving/sharing
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

async function saveImageToGallery(dataUrl: string, filename: string): Promise<void> {
  const blob = dataURLtoBlob(dataUrl);
  const file = new File([blob], filename, { type: blob.type });

  // **FIX: Re-enable iOS native sharing to access "Save to Photos"**
  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title: "Save Card" });
      return; // Stop here if native share succeeded
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
         // If native share failed for another reason (e.g., policy), fall through to download link
      } else {
         // If user cancelled, stop processing
         throw new Error("Save cancelled");
      }
    }
  }

  // Standard download fallback
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function copyImageToClipboard(dataUrl: string): Promise<void> {
  const blob = dataURLtoBlob(dataUrl);
  if (!navigator.clipboard?.write)
    throw new Error("Clipboard API not supported");
  
  // Use window.ClipboardItem for broad compatibility
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
// Viral messages array truncated for brevity
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
  // Updated filename extension to .jpeg
  const filename = `${Date.now()}-${cleanHandle}-${theme.id}.jpeg`;

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    showToast("⬇️ Generating image...", "loading", 1000);

    try {
      const pixelRatio = 3;

      // Using toJpeg for JPEG export
      const dataUrl = await withTimeout(
        toJpeg(cardRef.current, {
          cacheBust: true,
          pixelRatio,
          backgroundColor: "#ffffff", // Use solid color for JPEG conversion
          quality: 0.95, // High quality
          // **FIX for iOS Cross-Origin Image Capture**
          fetchRequestInit: { mode: 'cors' }, 
          crossOrigin: 'anonymous', 
        }),
        8000
      );

      if (!dataUrl) throw new Error("Image generation failed");

      showToast("💾 Saving image to gallery...", "loading", 1000);
      await saveImageToGallery(dataUrl, filename); // Save using Data URL

      try {
        await copyImageToClipboard(dataUrl);
        showToast("📋 Copied to clipboard!", "success", 1200);
      } catch {
        showToast("⚠️ Clipboard unsupported, saved only", "info", 1200);
      }

      // Smart Redirect to X app/web
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