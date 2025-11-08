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
  // small settle so Safari finishes glyph raster
  await new Promise((r) => setTimeout(r, 80));
}

export function makeFilename(base: string, ext = 'png') {
  const safe = (base || 'card').replace(/[^\w.-]+/g, '-').toLowerCase();
  return safe.endsWith(`.${ext}`) ? safe : `${safe}.${ext}`;
}

// iOS can lie about DPR; 4–6× is the sweet spot without hitting mem caps.
export function getSafeScale() {
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 2;
  return clamp(Math.round(dpr * 2), 3, 6);
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
  };
}

export async function saveBlob(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (navigator.canShare?.({ files: [file] })) {
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

/* ──────────────────────────────────────────────────────────
   iOS FIXES
   1) Localize <img> sources to blob: (prevents taint, missing BGs)
   2) 1× clean snapshot (no transforms)
   3) Redraw into true Hi-DPI canvas via ImageBitmap
   ────────────────────────────────────────────────────────── */

async function preloadImage(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;
  try {
    const r = await fetch(url, { mode: 'cors', credentials: 'omit', cache: 'force-cache' });
    const b = await r.blob();
    return URL.createObjectURL(b);
  } catch {
    return url;
  }
}

async function localizeImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll('img'));
  const restores: Array<() => void> = [];
  for (const img of imgs) {
    const src = img.getAttribute('src') || '';
    if (!src) continue;
    const safe = await preloadImage(src);
    if (safe !== src) {
      img.setAttribute('src', safe);
      restores.push(() => {
        img.setAttribute('src', src);
        URL.revokeObjectURL(safe);
      });
    }
    img.setAttribute('crossorigin', 'anonymous');
    img.setAttribute('decoding', 'sync');
    img.referrerPolicy = 'no-referrer';
  }
  return () => restores.forEach((fn) => fn());
}

async function inlineBackgrounds(root: HTMLElement) {
  const els = Array.from(root.querySelectorAll<HTMLElement>('*'));
  const urlRegex = /url\(["']?(.+?)["']?\)/g;
  const revokes: string[] = [];

  for (const el of els) {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundImage;
    if (!bg || bg === 'none') continue;

    let newBg = bg;
    let match: RegExpExecArray | null;
    urlRegex.lastIndex = 0;

    while ((match = urlRegex.exec(bg))) {
      const url = match[1];
      const blobUrl = await preloadImage(url);
      if (blobUrl !== url) {
        newBg = newBg.replace(match[0], `url("${blobUrl}")`);
        revokes.push(blobUrl);
      }
    }
    if (newBg !== bg) {
      el.style.backgroundImage = newBg;
      el.style.backgroundClip = 'border-box';
    }
  }

  return () => revokes.forEach((u) => URL.revokeObjectURL(u));
}

// iOS ultra-HD capture using modern-screenshot for the DOM → then redraw.
export async function captureIOSUltraHD(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const scale = getSafeScale();

  // 0) make a hidden sandbox clone to avoid mutating live UI
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-10000px';
  host.style.top = '0';
  host.style.opacity = '1';
  host.style.pointerEvents = 'none';

  const clone = node.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.filter = 'none';
  clone.style.backdropFilter = 'none';
  clone.style.width = `${Math.round(rect.width)}px`;
  clone.style.height = `${Math.round(rect.height)}px`;
  host.appendChild(clone);
  document.body.appendChild(host);

  const undoImgs = await localizeImages(clone);
  const undoBgs = await inlineBackgrounds(clone);

  try {
    const { domToBlob } = await import('modern-screenshot');

    // 1) 1× clean snapshot (prevents iOS text shrink & BG loss)
    const base = await domToBlob(clone, {
      ...buildOptions('image/png', 1),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    });
    if (!base) throw new Error('Base capture failed');

    // 2) Hi-DPI redraw
    const bitmap = await createImageBitmap(base);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(rect.width * scale);
    canvas.height = Math.round(rect.height * scale);

    const ctx = canvas.getContext('2d', { alpha: true })!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    // 3) Export PNG @ max quality
    const out: Blob = await new Promise((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej('Export failed')), 'image/png', 1.0)
    );

    return out;
  } finally {
    undoBgs();
    undoImgs();
    host.remove();
  }
}