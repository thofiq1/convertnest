"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

type OutputFormat = "jpeg" | "png" | "webp" | "bmp" | "ico";

interface ConvertedImage {
  name: string;
  originalSize: number;
  convertedSize: number;
  url: string;
  preview: string;
  format: OutputFormat;
}

const FORMAT_INFO: Record<OutputFormat, { label: string; ext: string; desc: string }> = {
  jpeg: { label: "JPEG", ext: "jpg", desc: "Best for photos. Small file size with adjustable quality." },
  png: { label: "PNG", ext: "png", desc: "Lossless with transparency support. Larger files." },
  webp: { label: "WebP", ext: "webp", desc: "Modern format — smallest files with great quality." },
  bmp: { label: "BMP", ext: "bmp", desc: "Uncompressed bitmap. Very large files, universal support." },
  ico: { label: "ICO", ext: "ico", desc: "Favicon format for websites. Best at small sizes." },
};

export default function ImageConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("webp");
  const [quality, setQuality] = useState(85);
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [results, setResults] = useState<ConvertedImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progressIdx, setProgressIdx] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [tooltipFormat, setTooltipFormat] = useState<OutputFormat | null>(null);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const imageFiles = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...imageFiles]);
    setResults([]);
  }, []);

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const addMore = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = () => handleFiles(input.files);
    input.click();
  };

  const createThumbnail = (img: HTMLImageElement, maxSize = 80): string => {
    const canvas = document.createElement("canvas");
    const ratio = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight, 1);
    canvas.width = img.naturalWidth * ratio;
    canvas.height = img.naturalHeight * ratio;
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.6);
  };

  const convert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResults([]);
    setProgressIdx(0);

    const converted: ConvertedImage[] = [];

    for (let idx = 0; idx < files.length; idx++) {
      const file = files[idx];
      setProgressIdx(idx + 1);

      try {
        const img = new Image();
        const url = URL.createObjectURL(file);
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        });

        let w = img.naturalWidth;
        let h = img.naturalHeight;

        if (resizeEnabled) {
          const scale = Math.min(maxWidth / w, maxHeight / h, 1);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }

        // ICO: clamp to 256×256
        if (outputFormat === "ico") {
          const icoMax = 256;
          const scale = Math.min(icoMax / w, icoMax / h, 1);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;

        // For JPEG/BMP, fill white background (no transparency)
        if (outputFormat === "jpeg" || outputFormat === "bmp") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);

        const info = FORMAT_INFO[outputFormat];
        let mimeType: string;
        if (outputFormat === "bmp") mimeType = "image/bmp";
        else if (outputFormat === "ico") mimeType = "image/png"; // ICO fallback as PNG
        else mimeType = `image/${outputFormat}`;

        const qualityVal = (outputFormat === "png" || outputFormat === "bmp" || outputFormat === "ico") ? undefined : quality / 100;

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), mimeType, qualityVal)
        );

        const preview = createThumbnail(img);
        URL.revokeObjectURL(url);

        const baseName = file.name.replace(/\.[^.]+$/, "");

        converted.push({
          name: `${baseName}.${info.ext}`,
          originalSize: file.size,
          convertedSize: blob.size,
          url: URL.createObjectURL(blob),
          preview,
          format: outputFormat,
        });
      } catch (err) {
        console.error(`Error converting ${file.name}:`, err);
      }
    }

    setResults(converted);
    setProcessing(false);
  };

  const downloadAll = async () => {
    if (results.length <= 1) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    for (const r of results) {
      const resp = await fetch(r.url);
      const blob = await resp.blob();
      zip.file(r.name, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `converted-images.zip`;
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const showQuality = outputFormat === "jpeg" || outputFormat === "webp";

  return (
    <ToolLayout
      title="Image Converter"
      description="Convert images between JPEG, PNG, WebP, BMP and ICO formats. Batch convert with optional resizing — 100% private, runs in your browser."
    >
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.multiple = true;
          input.onchange = () => handleFiles(input.files);
          input.click();
        }}
        style={{
          border: `2px dashed ${dragOver ? "var(--primary)" : "var(--card-border)"}`,
          borderRadius: "1rem",
          padding: "3rem 2rem",
          textAlign: "center",
          cursor: "pointer",
          background: dragOver ? "rgba(37, 99, 235, 0.04)" : "var(--card-bg)",
          transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔄</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop images here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          JPG, PNG, WebP, BMP, TIFF and more — batch convert any image format
        </p>
      </div>

      {/* Controls */}
      {files.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          {/* Output format selector */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 700, display: "block", marginBottom: "0.5rem" }}>
              Convert to:
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {(Object.keys(FORMAT_INFO) as OutputFormat[]).map((fmt) => (
                <div key={fmt} style={{ position: "relative" }}>
                  <button
                    onClick={() => setOutputFormat(fmt)}
                    onMouseEnter={() => setTooltipFormat(fmt)}
                    onMouseLeave={() => setTooltipFormat(null)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      border: outputFormat === fmt ? "2px solid var(--primary)" : "1px solid var(--card-border)",
                      background: outputFormat === fmt ? "rgba(37, 99, 235, 0.08)" : "var(--card-bg)",
                      color: outputFormat === fmt ? "var(--primary)" : "var(--foreground)",
                      cursor: "pointer",
                      fontWeight: outputFormat === fmt ? 700 : 500,
                      fontSize: "0.85rem",
                    }}
                  >
                    {FORMAT_INFO[fmt].label}
                  </button>
                  {tooltipFormat === fmt && (
                    <div style={{
                      position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
                      background: "var(--foreground)", color: "var(--background)", padding: "0.4rem 0.6rem",
                      borderRadius: "0.375rem", fontSize: "0.7rem", whiteSpace: "nowrap", zIndex: 10,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}>
                      {FORMAT_INFO[fmt].desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quality slider */}
          {showQuality && (
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 700 }}>Quality: {quality}%</label>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {quality <= 50 ? "Smallest file" : quality <= 75 ? "Balanced" : "High quality"}
                </span>
              </div>
              <input type="range" min="10" max="100" value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                style={{ width: "100%", marginTop: "0.3rem" }}
              />
            </div>
          )}

          {/* Resize option */}
          <div style={{
            padding: "0.75rem 1rem",
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "0.5rem",
            marginBottom: "1.25rem",
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>
              <input type="checkbox" checked={resizeEnabled} onChange={(e) => setResizeEnabled(e.target.checked)} />
              Resize during conversion
            </label>
            {resizeEnabled && (
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", alignItems: "center" }}>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Max Width</label>
                  <input type="number" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))}
                    style={{ width: "80px", padding: "0.3rem", borderRadius: "0.25rem", border: "1px solid var(--card-border)", fontSize: "0.8rem" }}
                  />
                </div>
                <span style={{ marginTop: "1rem", color: "var(--muted)" }}>×</span>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Max Height</label>
                  <input type="number" value={maxHeight} onChange={(e) => setMaxHeight(Number(e.target.value))}
                    style={{ width: "80px", padding: "0.3rem", borderRadius: "0.25rem", border: "1px solid var(--card-border)", fontSize: "0.8rem" }}
                  />
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "1rem" }}>px (scales proportionally)</span>
              </div>
            )}
          </div>

          {/* File list */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              {files.length} file{files.length > 1 ? "s" : ""} · {formatSize(files.reduce((s, f) => s + f.size, 0))}
            </p>
            <button onClick={addMore} style={{
              background: "none", border: "1px solid var(--card-border)", borderRadius: "0.375rem",
              padding: "0.3rem 0.75rem", fontSize: "0.75rem", cursor: "pointer", color: "var(--primary)",
            }}>
              + Add more
            </button>
          </div>

          {files.map((file, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.5rem 0.75rem", background: "var(--card-bg)",
              border: "1px solid var(--card-border)", borderRadius: "0.5rem", marginBottom: "0.35rem",
            }}>
              <span style={{ fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>
                🖼️ {file.name}
                <span style={{ color: "var(--muted)", marginLeft: "0.5rem" }}>({formatSize(file.size)})</span>
              </span>
              <button onClick={() => removeFile(i)}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1rem" }}>✕</button>
            </div>
          ))}

          <button onClick={convert} disabled={processing} className="btn-primary"
            style={{ marginTop: "1rem", width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}>
            {processing ? `Converting ${progressIdx} of ${files.length}...` : `Convert to ${FORMAT_INFO[outputFormat].label}`}
          </button>

          {processing && (
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ height: "4px", background: "var(--card-border)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", background: "var(--primary)", borderRadius: "2px",
                  width: `${(progressIdx / files.length) * 100}%`, transition: "width 0.3s",
                }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
              Converted {results.length} image{results.length > 1 ? "s" : ""}
            </h3>
            {results.length > 1 && (
              <button onClick={downloadAll} className="btn-primary"
                style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
                📦 Download All as ZIP
              </button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
            {results.map((r, i) => {
              const diff = r.convertedSize - r.originalSize;
              const pct = ((diff / r.originalSize) * 100);
              return (
                <div key={i} style={{
                  background: "var(--card-bg)", border: "1px solid var(--card-border)",
                  borderRadius: "0.75rem", padding: "0.75rem", textAlign: "center",
                }}>
                  <img src={r.preview} alt={r.name} style={{
                    width: "64px", height: "64px", objectFit: "contain",
                    borderRadius: "0.25rem", margin: "0 auto 0.5rem",
                    display: "block", border: "1px solid var(--card-border)",
                  }} />
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.name}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "var(--muted)", margin: "0.25rem 0" }}>
                    {formatSize(r.originalSize)} → {formatSize(r.convertedSize)}
                    <span style={{ color: diff < 0 ? "#22c55e" : diff > 0 ? "#ef4444" : "var(--muted)", marginLeft: "0.25rem" }}>
                      ({diff <= 0 ? "" : "+"}{pct.toFixed(0)}%)
                    </span>
                  </p>
                  <a href={r.url} download={r.name} className="btn-primary"
                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", textDecoration: "none", display: "inline-block", marginTop: "0.25rem" }}>
                    Download
                  </a>
                </div>
              );
            })}
          </div>

          <button onClick={() => { setFiles([]); setResults([]); }} style={{
            width: "100%", padding: "0.6rem", marginTop: "1rem",
            background: "none", border: "1px solid var(--card-border)", borderRadius: "0.5rem",
            cursor: "pointer", color: "var(--primary)", fontSize: "0.85rem", fontWeight: 600,
          }}>
            Convert More Images
          </button>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          Free Online Image Format Converter
        </h2>
        <p>
          Convert between JPEG, PNG, WebP, BMP and ICO formats instantly. WebP offers the
          best balance of quality and file size for web use. Use JPEG for photos, PNG for
          graphics with transparency, and ICO for website favicons. Optionally resize images
          during conversion. All processing runs in your browser — your files are never uploaded.
        </p>
      </section>
    </ToolLayout>
  );
}
