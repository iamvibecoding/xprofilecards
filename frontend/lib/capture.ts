// capture.ts
export type ExportType = 'image/png' | 'image/jpeg';

export const isIOS = () =>
  typeof navigator !== 'undefined' &&
  /iP(hone|ad|od)/i.test(navigator.userAgent);

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function waitForFonts() {
  try {
    // @ts-ignore
    if (document?.fonts?.ready) await (document as any).fonts.ready;
  } catch {}
  await new Promise((r) => setTimeout(r, 50));
}

export function makeFilename(base: string, ext = 'png') {
  const safe = (base || 'card').replace(/[^\w.-]+/g, '-').toLowerCase();
  return safe.endsWith(`.${ext}`) ? safe : `${safe}.${ext}`;
}

export function getSafeScale() {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  return clamp(4 * dpr, 2, 8);
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

/* ================== iOS ULTRA-HD PIPELINE ================== */

async function fetchToBlobURL(url: string) {
  if (!url || url.startsWith('data:')) return url;
  try {
    const r = await fetch(url, { mode: 'cors', credentials: 'omit', cache: 'force-cache' });
    return URL.createObjectURL(await r.blob());
  } catch {
    return url;
  }
}

// inline <img src> → blob URLs
async function localizeImages(root: HTMLElement) {
  const swaps: Array<{ el: HTMLImageElement; old: string; obj?: string }> = [];
  const imgs = Array.from(root.querySelectorAll('img'));
  for (const el of imgs) {
    const old = el.getAttribute('src') || '';
    if (!old) continue;
    const obj = await fetchToBlobURL(old);
    if (obj !== old) {
      el.setAttribute('src', obj);
      swaps.push({ el, old, obj });
    }
    el.setAttribute('crossorigin', 'anonymous');
    el.setAttribute('decoding', 'sync');
    el.referrerPolicy = 'no-referrer';
  }
  return () => {
    for (const s of swaps) {
      s.el.setAttribute('src', s.old);
      if (s.obj) URL.revokeObjectURL(s.obj);
    }
  };
}

// inline CSS background-image url(...) → blob URLs
async function inlineBackgrounds(root: HTMLElement) {
  const els = Array.from(root.querySelectorAll<HTMLElement>('*'));
  const revokes: string[] = [];
  const urlRegex = /url\(["']?(.+?)["']?\)/g;

  for (const el of els) {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundImage;
    if (!bg || bg === 'none') continue;

    let newBg = bg;
    let changed = false;
    let match: RegExpExecArray | null;

    urlRegex.lastIndex = 0;
    while ((match = urlRegex.exec(bg))) {
      const url = match[1];
      const blob = await fetchToBlobURL(url);
      if (blob !== url) {
        newBg = newBg.replace(match[0], `url("${blob}")`);
        revokes.push(blob);
        changed = true;
      }
    }

    if (changed) {
      el.style.backgroundImage = newBg;
      el.style.backgroundClip = 'border-box';
    }
  }

  return () => revokes.forEach((u) => URL.revokeObjectURL(u));
}

// strict sandbox clone
function makeSandboxClone(node: HTMLElement, w: number, h: number) {
  const clone = node.cloneNode(true) as HTMLElement;
  const all = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>('*'))];

  for (const el of all) {
    el.style.transform = 'none';
    el.style.filter = 'none';
    el.style.backdropFilter = 'none';
    el.style.willChange = 'auto';
    (el.style as any).webkitTextSizeAdjust = '100%';
    el.style.textRendering = 'geometricPrecision';
    el.style.fontSynthesis = 'none';
  }

  clone.style.width = `${Math.round(w)}px`;
  clone.style.height = `${Math.round(h)}px`;

  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-10000px';
  host.style.top = '0';
  host.style.opacity = '1';
  host.style.pointerEvents = 'none';
  host.style.zIndex = '-1';
  host.appendChild(clone);
  document.body.appendChild(host);

  return { clone, host, dispose: () => host.remove() };
}

// upscale utility
async function loadImage(blob: Blob) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = URL.createObjectURL(blob);
  });
}

function drawHiQ(canvas: HTMLCanvasElement, img: HTMLImageElement, scale: number, w: number, h: number) {
  // @ts-ignore
  if ('colorSpace' in canvas) canvas.colorSpace = 'srgb';
  const ctx = canvas.getContext('2d', { alpha: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.drawImage(img, 0, 0, w, h);
}

// 2× → 4× upscale pipeline
async function progressiveUpscale(base: Blob, w: number, h: number, targetScale: number) {
  const img1 = await loadImage(base);

  // mid 2×
  const mid = document.createElement('canvas');
  mid.width = w * 2;
  mid.height = h * 2;
  drawHiQ(mid, img1, 2, w, h);
  URL.revokeObjectURL(img1.src);

  const midBlob: Blob = await new Promise((res, rej) =>
    mid.toBlob((b) => (b ? res(b) : rej('mid toBlob failed')), 'image/png', 1)
  );

  if (targetScale <= 2) return midBlob;

  const img2 = await loadImage(midBlob);
  const out = document.createElement('canvas');
  out.width = w * targetScale;
  out.height = h * targetScale;
  drawHiQ(out, img2, targetScale / 2, mid.width, mid.height);
  URL.revokeObjectURL(img2.src);

  return await new Promise<Blob>((res, rej) =>
    out.toBlob((b) => (b ? res(b) : rej('final toBlob failed')), 'image/png', 1)
  );
}

/**
 * Capture true 4× ultra-HD snapshot on iOS.
 */
export async function captureIOSUltraHD(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const maxEdge = 4096;
  const targetScale = Math.min(4, Math.max(2, Math.floor(maxEdge / Math.max(rect.width, rect.height))));

  const { clone, dispose } = makeSandboxClone(node, rect.width, rect.height);
  const undoImgs = await localizeImages(clone);
  const undoBgs = await inlineBackgrounds(clone);

  try {
    const { domToBlob } = await import('modern-screenshot');
    const base = await domToBlob(clone, {
      ...buildOptions('image/png', 2),
      width: Math.round(rect.width * 2),
      height: Math.round(rect.height * 2),
    });
    if (!base) throw new Error('Base capture failed');

    return await progressiveUpscale(base, Math.round(rect.width * 2), Math.round(rect.height * 2), targetScale);
  } finally {
    undoBgs();
    undoImgs();
    dispose();
  }
}