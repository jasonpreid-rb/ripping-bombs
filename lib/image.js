// lib/image.js
//
// Client-side image compression for drive evidence photos.
//
// Photos are currently stored as base64 data URIs in entries.photo, so an
// uncompressed phone photo or screenshot (often 3-10 MB) means every drive
// popup downloads that whole string from Supabase. Shrinking the image before
// it is stored keeps the popup fast. Small files and anything that fails to
// decode fall back to the original untouched behaviour (toB64).

import { toB64 } from './constants';

export async function toCompressedB64(file, { maxDim = 1600, quality = 0.78 } = {}) {
  // Already small — not worth re-encoding (and avoids needless quality loss).
  if (!file || file.size <= 400 * 1024) return toB64(file);

  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    URL.revokeObjectURL(url);

    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    // White background so transparent PNG screenshots don't turn black as JPEG.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return toB64(file);
  }
}
