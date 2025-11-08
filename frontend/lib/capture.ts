export type ExportType = 'image/png' | 'image/jpeg';

// Clamp helper
export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// Detect iOS Safari
export function isIOS() {
  return (
    typeof navigator !== 'undefined' &&
    /iP(ad|hone|od)/.test(navigator.userAgent)
  );
}

// Fix text rendering on iOS before capture
export function applyIOSTextFix() {
  const el = document.documentElement;
  el.style.webkitTextSizeAdjust = '100%';
  el.style.textRendering = 'geometricPrecision';
  el.style.webkitFontSmoothing = 'antialiased';
  document.body.style.transform = 'scale(1)';
  document.body.style.transformOrigin = 'top left';
}

// Cleanup after capture
export function removeIOSTextFix() {
  const el = document.documentElement;
  el.style.webkitTextSizeAdjust = '';
  el.style.textRendering = '';
  el.style.webkitFontSmoothing = '';
  document.body.style.transform = '';
  document.body.style.transformOrigin = '';
}

// Wait for web fonts to load before screenshot
export async function waitForFonts() {
  try {
    const fonts = (document as any).fonts;
    if (fonts?.ready) await fonts.ready;
  } catch {
    await new Promise((r) => setTimeout(r, 250));
  }
}

// Safe filename
export function makeFilename(base: string, ext = 'png') {
  const safe = (base || 'card').replace(/[^\w.-]+/g, '-').toLowerCase();
  return safe.endsWith(`.${ext}`) ? safe : `${safe}.${ext}`;
}

// Scale: balanced for Safari (prevents black screen)
export function getSafeScale() {
  const dpr = window.devicePixelRatio || 1;
  return clamp(dpr * 3, 3, 6);
}

// Standard screenshot options
export function buildOptions(type: ExportType, pixelRatio = 4) {
  return {
    type,
    pixelRatio,
    backgroundColor: null,
    skipAutoScale: true,
    crossOrigin: 'anonymous' as const,
    quality: type === 'image/jpeg' ? 0.98 : undefined,
  };
}

// Manual upscale pass (2× for iOS Safari)
export async function upscaleBlob(blob: Blob, scale = 2): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const el = new Image();
    el.onload = () => res(el);
    el.onerror = rej;
    el.src = URL.createObjectURL(blob);
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(img.src);

  return new Promise((r) => canvas.toBlob((b) => r(b!), 'image/png', 1.0));
}

// Save as file or open iOS Share Sheet
export async function saveBlob(blob: Blob, filename: string, opts?: { useShare?: boolean }) {
  const { useShare = false } = opts || {};
  const file = new File([blob], filename, { type: blob.type });

  if (useShare && navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyBlob(blob: Blob) {
  if (!('ClipboardItem' in window) || !navigator.clipboard?.write) return false;
  try {
    const item = new (window as any).ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch {
    return false;
  }
}
