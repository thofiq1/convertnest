"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { validateFileSize, isDuplicateFile } from "@/utils/fileValidation";
import { extFromMime, baseName, uniqueName, isHeicFile, unsupportedFileMessage } from "@/lib/imageOutput";

interface ConvertedImage {
  file: File;
  previewUrl: string;
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  originalSize: number;
  convertedSize: number;
  processing: boolean;
  error: string | null;
  /** Extension matching the bytes in convertedBlob (set when the result is produced). */
  outExt: string;
  /** Output format setting used to produce this result. */
  fmtUsed: string;
}

export default function HeicToJpg() {
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [outputFormat, setOutputFormat] = useState<"jpeg" | "png">("jpeg");
  const [quality, setQuality] = useState(90);
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

  const convertHeic = async (file: File, fmt: string, q: number): Promise<{ blob: Blob; url: string }> => {
    try {
      return await convertNative(file, fmt, q);
    } catch {
      // Most browsers (Chrome, Firefox, Edge on Windows) can't decode HEIC natively.
      // Fall back to the heic2any decoder, which works everywhere.
      const heic2any = (await import("heic2any")).default;
      const mimeType = fmt === "png" ? "image/png" : "image/jpeg";
      const out = await heic2any({ blob: file, toType: mimeType, quality: q / 100 });
      const blob = Array.isArray(out) ? out[0] : out;
      return { blob, url: URL.createObjectURL(blob) };
    }
  };

  const convertNative = (file: File, fmt: string, q: number): Promise<{ blob: Blob; url: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Native HEIC decoding not supported"));
      };
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(url); reject(new Error("Canvas not supported")); return; }

        // Fill white background for JPEG
        if (fmt === "jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);

        const mimeType = fmt === "png" ? "image/png" : "image/jpeg";
        const qualityParam = fmt === "png" ? undefined : q / 100;

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

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const all = Array.from(files);
    const heicFiles = all.filter(isHeicFile);
    const rejected = all.filter((f) => !isHeicFile(f)).map((f) => unsupportedFileMessage(f, "a HEIC/HEIF file"));

    if (heicFiles.length === 0) {
      setSizeWarnings([...rejected, "No HEIC/HEIF files found. Please select .heic or .heif files."]);
      return;
    }

    const warnings: string[] = rejected;
    const accepted: File[] = [];
    for (const f of heicFiles) {
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
      error: null,
      outExt: "",
      fmtUsed: outputFormat,
    }));

    setImages((prev) => [...prev, ...newImages]);

    for (const imgFile of unique) {
      try {
        const { blob, url } = await convertHeic(imgFile, outputFormat, quality);
        setImages((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((r) => r.file === imgFile);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], convertedBlob: blob, convertedUrl: url, convertedSize: blob.size, processing: false, outExt: extFromMime(blob.type, outputFormat === "png" ? "png" : "jpg"), fmtUsed: outputFormat };
          }
          return updated;
        });
      } catch (err) {
        setImages((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((r) => r.file === imgFile);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], processing: false, fmtUsed: outputFormat, error: "Couldn't read this file — it may be damaged or not a real HEIC photo." };
          }
          return updated;
        });
      }
    }
  }, [outputFormat, quality, images]);

  const reconvertAll = async () => {
    const currentImages = [...images];
    setImages(currentImages.map((img) => ({ ...img, processing: true, convertedBlob: null, convertedUrl: null, convertedSize: 0, error: null })));

    for (const img of currentImages) {
      try {
        const { blob, url } = await convertHeic(img.file, outputFormat, quality);
        setImages((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((r) => r.file === img.file);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], convertedBlob: blob, convertedUrl: url, convertedSize: blob.size, processing: false, outExt: extFromMime(blob.type, outputFormat === "png" ? "png" : "jpg"), fmtUsed: outputFormat };
          }
          return updated;
        });
      } catch (err) {
        setImages((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((r) => r.file === img.file);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], processing: false, fmtUsed: outputFormat, error: "Couldn't read this file — it may be damaged or not a real HEIC photo." };
          }
          return updated;
        });
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const img = prev[index];
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      if (img.convertedUrl) URL.revokeObjectURL(img.convertedUrl);
      return prev.filter((_, i) => i !== index);
    });
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
    a.download = "heic-converted.zip";
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
      slug="heic-to-jpg"
      title="HEIC to JPG Converter"
      description="Convert iPhone HEIC photos to JPG or PNG format. Free online converter — no upload needed."
      faqs={[
        { question: "Why won't my HEIC photo open on Windows or a website?", answer: "HEIC is the default iPhone photo format, but many apps, websites and upload forms only accept JPG or PNG. Converting to JPG gives you a file that opens almost everywhere." },
        { question: "Does it work in Chrome, Firefox and Edge?", answer: "Yes. If your browser can't decode HEIC by itself, the tool loads a built-in HEIC decoder and converts the photo in your browser instead." },
        { question: "Should I pick JPG or PNG?", answer: "JPG gives smaller files and is accepted almost everywhere; use the quality slider to trade size for detail. PNG keeps full detail but files are usually much larger." },
        { question: "Can I convert several photos at once?", answer: "Yes. Add multiple .heic or .heif files and download them one by one or together as a ZIP file." },
      ]}
    >
      {sizeWarnings.length > 0 && (
        <div style={{
          padding: "0.75rem 1rem", marginBottom: "1rem",
          background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.3)",
          borderRadius: "0.5rem", fontSize: "0.85rem", color: "#b45309",
        }}>
          {sizeWarnings.map((w, i) => <div key={i}>{w}</div>)}
        </div>
      )}
      <div data-dropzone="true"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file"; input.accept = ".heic,.heif"; input.multiple = true;
          input.onchange = () => handleFiles(input.files); input.click();
        }}
        style={{
          border: `2px dashed ${dragOver ? "var(--primary)" : "var(--card-border)"}`,
          borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center",
          cursor: "pointer", background: dragOver ? "rgba(37,99,235,0.04)" : "var(--card-bg)", transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📱</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop HEIC/HEIF files here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Supports .heic and .heif files from iPhone</p>
      </div>

      {images.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem",
            padding: "1rem", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.5rem",
          }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Output Format</label>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {(["jpeg", "png"] as const).map((fmt) => (
                  <button key={fmt} onClick={() => setOutputFormat(fmt)}
                    style={{
                      flex: 1, padding: "0.5rem", border: "1px solid var(--card-border)", borderRadius: "0.3rem",
                      background: outputFormat === fmt ? "var(--primary)" : "var(--card-bg)",
                      color: outputFormat === fmt ? "#fff" : "var(--foreground)",
                      cursor: "pointer", fontWeight: 600, fontSize: "0.8rem", transition: "all 0.15s",
                    }}>
                    {fmt === "jpeg" ? "JPG" : "PNG"}
                  </button>
                ))}
              </div>
            </div>

            {outputFormat === "jpeg" && (
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
                input.type = "file"; input.accept = ".heic,.heif"; input.multiple = true;
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
                  flexShrink: 0, background: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {img.convertedUrl ? (
                    <img src={img.convertedUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "1.2rem" }}>📱</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {img.file.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    {img.processing ? (
                      <span>Converting...</span>
                    ) : img.error ? (
                      <span style={{ color: "#ef4444" }}>{img.error}</span>
                    ) : (
                      <>
                        {formatSize(img.originalSize)} &rarr; {formatSize(img.convertedSize)}
                        <span style={{
                          marginLeft: "0.4rem",
                          color: "#22c55e",
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
                    &#11015;
                  </button>
                )}
                <button onClick={() => removeImage(i)}
                  style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1rem", padding: "0.25rem", flexShrink: 0 }}>
                  &#10005;
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
          How to Convert HEIC to JPG Online
        </h2>
        <p>
          HEIC (High Efficiency Image Container) is the default photo format on iPhones. While it produces
          smaller files with great quality, many apps and websites don&apos;t support it. Upload your .heic or
          .heif files and convert them to JPG or PNG instantly. Choose JPG for the best compatibility and
          smallest size, or PNG for lossless quality. Adjust the quality slider when converting to JPG to
          control file size. All processing happens in your browser &mdash; your photos are never uploaded to
          any server.
        </p>
        <p style={{ marginTop: "0.5rem" }}>
          <strong>Browser compatibility:</strong> If your browser can decode HEIC on its own (for example
          Safari), the tool uses that. Otherwise it loads a built-in HEIC decoder, so conversion also works
          in Chrome, Firefox and Edge.
        </p>
      </section>
    </ToolLayout>
    </ErrorBoundary>
  );
}
