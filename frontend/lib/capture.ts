// capture.ts
export type ExportType = 'image/png' | 'image/jpeg';

export const isIOS = () =>
  typeof navigator !== 'undefined' && /iP(hone|ad|od)/i.test(navigator.userAgent);

export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export async function waitForFonts() {
  try {
    // @ts-ignore
    if (document.fonts?.ready) await document.fonts.ready;
  } catch {}
  await new Promise((r) => setTimeout(r, 100));
}

export function makeFilename(base: string, ext = 'png') {
  const safe = (base || 'card').replace(/[^\w.-]+/g, '-').toLowerCase();
  return safe.endsWith(`.${ext}`) ? safe : `${safe}.${ext}`;
}

export const getSafeScale = () =>
  clamp((window.devicePixelRatio || 2) * 2, 2, 6);

export function buildOptions(type: ExportType, pixelRatio = 4) {
  return {
    type,
    pixelRatio,
    backgroundColor: null,
    skipAutoScale: true,
    useScaleTransform: false,
    crossOrigin: 'anonymous' as const,
    quality: type === 'image/jpeg' ? 0.98 : undefined,
  };
}

export async function saveBlob(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch (e) {
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

/* -------------------------------------------
   🧠 iOS FIX: Full Raster + True-DPI Scaling
   ------------------------------------------- */
async function preloadImage(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;
  try {
    const r = await fetch(url, { mode: 'cors', credentials: 'omit' });
    const blob = await r.blob();
    return URL.createObjectURL(blob);
  } catch {
    return url;
  }
}

async function localizeImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll('img'));
  const restores: Array<() => void> = [];
  for (const img of imgs) {
    const src = img.getAttribute('src');
    if (!src) continue;
    const safe = await preloadImage(src);
    if (safe !== src) {
      img.setAttribute('src', safe);
      restores.push(() => {
        img.setAttribute('src', src);
        URL.revokeObjectURL(safe);
      });
    }
  }
  return () => restores.forEach((fn) => fn());
}

export async function captureIOSUltraHD(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const scale = getSafeScale();

  // Preload images
  const restoreImages = await localizeImages(node);

  // Disable transforms that break rasterization
  const prev = {
    transform: node.style.transform,
    filter: node.style.filter,
    backdrop: node.style.backdropFilter,
  };
  node.style.transform = 'none';
  node.style.filter = 'none';
  node.style.backdropFilter = 'none';

  // Import modern-screenshot dynamically
  const { domToBlob } = await import('modern-screenshot');

  // Step 1: Capture at 1×
  const base = await domToBlob(node, {
    ...buildOptions('image/png', 1),
    width: rect.width,
    height: rect.height,
  });
  if (!base) throw new Error('Base capture failed');

  // Step 2: True high-res redraw
  const img = await createImageBitmap(base);
  const canvas = document.createElement('canvas');
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;

  const ctx = canvas.getContext('2d', { alpha: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0);
  img.close();

  // Step 3: Export in full 4× DPI
  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej('Export failed')), 'image/png', 1.0)
  );

  // Restore
  Object.assign(node.style, prev);
  restoreImages();

  return blob;
}