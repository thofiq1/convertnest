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
