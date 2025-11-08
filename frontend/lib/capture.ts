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

/** normalized scale that respects devicePixelRatio */
export function getSafeScale() {
  const dpr = window.devicePixelRatio || 1;
  const base = 6 / dpr; // ~6x logical scale → ~18x physical on DPR3
  return clamp(base, 3, 6);
}

export function buildOptions(type: ExportType, pixelRatio = 6) {
  return {
    type,
    pixelRatio: clamp(pixelRatio, 4, 8),
    backgroundColor: null,
    skipAutoScale: true,
    useScaleTransform: false,
    crossOrigin: 'anonymous' as const,
    quality: type === 'image/jpeg' ? 0.99 : undefined,
    style: {
      transform: 'none',
      zoom: 1,
      fontSize: '100%',
      imageRendering: 'crisp-edges',
      '-webkit-font-smoothing': 'antialiased',
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
