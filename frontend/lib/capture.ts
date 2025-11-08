export type ExportType = 'image/png' | 'image/jpeg';

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

/**
 * Normalize capture scale so text doesn’t shrink on high-DPR screens
 */
export function getSafeScale() {
  const dpr = window.devicePixelRatio || 1;
  // Safari over-scales fonts when DPR > 2, so correct it
  const base = 4;
  const corrected = base / Math.min(dpr, 2);
  return clamp(corrected, 2, 5);
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
      fontSize: 'calc(1rem * 1.0)',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textRendering: 'geometricPrecision',
      '-webkit-text-size-adjust': '100%',
      '-webkit-font-smoothing': 'antialiased',
      imageRendering: 'crisp-edges',
    },
  };
}

export async function saveBlob(
  blob: Blob,
  filename: string,
  opts?: { useShare?: boolean }
) {
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
