export type ExportType = 'image/png' | 'image/jpeg';

// --- Core helpers ---
export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function waitForFonts() {
  try {
    const fonts = (document as any).fonts;
    if (fonts?.ready) await fonts.ready;
    else await new Promise((r) => setTimeout(r, 250));
  } catch {}
}

export function makeFilename(base: string, ext = 'png') {
  const safe = (base || 'card').replace(/[^\w.-]+/g, '-').toLowerCase();
  return safe.endsWith(`.${ext}`) ? safe : `${safe}.${ext}`;
}

// --- Safari detection ---
export function isIOS() {
  return (
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !window.MSStream
  );
}

// --- Dynamic iOS text shrink fix ---
let iosFontFixStyle: HTMLStyleElement | null = null;

export function applyIOSFontFix() {
  if (!isIOS()) return;
  if (iosFontFixStyle) return; // already added

  iosFontFixStyle = document.createElement('style');
  iosFontFixStyle.id = 'ios-font-fix';
  iosFontFixStyle.textContent = `
    html, body, * {
      -webkit-text-size-adjust: 100% !important;
      text-size-adjust: 100% !important;
      font-size: inherit !important;
      line-height: normal !important;
      letter-spacing: normal !important;
      text-rendering: geometricPrecision !important;
      -webkit-font-smoothing: antialiased !important;
      zoom: 1 !important;
      transform: scale(1) !important;
    }
  `;
  document.head.appendChild(iosFontFixStyle);
}

export function removeIOSFontFix() {
  if (iosFontFixStyle) {
    iosFontFixStyle.remove();
    iosFontFixStyle = null;
  }
}

// --- Scale + export options ---
export function getSafeScale() {
  const dpr = window.devicePixelRatio || 1;
  const base = 4;
  const corrected = base / Math.min(dpr, 2);
  return clamp(corrected, 2, 6);
}

export function buildOptions(type: ExportType, pixelRatio = 4) {
  return {
    type,
    pixelRatio,
    backgroundColor: null,
    skipAutoScale: true,
    useScaleTransform: false,
    crossOrigin: 'anonymous' as const,
    quality: type === 'image/jpeg' ? 0.98 : undefined,
    style: {
      transform: 'scale(1)',
      zoom: 1,
      fontSize: 'inherit',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textRendering: 'geometricPrecision',
      '-webkit-text-size-adjust': '100%',
      '-webkit-font-smoothing': 'antialiased',
      imageRendering: 'crisp-edges',
    },
  };
}

// --- File saving helpers ---
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
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
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
