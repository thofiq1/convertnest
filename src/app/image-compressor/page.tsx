"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { validateFileSize, isDuplicateFile } from "@/utils/fileValidation";

interface ImageResult {
  file: File;
  previewUrl: string;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  originalSize: number;
  compressedSize: number;
  processing: boolean;
}

export default function ImageCompressor() {
  const [images, setImages] = useState<ImageResult[]>([]);
  const [quality, setQuality] = useState(75);
  const [maxWidth, setMaxWidth] = useState(0);
  const [outputFormat, setOutputFormat] = useState<"original" | "jpeg" | "webp">("original");
  const [dragOver, setDragOver] = useState(false);

  const [sizeWarnings, setSizeWarnings] = useState<string[]>([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
        if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
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

  const compressImage = async (file: File, q: number, mw: number, fmt: string): Promise<{ blob: Blob; url: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Failed to load image: ${file.name}`)); };
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (mw > 0 && w > mw) {
          h = Math.round(h * (mw / w));
          w = mw;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(url); reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, w, h);

        let mimeType: string;
        if (fmt === "original") {
          mimeType = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
        } else {
          mimeType = fmt === "webp" ? "image/webp" : "image/jpeg";
        }

        const qualityParam = mimeType === "image/png" ? undefined : q / 100;

        canvas.toBlob(
          (blob) => {
            if (!blob) { URL.revokeObjectURL(url); reject(new Error("Failed to compress image")); return; }
            const compUrl = URL.createObjectURL(blob);
            canvas.width = 0;
            canvas.height = 0;
            URL.revokeObjectURL(url);
            resolve({ blob, url: compUrl });
          },
          mimeType,
          qualityParam
        );
      };
      img.src = url;
    });
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const imgFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));

    const warnings: string[] = [];
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

    // Filter duplicates
    const existingFiles = images.map((img) => img.file);
    const unique = accepted.filter((f) => !isDuplicateFile(f, existingFiles));
    if (unique.length < accepted.length) {
      warnings.push(`${accepted.length - unique.length} duplicate file(s) skipped.`);
    }
    if (warnings.length > 0) setSizeWarnings(warnings);

    const newImages: ImageResult[] = unique.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      compressedBlob: null,
      compressedUrl: null,
      originalSize: file.size,
      compressedSize: 0,
      processing: true,
    }));

    setImages((prev) => [...prev, ...newImages]);

    for (let i = 0; i < unique.length; i++) {
      const currentFile = unique[i];
      const { blob, url } = await compressImage(currentFile, quality, maxWidth, outputFormat);
      setImages((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((r) => r.file === currentFile);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            compressedBlob: blob,
            compressedUrl: url,
            compressedSize: blob.size,
            processing: false,
          };
        }
        return updated;
      });
    }
  }, [quality, maxWidth, outputFormat]);

  const recompressAll = async () => {
    const currentImages = [...images];
    setImages(currentImages.map((img) => ({ ...img, processing: true, compressedBlob: null, compressedUrl: null, compressedSize: 0 })));

    for (const img of currentImages) {
      const { blob, url } = await compressImage(img.file, quality, maxWidth, outputFormat);
      setImages((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((r) => r.file === img.file);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], compressedBlob: blob, compressedUrl: url, compressedSize: blob.size, processing: false };
        }
        return updated;
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadSingle = (img: ImageResult) => {
    if (!img.compressedUrl) return;
    const ext = outputFormat === "original" ? img.file.name.split(".").pop() : outputFormat === "webp" ? "webp" : "jpg";
    const a = document.createElement("a");
    a.href = img.compressedUrl;
    a.download = img.file.name.replace(/\.[^.]+$/, "") + `-compressed.${ext}`;
    a.click();
  };

  const downloadAll = async () => {
    const completed = images.filter((img) => img.compressedBlob);
    if (completed.length === 0) return;
    if (completed.length === 1) { downloadSingle(completed[0]); return; }

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const ext = outputFormat === "webp" ? "webp" : outputFormat === "jpeg" ? "jpg" : "";
    completed.forEach((img) => {
      const finalExt = ext || img.file.name.split(".").pop() || "jpg";
      zip.file(img.file.name.replace(/\.[^.]+$/, "") + `-compressed.${finalExt}`, img.compressedBlob!);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "compressed-images.zip";
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const totalOriginal = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressed = images.reduce((sum, img) => sum + img.compressedSize, 0);
  const completedCount = images.filter((img) => img.compressedBlob).length;

  return (
    <ErrorBoundary>
    <ToolLayout
      title="Image Compressor"
      description="Compress images to reduce file size. Adjust quality, resize, and convert formats — all in your browser."
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
      <div
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
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🗜</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop images here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Supports JPG, PNG, WebP, BMP</p>
      </div>

      {images.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "1rem",
            padding: "1rem", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.5rem",
          }}>
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

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Max Width</label>
              <select value={maxWidth} onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--card-border)", background: "var(--card-bg)", fontSize: "0.85rem" }}>
                <option value="0">No resize</option>
                <option value="3840">3840px (4K)</option>
                <option value="1920">1920px (Full HD)</option>
                <option value="1280">1280px (HD)</option>
                <option value="800">800px (Web)</option>
                <option value="400">400px (Thumbnail)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Output Format</label>
              <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as "original" | "jpeg" | "webp")}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--card-border)", background: "var(--card-bg)", fontSize: "0.85rem" }}>
                <option value="original">Keep Original</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button onClick={recompressAll} className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
                Re-compress with new settings
              </button>
              <button
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file"; input.accept = "image/*"; input.multiple = true;
                  input.onchange = () => handleFiles(input.files); input.click();
                }}
                className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
                + Add More
              </button>
              <button
                onClick={() => {
                  images.forEach((img) => {
                    if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
                    if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
                  });
                  setImages([]);
                }}
                className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", color: "#ef4444" }}>
                Clear All
              </button>
            </div>
            {completedCount > 0 && totalOriginal > 0 && (
              <div style={{ fontSize: "0.85rem", textAlign: "right" }}>
                <span style={{ color: "var(--muted)" }}>{formatSize(totalOriginal)} → </span>
                <span style={{ fontWeight: 700, color: totalCompressed < totalOriginal ? "#22c55e" : "#ef4444" }}>
                  {formatSize(totalCompressed)}
                </span>
                <span style={{ color: "var(--muted)", marginLeft: "0.3rem" }}>
                  ({totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0}% saved)
                </span>
              </div>
            )}
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
                      <span>Compressing...</span>
                    ) : (
                      <>
                        {formatSize(img.originalSize)} → {formatSize(img.compressedSize)}
                        <span style={{
                          marginLeft: "0.4rem", fontWeight: 600,
                          color: img.compressedSize < img.originalSize ? "#22c55e" : "#ef4444",
                        }}>
                          {img.originalSize > 0 ? Math.round((1 - img.compressedSize / img.originalSize) * 100) : 0}% saved
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {img.compressedUrl && (
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
              {completedCount > 1 ? `Download All ${completedCount} Images (ZIP)` : "Download Compressed Image"}
            </button>
          )}
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Compress Images Online
        </h2>
        <p>
          Upload your images and adjust the quality slider to control compression. Set a maximum width to
          resize large images, and optionally convert to JPEG or WebP for better compression. Each image
          shows the size reduction achieved. Download individually or all at once as a ZIP file. All
          processing happens in your browser — your images stay private.
        </p>
      </section>
    </ToolLayout>
    </ErrorBoundary>
  );
}
