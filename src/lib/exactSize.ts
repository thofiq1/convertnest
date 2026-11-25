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
export function drawExact(img: HTMLImageElement | HTMLCanvasElement, w: number, h: number, fit: "cover" | "contain"): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingQuality = "high";
  const sw = img instanceof HTMLImageElement ? img.naturalWidth : img.width;
  const sh = img instanceof HTMLImageElement ? img.naturalHeight : img.height;
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

// For signatures, thumb impressions and handwritten declarations: make the
// paper evenly white and the ink darker, like a scanner app. Phone photos of
// paper are grey and unevenly lit, and thin strokes fade when shrunk to
// e.g. 140 x 60 px. Works on the original image, before resizing:
// 1) estimate the paper brightness everywhere (local maximum, then blurred),
// 2) divide it out to flatten shadows, 3) levels so paper = white, ink = dark.
export function cleanSource(img: HTMLImageElement, target?: { w: number; h: number }): HTMLCanvasElement {
  const maxSide = 1200;
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const W = Math.max(1, Math.round(img.naturalWidth * scale));
  const H = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(img, 0, 0, W, H);
  const data = ctx.getImageData(0, 0, W, H);
  const px = data.data;
  const n = W * H;
  const lum = new Float32Array(n);
  for (let i = 0, j = 0; j < n; i += 4, j++) lum[j] = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];

  const r = Math.max(4, Math.round(Math.max(W, H) / 60));
  const tmp = new Float32Array(n);
  const bg = new Float32Array(n);
  // Separable max filter (paper is the brightest thing nearby).
  for (let y = 0; y < H; y++) {
    const row = y * W;
    for (let x = 0; x < W; x++) {
      let m = 0;
      const x0 = Math.max(0, x - r), x1 = Math.min(W - 1, x + r);
      for (let k = x0; k <= x1; k++) if (lum[row + k] > m) m = lum[row + k];
      tmp[row + x] = m;
    }
  }
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      let m = 0;
      const y0 = Math.max(0, y - r), y1 = Math.min(H - 1, y + r);
      for (let k = y0; k <= y1; k++) if (tmp[k * W + x] > m) m = tmp[k * W + x];
      bg[y * W + x] = m;
    }
  }
  // Separable box blur to smooth the background estimate.
  for (let y = 0; y < H; y++) {
    const row = y * W;
    let acc = 0, cnt = 0;
    for (let x = 0; x < Math.min(W, r); x++) { acc += bg[row + x]; cnt++; }
    for (let x = 0; x < W; x++) {
      if (x + r < W) { acc += bg[row + x + r]; cnt++; }
      if (x - r - 1 >= 0) { acc -= bg[row + x - r - 1]; cnt--; }
      tmp[row + x] = acc / cnt;
    }
  }
  for (let x = 0; x < W; x++) {
    let acc = 0, cnt = 0;
    for (let y = 0; y < Math.min(H, r); y++) { acc += tmp[y * W + x]; cnt++; }
    for (let y = 0; y < H; y++) {
      if (y + r < H) { acc += tmp[(y + r) * W + x]; cnt++; }
      if (y - r - 1 >= 0) { acc -= tmp[(y - r - 1) * W + x]; cnt--; }
      bg[y * W + x] = acc / cnt;
    }
  }
  // Flatten lighting, then levels: below LOW -> black, above HIGH -> white.
  const LOW = 70, HIGH = 225, span = HIGH - LOW;
  for (let i = 0, j = 0; j < n; i += 4, j++) {
    const b = Math.max(bg[j], 1);
    for (let c = 0; c < 3; c++) {
      const flat = (px[i + c] / b) * 255;
      const v = ((flat - LOW) / span) * 255;
      px[i + c] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }
  // When the image will be shrunk a lot (e.g. a phone photo to 140 x 60),
  // thin pen strokes end up thinner than a pixel and turn pale. Thicken
  // dark strokes a little (min filter) in proportion to the reduction.
  if (target) {
    const fitScale = Math.min(target.w / W, target.h / H);
    const reduction = 1 / fitScale;
    const rad = Math.min(4, Math.floor(reduction / 4));
    if (rad >= 1) {
      const src = new Uint8ClampedArray(px);
      for (let pass = 0; pass < 2; pass++) {
        // pass 0: horizontal (src -> px), pass 1: vertical (copy -> px)
        const from = pass === 0 ? src : new Uint8ClampedArray(px);
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const o = (y * W + x) * 4;
            let mr = 255, mg = 255, mb = 255, ml = 766;
            for (let k = -rad; k <= rad; k++) {
              const xx = pass === 0 ? Math.min(W - 1, Math.max(0, x + k)) : x;
              const yy = pass === 1 ? Math.min(H - 1, Math.max(0, y + k)) : y;
              const q = (yy * W + xx) * 4;
              const l = from[q] + from[q + 1] + from[q + 2];
              if (l < ml) { ml = l; mr = from[q]; mg = from[q + 1]; mb = from[q + 2]; }
            }
            px[o] = mr; px[o + 1] = mg; px[o + 2] = mb;
          }
        }
      }
    }
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

// Notes to show the user about the source image vs the target frame.
export function frameWarnings(img: HTMLImageElement, w: number, h: number, fit: "cover" | "contain"): string[] {
  const out: string[] = [];
  const srcAR = img.naturalWidth / img.naturalHeight;
  const dstAR = w / h;
  if (fit === "contain" && Math.abs(Math.log(srcAR / dstAR)) > Math.log(1.6)) {
    out.push(
      `Your image's shape (${img.naturalWidth} × ${img.naturalHeight}) is very different from ${w} × ${h}, so it was shrunk to fit with white space around it. Crop it close to the writing first for a bigger, clearer result.`
    );
  }
  if (fit === "cover" && (img.naturalWidth < w || img.naturalHeight < h)) {
    out.push(
      `Your photo (${img.naturalWidth} × ${img.naturalHeight}) is smaller than ${w} × ${h}, so it was enlarged and may look slightly soft. Use a larger original if you have one.`
    );
  }
  return out;
}
