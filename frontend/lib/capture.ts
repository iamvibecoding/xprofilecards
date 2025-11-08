'use client';

import { domToBlob as toBlob } from 'modern-screenshot';

/**
 * Downloads an HTML node as a PNG image.
 * Works across Safari, Chrome, Firefox, and iOS.
 */
export async function downloadNodeAsPng(
  node: HTMLElement,
  filename = 'card.png',
  pixelRatio = 2,
  backgroundColor = 'transparent'
): Promise<void> {
  if (!node) throw new Error('Target node not found.');

  const blob = await toBlob(node, {
    type: 'image/png',
    pixelRatio,
    backgroundColor,
    skipAutoScale: false,
    crossOrigin: 'anonymous',
  });

  if (!blob) throw new Error('Failed to capture node as image.');

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Returns a PNG Blob of a DOM node (for sharing or upload).
 */
export async function getNodeAsBlob(
  node: HTMLElement,
  pixelRatio = 2,
  backgroundColor = 'transparent'
): Promise<Blob> {
  if (!node) throw new Error('Target node not found.');

  const blob = await toBlob(node, {
    type: 'image/png',
    pixelRatio,
    backgroundColor,
    skipAutoScale: false,
    crossOrigin: 'anonymous',
  });

  if (!blob) throw new Error('Image blob creation failed.');
  return blob;
}
