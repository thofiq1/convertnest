"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { validateFileSize, isDuplicateFile } from "@/utils/fileValidation";
import { extFromMime, baseName, uniqueName, isHeicFile, isImageFile, unsupportedFileMessage, decodeErrorMessage } from "@/lib/imageOutput";

interface ConvertedImage {
  file: File;
  previewUrl: string;
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  originalSize: number;
  convertedSize: number;
  processing: boolean;
  /** Extension matching the bytes in convertedBlob (set when the result is produced). */
  outExt: string;
  /** Output format setting used to produce this result. */
  fmtUsed: string;
  error: string | null;
}

export default function ImageConverter() {
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [outputFormat, setOutputFormat] = useState<"jpeg" | "png" | "webp">("png");
  const [quality, setQuality] = useState(92);
  const [dragOver, setDragOver] = useState(false);

  const [sizeWarnings, setSizeWarnings] = useState<string[]>([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
        if (img.convertedUrl) URL.revokeObjectURL(img.convertedUrl);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warn before leaving page with active work
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (images.length > 0 || images.some((img) => img.processing)) { e.preventDefault(); }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [images]);

  const convertImage = async (file: File, fmt: string, q: number): Promise<{ blob: Blob; url: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(decodeErrorMessage(file))); };
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(url); reject(new Error("Canvas not supported")); return; }
        // For non-transparent formats, fill white background
        if (fmt === "jpeg" || fmt === "bmp") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);

        const mimeMap: Record<string, string> = {
          jpeg: "image/jpeg", png: "image/png", webp: "image/webp", bmp: "image/bmp",
        };
        const mimeType = mimeMap[fmt] || "image/png";
        const qualityParam = (fmt === "png" || fmt === "bmp") ? undefined : q / 100;

        canvas.toBlob(
          (blob) => {
            if (!blob) { URL.revokeObjectURL(url); reject(new Error("Failed to convert image")); return; }
            const convUrl = URL.createObjectURL(blob);
            canvas.width = 0;
            canvas.height = 0;
            URL.revokeObjectURL(url);
            resolve({ blob, url: convUrl });
          },
          mimeType,
          qualityParam
        );
      };
      img.src = url;
    });
  };

  // Convert one file; never throws. Returns the fields to merge into its row.
  const processOne = async (file: File, fmt: string, q: number): Promise<Partial<ConvertedImage>> => {
    try {
      const { blob, url } = await convertImage(file, fmt, q);
      return { convertedBlob: blob, convertedUrl: url, convertedSize: blob.size, outExt: extFromMime(blob.type, "png"), fmtUsed: fmt, error: null, processing: false };
    } catch (err) {
      return {
        convertedBlob: null, convertedUrl: null, convertedSize: 0, fmtUsed: fmt, processing: false,
        error: err instanceof Error ? err.message : `Couldn't convert ${file.name}`,
      };
    }
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const all = Array.from(files);
    const imgFiles = all.filter(isImageFile);

    const warnings: string[] = all.filter((f) => !isImageFile(f)).map((f) => unsupportedFileMessage(f));
    const accepted: File[] = [];
    for (const f of imgFiles) {
      const sizeCheck = validateFileSize(f, "image");
      if (!sizeCheck.valid) {
        warnings.push(`${f.name}: ${sizeCheck.error}`);
        continue;
      }
      if (sizeCheck.warning) warnings.push(`${f.name}: ${sizeCheck.warning}`);
      accepted.push(f);
    }

    const existingFiles = images.map((img) => img.file);
    const unique = accepted.filter((f) => !isDuplicateFile(f, existingFiles));
    if (unique.length < accepted.length) {
      warnings.push(`${accepted.length - unique.length} duplicate file(s) skipped.`);
    }
    setSizeWarnings(warnings);

    const newImages: ConvertedImage[] = unique.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      convertedBlob: null,
      convertedUrl: null,
      originalSize: file.size,
      convertedSize: 0,
      processing: true,
      outExt: "",
      fmtUsed: outputFormat,
      error: null,
    }));

    setImages((prev) => [...prev, ...newImages]);

    for (const imgFile of unique) {
      const result = await processOne(imgFile, outputFormat, quality);
      setImages((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((r) => r.file === imgFile);
        if (idx >= 0) updated[idx] = { ...updated[idx], ...result };
        return updated;
      });
    }
  }, [outputFormat, quality, images]);

  const reconvertAll = async () => {
    const currentImages = [...images];
    setImages(currentImages.map((img) => ({ ...img, processing: true, convertedBlob: null, convertedUrl: null, convertedSize: 0, error: null })));

    for (const img of currentImages) {
      const result = await processOne(img.file, outputFormat, quality);
      setImages((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((r) => r.file === img.file);
        if (idx >= 0) updated[idx] = { ...updated[idx], ...result };
        return updated;
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadSingle = (img: ConvertedImage) => {
    if (!img.convertedUrl) return;
    const a = document.createElement("a");
    a.href = img.convertedUrl;
    a.download = baseName(img.file.name) + `.${img.outExt}`;
    a.click();
  };

  const downloadAll = async () => {
    const completed = images.filter((img) => img.convertedBlob);
    if (completed.length === 0) return;
    if (completed.length === 1) { downloadSingle(completed[0]); return; }

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const used = new Set<string>();
    completed.forEach((img) => {
      zip.file(uniqueName(baseName(img.file.name) + `.${img.outExt}`, used), img.convertedBlob!);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "converted-images.zip";
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const completedCount = images.filter((img) => img.convertedBlob).length;
  const formatStale = images.some((img) => !img.processing && img.fmtUsed !== outputFormat);

  return (
    <ErrorBoundary>
    <ToolLayout
      slug="image-converter"
      title="Image Converter"
      description="Convert images to JPG, PNG or WebP — including BMP and GIF files. Batch convert with quality control."
      faqs={[
        { question: "Which formats can I convert between?", answer: "You can convert common browser-readable images (such as JPG, PNG and WebP) to JPG, PNG or WebP. Use the quality slider for JPG and WebP to balance size and detail." },
        { question: "What happens to transparent backgrounds?", answer: "PNG and WebP keep transparency. JPG doesn't support it, so transparent areas are filled with white." },
        { question: "Can I convert iPhone HEIC photos here?", answer: "Use the HEIC to JPG tool instead; it includes a decoder for iPhone photos that most browsers can't open on their own." },
        { question: "Can I convert many images at once?", answer: "Yes. Add several images, then download each one or all of them together as a ZIP file." },
      ]}
    >
      {sizeWarnings.length > 0 && (
        <div style={{
          padding: "0.75rem 1rem", marginBottom: "1rem",
          background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.3)",
          borderRadius: "0.5rem", fontSize: "0.85rem", color: "#b45309",
        }}>
          {sizeWarnings.map((w, i) => <div key={i}>⚠ {w}</div>)}
        </div>
      )}
      <div data-dropzone="true"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file"; input.accept = "image/*"; input.multiple = true;
          input.onchange = () => handleFiles(input.files); input.click();
        }}
        style={{
          border: `2px dashed ${dragOver ? "var(--primary)" : "var(--card-border)"}`,
          borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center",
          cursor: "pointer", background: dragOver ? "rgba(37,99,235,0.04)" : "var(--card-bg)", transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔄</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop images here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Supports JPG, PNG, WebP, BMP, GIF</p>
      </div>

      {images.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem",
            padding: "1rem", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.5rem",
          }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Convert To</label>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {(["jpeg", "png", "webp"] as const).map((fmt) => (
                  <button key={fmt} onClick={() => setOutputFormat(fmt)}
                    style={{
                      flex: 1, padding: "0.5rem", border: "1px solid var(--card-border)", borderRadius: "0.3rem",
                      background: outputFormat === fmt ? "var(--primary)" : "var(--card-bg)",
                      color: outputFormat === fmt ? "#fff" : "var(--foreground)",
                      cursor: "pointer", fontWeight: 600, fontSize: "0.8rem", transition: "all 0.15s",
                    }}>
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {(outputFormat === "jpeg" || outputFormat === "webp") && (
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                  Quality: {quality}%
                </label>
                <input type="range" min="10" max="100" step="5" value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--muted)" }}>
                  <span>Smaller</span><span>Better</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button onClick={reconvertAll} className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
                Re-convert with new settings
              </button>
              {formatStale && (
                <span style={{ fontSize: "0.8rem", color: "#b45309", alignSelf: "center" }}>
                  Format changed — click Re-convert to apply it.
                </span>
              )}
              <button onClick={() => {
                const input = document.createElement("input");
                input.type = "file"; input.accept = "image/*"; input.multiple = true;
                input.onchange = () => handleFiles(input.files); input.click();
              }} className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
                + Add More
              </button>
              <button
                onClick={() => {
                  images.forEach((img) => {
                    if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
                    if (img.convertedUrl) URL.revokeObjectURL(img.convertedUrl);
                  });
                  setImages([]);
                }}
                className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", color: "#ef4444" }}>
                Clear All
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
            {images.map((img, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.6rem 0.75rem", background: "var(--card-bg)",
                border: "1px solid var(--card-border)", borderRadius: "0.5rem",
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "0.25rem", overflow: "hidden",
                  flexShrink: 0, background: "#f8f8f8",
                }}>
                  <img src={img.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {img.file.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    {img.processing ? (
                      <span>Converting...</span>
                    ) : img.error ? (
                      <span style={{ color: "#ef4444" }}>
                        {img.error}
                        {isHeicFile(img.file) && <> · <a href="/heic-to-jpg" style={{ color: "var(--primary)" }}>Open HEIC to JPG</a></>}
                      </span>
                    ) : (
                      <>
                        {formatSize(img.originalSize)} → {formatSize(img.convertedSize)}
                        <span style={{
                          marginLeft: "0.4rem",
                          color: img.convertedSize <= img.originalSize ? "#22c55e" : "#f59e0b",
                          fontWeight: 600,
                        }}>
                          .{img.outExt}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {img.convertedUrl && (
                  <button onClick={() => downloadSingle(img)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", padding: "0.25rem", flexShrink: 0 }}>
                    ⬇
                  </button>
                )}
                <button onClick={() => removeImage(i)}
                  style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1rem", padding: "0.25rem", flexShrink: 0 }}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          {completedCount > 0 && (
            <button onClick={downloadAll} className="btn-primary"
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}>
              {completedCount > 1 ? `Download All ${completedCount} Images (ZIP)` : "Download Converted Image"}
            </button>
          )}
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Convert Image Formats Online
        </h2>
        <p>
          Upload images in any format and convert them to JPG, PNG or WebP. For JPG and WebP,
          adjust the quality slider to balance file size and image quality. Batch convert multiple images
          at once and download them individually or as a ZIP file. All processing happens in your
          browser — your images are never uploaded to any server.
        </p>
      </section>
    </ToolLayout>
    </ErrorBoundary>
  );
}
