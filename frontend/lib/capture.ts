export type ExportType = 'image/png' | 'image/jpeg';

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function isIOS() {
  return (
    typeof navigator !== 'undefined' &&
    /iP(ad|hone|od)/.test(navigator.userAgent)
  );
}

export function applyIOSTextFix() {
  const el = document.documentElement;
  el.style.webkitTextSizeAdjust = '100%';
  el.style.textRendering = 'geometricPrecision';
  el.style.webkitFontSmoothing = 'antialiased';
  document.body.style.transform = 'scale(1)';
  document.body.style.transformOrigin = 'top left';
}

export function removeIOSTextFix() {
  const el = document.documentElement;
  el.style.webkitTextSizeAdjust = '';
  el.style.textRendering = '';
  el.style.webkitFontSmoothing = '';
  document.body.style.transform = '';
  document.body.style.transformOrigin = '';
}

export async function waitForFonts() {
  try {
    const fonts = (document as any).fonts;
    if (fonts?.ready) await fonts.ready;
  } catch {
    await new Promise((r) => setTimeout(r, 250));
  }
}

export function makeFilename(base: string, ext = 'png') {
  const safe = (base || 'card').replace(/[^\w.-]+/g, '-').toLowerCase();
  return safe.endsWith(`.${ext}`) ? safe : `${safe}.${ext}`;
}

export function getSafeScale() {
  const dpr = window.devicePixelRatio || 1;
  return clamp(dpr * 2, 2, 4);
}

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
