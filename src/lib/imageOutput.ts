// Small shared helpers for the client-side image tools.

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/avif": "avif",
};

/** File extension for the MIME type a blob actually has (canvas falls back to PNG if a type is unsupported). */
export function extFromMime(mime: string, fallback = "jpg"): string {
  return MIME_EXT[(mime || "").toLowerCase()] || fallback;
}

/** Output MIME for "Keep original": canvas can only write PNG, WebP or JPEG. */
export function originalOutputMime(fileType: string): string {
  return fileType === "image/png" ? "image/png" : fileType === "image/webp" ? "image/webp" : "image/jpeg";
}

export function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

export function fileExt(name: string): string {
  const m = name.match(/\.([^.]+)$/);
  return m ? m[1].toLowerCase() : "";
}

/** Returns `name`, or "name (2).ext", "name (3).ext"… if it is already in `used`. Adds the result to `used`. */
export function uniqueName(name: string, used: Set<string>): string {
  let candidate = name;
  let n = 2;
  const m = name.match(/^(.*?)(\.[^.]+)?$/);
  const stem = m?.[1] ?? name;
  const ext = m?.[2] ?? "";
  while (used.has(candidate.toLowerCase())) {
    candidate = `${stem} (${n})${ext}`;
    n++;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

export function isHeicFile(f: File): boolean {
  const ext = fileExt(f.name);
  return ext === "heic" || ext === "heif" || f.type === "image/heic" || f.type === "image/heif";
}

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif", "bmp", "avif", "heic", "heif", "tif", "tiff", "ico", "svg"]);

/** True if the file looks like an image (by MIME type or extension). */
export function isImageFile(f: File): boolean {
  return f.type.startsWith("image/") || IMAGE_EXTS.has(fileExt(f.name));
}

export function unsupportedFileMessage(f: File, what = "a supported image"): string {
  return `${f.name} isn't ${what}`;
}

export const HEIC_HINT = "HEIC isn't supported here — use HEIC to JPG first";

/** User-facing message when the browser couldn't decode an image. */
export function decodeErrorMessage(f: File): string {
  if (isHeicFile(f)) return HEIC_HINT;
  return `Couldn't open ${f.name} — it may be damaged or in a format your browser can't read`;
}

/** Sniff the real format from the first bytes, ignoring the file extension. */
export function sniffImageType(b: Uint8Array): "jpeg" | "png" | "other" {
  if (b[0] === 0xff && b[1] === 0xd8) return "jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  return "other";
}

/** EXIF orientation (1–8) of a JPEG, or 1 when absent/unreadable. */
export function jpegOrientation(b: Uint8Array): number {
  try {
    const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
    if (v.getUint16(0) !== 0xffd8) return 1;
    let off = 2;
    while (off + 4 < v.byteLength) {
      const marker = v.getUint16(off);
      if ((marker & 0xff00) !== 0xff00) return 1;
      const len = v.getUint16(off + 2);
      if (marker === 0xffe1 && v.getUint32(off + 4) === 0x45786966) {
        const tiff = off + 10;
        const le = v.getUint16(tiff) === 0x4949;
        const ifd = tiff + v.getUint32(tiff + 4, le);
        const n = v.getUint16(ifd, le);
        for (let i = 0; i < n; i++) {
          const e = ifd + 2 + i * 12;
          if (v.getUint16(e, le) === 0x0112) {
            const o = v.getUint16(e + 8, le);
            return o >= 1 && o <= 8 ? o : 1;
          }
        }
        return 1;
      }
      if (marker === 0xffda) return 1;
      off += 2 + len;
    }
  } catch { /* unreadable */ }
  return 1;
}
