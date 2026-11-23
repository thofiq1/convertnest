"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { validateFileSize, isDuplicateFile } from "@/utils/fileValidation";

interface ConvertedSvg {
  file: File;
  svgText: string;
  previewUrl: string;
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  originalSize: number;
  convertedSize: number;
  naturalWidth: number;
  naturalHeight: number;
  processing: boolean;
  error: string | null;
}

export default function SvgToPng() {
  const [images, setImages] = useState<ConvertedSvg[]>([]);
  const [scale, setScale] = useState(2);
  const [customWidth, setCustomWidth] = useState("");
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg">("png");
  const [bgColor, setBgColor] = useState("#ffffff");
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

  const convertSvg = async (
    file: File,
    svgText: string,
    scaleVal: number,
    customW: string,
    fmt: string,
    bg: string
  ): Promise<{ blob: Blob; url: string; naturalWidth: number; naturalHeight: number }> => {
    return new Promise((resolve, reject) => {
      const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error(`Failed to load SVG: ${file.name}`));
      };
      img.onload = () => {
        // Determine natural dimensions
        let natW = img.naturalWidth || 300;
        let natH = img.naturalHeight || 150;

        // Try to parse viewBox for more accurate dimensions
        const viewBoxMatch = svgText.match(/viewBox=["']([^"']+)["']/);
        if (viewBoxMatch) {
          const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
          if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
            if (natW <= 1 || natH <= 1) {
              natW = parts[2];
              natH = parts[3];
            }
          }
        }

        // Calculate output dimensions
        let outW: number;
        let outH: number;
        const cw = parseInt(customW);
        if (cw > 0) {
          outW = cw;
          outH = Math.round((cw / natW) * natH);
        } else {
          outW = Math.round(natW * scaleVal);
          outH = Math.round(natH * scaleVal);
        }

        // Clamp to reasonable maximum
        const maxDim = 8192;
        if (outW > maxDim) { outH = Math.round(outH * (maxDim / outW)); outW = maxDim; }
        if (outH > maxDim) { outW = Math.round(outW * (maxDim / outH)); outH = maxDim; }

        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(svgUrl); reject(new Error("Canvas not supported")); return; }

        // Fill background for JPEG or if user wants a background
        if (fmt === "jpeg") {
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, outW, outH);

        const mimeType = fmt === "jpeg" ? "image/jpeg" : "image/png";
        const qualityParam = fmt === "jpeg" ? 0.92 : undefined;

        canvas.toBlob(
          (blob) => {
            if (!blob) { URL.revokeObjectURL(svgUrl); reject(new Error("Failed to convert SVG")); return; }
            const convUrl = URL.createObjectURL(blob);
            canvas.width = 0;
            canvas.height = 0;
            URL.revokeObjectURL(svgUrl);
            resolve({ blob, url: convUrl, naturalWidth: natW, naturalHeight: natH });
          },
          mimeType,
          qualityParam
        );
      };
      img.src = svgUrl;
    });
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const svgFiles = Array.from(files).filter((f) => {
      const ext = f.name.toLowerCase().split(".").pop();
      return ext === "svg" || f.type === "image/svg+xml";
    });

    if (svgFiles.length === 0) {
      setSizeWarnings(["No SVG files found. Please select .svg files."]);
      return;
    }

    const warnings: string[] = [];
    const accepted: File[] = [];
    for (const f of svgFiles) {
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
    if (warnings.length > 0) setSizeWarnings(warnings);

    // Read SVG text for all files first
    const fileTexts: { file: File; text: string }[] = [];
    for (const f of unique) {
      const text = await f.text();
      fileTexts.push({ file: f, text });
    }

    const newImages: ConvertedSvg[] = fileTexts.map(({ file, text }) => ({
      file,
      svgText: text,
      previewUrl: URL.createObjectURL(new Blob([text], { type: "image/svg+xml;charset=utf-8" })),
      convertedBlob: null,
      convertedUrl: null,
      originalSize: file.size,
      convertedSize: 0,
      naturalWidth: 0,
      naturalHeight: 0,
      processing: true,
      error: null,
    }));

    setImages((prev) => [...prev, ...newImages]);

    for (const { file, text } of fileTexts) {
      try {
        const { blob, url, naturalWidth, naturalHeight } = await convertSvg(file, text, scale, customWidth, outputFormat, bgColor);
        setImages((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((r) => r.file === file);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], convertedBlob: blob, convertedUrl: url, convertedSize: blob.size, naturalWidth, naturalHeight, processing: false };
          }
          return updated;
        });
      } catch (err) {
        setImages((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((r) => r.file === file);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], processing: false, error: err instanceof Error ? err.message : "Conversion failed" };
          }
          return updated;
        });
      }
    }
  }, [scale, customWidth, outputFormat, bgColor, images]);

  const reconvertAll = async () => {
    const currentImages = [...images];
    setImages(currentImages.map((img) => ({ ...img, processing: true, convertedBlob: null, convertedUrl: null, convertedSize: 0, error: null })));

    for (const img of currentImages) {
      try {
        const { blob, url, naturalWidth, naturalHeight } = await convertSvg(img.file, img.svgText, scale, customWidth, outputFormat, bgColor);
        setImages((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((r) => r.file === img.file);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], convertedBlob: blob, convertedUrl: url, convertedSize: blob.size, naturalWidth, naturalHeight, processing: false };
          }
          return updated;
        });
      } catch (err) {
        setImages((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((r) => r.file === img.file);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], processing: false, error: err instanceof Error ? err.message : "Conversion failed" };
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

  const extMap: Record<string, string> = { png: "png", jpeg: "jpg" };

  const downloadSingle = (img: ConvertedSvg) => {
    if (!img.convertedUrl) return;
    const a = document.createElement("a");
    a.href = img.convertedUrl;
    a.download = img.file.name.replace(/\.[^.]+$/, "") + `.${extMap[outputFormat]}`;
    a.click();
  };

  const downloadAll = async () => {
    const completed = images.filter((img) => img.convertedBlob);
    if (completed.length === 0) return;
    if (completed.length === 1) { downloadSingle(completed[0]); return; }

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    completed.forEach((img) => {
      zip.file(img.file.name.replace(/\.[^.]+$/, "") + `.${extMap[outputFormat]}`, img.convertedBlob!);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `svg-converted-${outputFormat}.zip`;
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const completedCount = images.filter((img) => img.convertedBlob).length;

  return (
    <ErrorBoundary>
    <ToolLayout
      slug="svg-to-png"
      title="SVG to PNG Converter"
      description="Convert SVG vector files to PNG or JPG images at any resolution. Free online SVG converter."
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
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file"; input.accept = ".svg,image/svg+xml"; input.multiple = true;
          input.onchange = () => handleFiles(input.files); input.click();
        }}
        style={{
          border: `2px dashed ${dragOver ? "var(--primary)" : "var(--card-border)"}`,
          borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center",
          cursor: "pointer", background: dragOver ? "rgba(37,99,235,0.04)" : "var(--card-bg)", transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎨</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop SVG files here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Supports .svg vector files</p>
      </div>

      {images.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "1rem",
            padding: "1rem", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.5rem",
          }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Scale</label>
              <div style={{ display: "flex", gap: "0.3rem" }}>
                {[1, 2, 3, 4].map((s) => (
                  <button key={s} onClick={() => { setScale(s); setCustomWidth(""); }}
                    style={{
                      flex: 1, padding: "0.5rem", border: "1px solid var(--card-border)", borderRadius: "0.3rem",
                      background: scale === s && !customWidth ? "var(--primary)" : "var(--card-bg)",
                      color: scale === s && !customWidth ? "#fff" : "var(--foreground)",
                      cursor: "pointer", fontWeight: 600, fontSize: "0.8rem", transition: "all 0.15s",
                    }}>
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Custom Width (px)</label>
              <input
                type="number" min="1" max="8192" placeholder="e.g. 1024"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                style={{
                  width: "100%", padding: "0.5rem", borderRadius: "0.3rem",
                  border: "1px solid var(--card-border)", background: "var(--card-bg)", fontSize: "0.85rem",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Output Format</label>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {(["png", "jpeg"] as const).map((fmt) => (
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
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Background</label>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <input
                    type="color" value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{ width: "36px", height: "36px", border: "1px solid var(--card-border)", borderRadius: "0.3rem", cursor: "pointer", padding: "2px" }}
                  />
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{bgColor}</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button onClick={reconvertAll} className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
                Re-convert with new settings
              </button>
              <button onClick={() => {
                const input = document.createElement("input");
                input.type = "file"; input.accept = ".svg,image/svg+xml"; input.multiple = true;
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
            {images.map((img, i) => (
              <div key={i} style={{
                padding: "0.75rem", background: "var(--card-bg)",
                border: "1px solid var(--card-border)", borderRadius: "0.5rem",
              }}>
                <div style={{
                  width: "100%", height: "120px", borderRadius: "0.25rem", overflow: "hidden",
                  background: "repeating-conic-gradient(#f0f0f0 0% 25%, #fff 0% 50%) 50% / 16px 16px",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.5rem",
                }}>
                  <img src={img.previewUrl} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
                <div style={{ fontSize: "0.8rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "0.25rem" }}>
                  {img.file.name}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
                  {img.processing ? (
                    <span>Converting...</span>
                  ) : img.error ? (
                    <span style={{ color: "#ef4444" }}>{img.error}</span>
                  ) : (
                    <>
                      {formatSize(img.originalSize)} &rarr; {formatSize(img.convertedSize)}
                      {img.naturalWidth > 0 && (
                        <span style={{ marginLeft: "0.3rem" }}>
                          ({Math.round(img.naturalWidth * (customWidth ? parseInt(customWidth) / img.naturalWidth : scale))}
                          &times;
                          {Math.round(img.naturalHeight * (customWidth ? parseInt(customWidth) / img.naturalWidth : scale))}px)
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  {img.convertedUrl && (
                    <button onClick={() => downloadSingle(img)}
                      style={{
                        flex: 1, padding: "0.35rem", border: "none", borderRadius: "0.25rem",
                        background: "#22c55e", color: "#fff", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
                      }}>
                      Download
                    </button>
                  )}
                  <button onClick={() => removeImage(i)}
                    style={{
                      padding: "0.35rem 0.5rem", border: "1px solid var(--card-border)", borderRadius: "0.25rem",
                      background: "var(--card-bg)", color: "var(--muted)", cursor: "pointer", fontSize: "0.75rem",
                    }}>
                    &#10005;
                  </button>
                </div>
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
          How to Convert SVG to PNG Online
        </h2>
        <p>
          Upload your SVG vector files and convert them to high-quality PNG or JPG images. Choose a scale
          factor (1x to 4x) to control the output resolution, or enter a custom width for precise sizing.
          When converting to JPG, pick a background color to replace transparent areas. Batch convert
          multiple SVGs at once and download individually or as a ZIP file. All processing happens in your
          browser &mdash; your files are never uploaded to any server.
        </p>
      </section>
    </ToolLayout>
    </ErrorBoundary>
  );
}
