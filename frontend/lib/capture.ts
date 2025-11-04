'use client';

import { toBlob } from 'html-to-image';

export async function downloadNodeAsPng(
  node: HTMLElement,
  filename = 'card.png',
  pixelRatio = 2
) {
  const blob = await toBlob(node, {
    cacheBust: true,
    pixelRatio,
    backgroundColor: 'transparent',
    imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGD4DwABAgEAiQm4VwAAAABJRU5ErkJggg==',
  });
  
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
