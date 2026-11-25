// Helpers for producing a JPG at exact pixel dimensions within a KB range,
// as many exam and visa portals require (e.g. 140 x 60 px, 10–20 KB).

export interface SizePreset {
  id: string;
  label: string; // e.g. "Photo · 200 × 230 px · 20–50 KB"
  width: number;
  height: number;
  minKb?: number;
  maxKb: number;
  // cover = fill the frame and crop the edges (photos);
  // contain = fit inside on a white background (signatures, so no ink is cut off)
  fit: "cover" | "contain";
}

export function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read this image. Try a JPG, PNG or WebP file.")); };
    img.src = url;
  });
}

// Draws the image into an exact w x h canvas (white background).
export function drawExact(img: HTMLImageElement, w: number, h: number, fit: "cover" | "contain"): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingQuality = "high";
  const sw = img.naturalWidth, sh = img.naturalHeight;
  const scale = fit === "cover" ? Math.max(w / sw, h / sh) : Math.min(w / sw, h / sh);
  const dw = sw * scale, dh = sh * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  return canvas;
}

export function canvasToJpeg(canvas: HTMLCanvasElement, q: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Compression failed"))), "image/jpeg", q)
  );
}

// Best JPG quality for a fixed canvas that stays under maxBytes.
export async function bestQualityUnder(canvas: HTMLCanvasElement, maxBytes: number) {
  const top = await canvasToJpeg(canvas, 1);
  if (top.size <= maxBytes) return { blob: top, q: 1, reached: true };
  let lo = 0.1, hi = 1, found: { blob: Blob; q: number } | null = null;
  for (let i = 0; i < 8; i++) {
    const mid = (lo + hi) / 2;
    const blob = await canvasToJpeg(canvas, mid);
    if (blob.size <= maxBytes) { found = { blob, q: mid }; lo = mid; } else { hi = mid; }
  }
  if (found) return { ...found, reached: true };
  const blob = await canvasToJpeg(canvas, 0.1);
  return { blob, q: 0.1, reached: blob.size <= maxBytes };
}

// Some portals reject files *below* a minimum size. A small image at top
// quality can be smaller than that, so we add a JPEG comment segment
// (ignored by every viewer — the picture itself is unchanged) to reach it.
export async function padJpegTo(blob: Blob, minBytes: number): Promise<Blob> {
  if (blob.size >= minBytes) return blob;
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return blob;
  let needed = minBytes - bytes.length;
  const segments: Uint8Array[] = [];
  while (needed > 0) {
    // COM segment: FF FE + 2-byte length (includes the length bytes) + data
    const payload = Math.min(65533, Math.max(1, needed - 4));
    const seg = new Uint8Array(4 + payload);
    seg[0] = 0xff; seg[1] = 0xfe;
    seg[2] = ((payload + 2) >> 8) & 0xff; seg[3] = (payload + 2) & 0xff;
    seg.fill(0x20, 4); // spaces
    segments.push(seg);
    needed -= seg.length;
  }
  const out = new Uint8Array(bytes.length + segments.reduce((n, s) => n + s.length, 0));
  out.set(bytes.subarray(0, 2), 0);
  let off = 2;
  for (const s of segments) { out.set(s, off); off += s.length; }
  out.set(bytes.subarray(2), off);
  return new Blob([out], { type: "image/jpeg" });
}
