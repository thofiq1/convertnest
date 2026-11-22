"use client";

import { useState, useCallback, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";

type OutputMode = "same" | "jpeg" | "webp";

interface CompressedImage {
  name: string;
  originalSize: number;
  compressedSize: number;
  url: string;
  previewOriginal: string;
  previewCompressed: string;
  wasPng: boolean;
  outputMode: OutputMode;
}

export default function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(75);
  const [results, setResults] = useState<CompressedImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progressIdx, setProgressIdx] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [pngMode, setPngMode] = useState<OutputMode>("webp");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const imageFiles = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.some((f) => f.size > 50 * 1024 * 1024)) {
      alert("Some files exceed 50 MB and may cause your browser to slow down.");
    }
    setFiles((prev) => [...prev, ...imageFiles]);
    setResults([]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addMore = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = () => handleFiles(input.files);
    input.click();
  };

  const createThumbnail = (img: HTMLImageElement, maxSize = 120): string => {
    const canvas = document.createElement("canvas");
    const ratio = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight, 1);
    canvas.width = img.naturalWidth * ratio;
    canvas.height = img.naturalHeight * ratio;
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  };

  const compress = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResults([]);
    setProgressIdx(0);

    const compressed: CompressedImage[] = [];

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

        const previewOriginal = createThumbnail(img);

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        const isPng = file.type === "image/png";
        let mimeType: string;
        let ext: string;
        let qualityVal: number | undefined;

        if (isPng) {
          // PNG is lossless — canvas.toBlob with "image/png" ignores quality.
          // Real compression = convert to a lossy format (WebP / JPEG).
          if (pngMode === "same") {
            // Re-encode as PNG via canvas (strips metadata, can help a bit)
            mimeType = "image/png";
            ext = "png";
            qualityVal = undefined;
          } else if (pngMode === "webp") {
            mimeType = "image/webp";
            ext = "webp";
            qualityVal = quality / 100;
          } else {
            mimeType = "image/jpeg";
            ext = "jpg";
            qualityVal = quality / 100;
          }
        } else if (file.type === "image/webp") {
          mimeType = "image/webp";
          ext = "webp";
          qualityVal = quality / 100;
        } else {
          mimeType = "image/jpeg";
          ext = file.name.match(/\.jpe?g$/i) ? file.name.split(".").pop()! : "jpg";
          qualityVal = quality / 100;
        }

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), mimeType, qualityVal)
        );

        // Build compressed preview
        const compImg = new Image();
        const compUrl = URL.createObjectURL(blob);
        await new Promise<void>((resolve) => {
          compImg.onload = () => resolve();
          compImg.src = compUrl;
        });
        const previewCompressed = createThumbnail(compImg);

        const baseName = file.name.replace(/\.[^.]+$/, "");
        const outputName = isPng && pngMode !== "same" ? `${baseName}.${ext}` : `${baseName}-compressed.${ext}`;

        URL.revokeObjectURL(url);

        compressed.push({
          name: outputName,
          originalSize: file.size,
          compressedSize: blob.size,
          url: compUrl,
          previewOriginal,
          previewCompressed,
          wasPng: isPng,
          outputMode: isPng ? pngMode : "same",
        });
      } catch (err) {
        console.error(`Error compressing ${file.name}:`, err);
      }
    }

    setResults(compressed);
    setProcessing(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const totalOriginal = results.reduce((s, r) => s + r.originalSize, 0);
  const totalCompressed = results.reduce((s, r) => s + r.compressedSize, 0);
  const totalReduction = totalOriginal > 0 ? ((1 - totalCompressed / totalOriginal) * 100) : 0;

  const hasPngs = files.some((f) => f.type === "image/png");

  return (
    <ToolLayout
      title="Image Compressor"
      description="Compress JPEG, PNG, WebP, BMP and TIFF images without losing visible quality. Reduce file sizes for faster websites and easy sharing."
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
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🗜️</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop images here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          JPG, PNG, WebP, BMP, TIFF — batch compress up to 50 MB each
        </p>
      </div>

      {/* Controls */}
      {files.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          {/* Quality slider */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 700 }}>Quality: {quality}%</label>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                {quality <= 40 ? "Smallest file" : quality <= 65 ? "Balanced" : quality <= 85 ? "High quality" : "Near-original"}
              </span>
            </div>
            <input
              type="range" min="10" max="100" value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              style={{ width: "100%", marginTop: "0.5rem" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--muted)" }}>
              <span>Smaller file</span><span>Higher quality</span>
            </div>
          </div>

          {/* PNG-specific options */}
          {hasPngs && (
            <div style={{
              padding: "0.75rem 1rem",
              background: "rgba(234, 179, 8, 0.08)",
              border: "1px solid rgba(234, 179, 8, 0.25)",
              borderRadius: "0.5rem",
              marginBottom: "1.25rem",
              fontSize: "0.8rem",
            }}>
              <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#b45309" }}>
                PNG files detected
              </p>
              <p style={{ color: "var(--muted)", marginBottom: "0.5rem" }}>
                PNG is lossless — the quality slider has no effect on PNGs. For real compression, convert them to WebP or JPEG:
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {([
                  ["webp", "Convert to WebP (best)"] as const,
                  ["jpeg", "Convert to JPEG"] as const,
                  ["same", "Keep as PNG"] as const,
                ]).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setPngMode(val)}
                    style={{
                      padding: "0.35rem 0.75rem",
                      borderRadius: "0.375rem",
                      border: pngMode === val ? "1.5px solid var(--primary)" : "1px solid var(--card-border)",
                      background: pngMode === val ? "rgba(37, 99, 235, 0.08)" : "var(--card-bg)",
                      color: pngMode === val ? "var(--primary)" : "var(--foreground)",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: pngMode === val ? 600 : 400,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* File list */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              {files.length} image{files.length > 1 ? "s" : ""} · {formatSize(files.reduce((s, f) => s + f.size, 0))} total
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
              <span style={{ fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                🖼️ {file.name}
                <span style={{ color: "var(--muted)", marginLeft: "0.5rem" }}>({formatSize(file.size)})</span>
                {file.type === "image/png" && <span style={{ color: "#b45309", marginLeft: "0.5rem", fontSize: "0.7rem" }}>PNG</span>}
              </span>
              <button onClick={() => removeFile(i)}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1rem" }}>✕</button>
            </div>
          ))}

          <button onClick={compress} disabled={processing} className="btn-primary"
            style={{ marginTop: "1rem", width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}>
            {processing ? `Compressing ${progressIdx} of ${files.length}...` : `Compress ${files.length} Image${files.length > 1 ? "s" : ""}`}
          </button>

          {/* Progress bar */}
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
          {/* Total summary */}
          <div style={{
            padding: "1rem 1.25rem",
            background: totalReduction > 5 ? "rgba(34, 197, 94, 0.06)" : "var(--card-bg)",
            border: `1px solid ${totalReduction > 5 ? "rgba(34, 197, 94, 0.2)" : "var(--card-border)"}`,
            borderRadius: "0.75rem",
            marginBottom: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: "1rem" }}>
                {totalReduction > 0 ? `Saved ${totalReduction.toFixed(1)}%` : "Compression complete"}
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                {formatSize(totalOriginal)} → {formatSize(totalCompressed)}
                {totalOriginal - totalCompressed > 0 && (
                  <span style={{ color: "#22c55e" }}> · {formatSize(totalOriginal - totalCompressed)} saved</span>
                )}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ fontSize: "1.75rem", fontWeight: 800, color: totalReduction > 10 ? "#22c55e" : "var(--muted)" }}>
                {totalReduction > 0 ? `−${totalReduction.toFixed(0)}%` : "—"}
              </span>
            </div>
          </div>

          {/* Individual results */}
          {results.map((r, i) => {
            const reduction = ((1 - r.compressedSize / r.originalSize) * 100);
            return (
              <div key={i} style={{
                background: "var(--card-bg)", border: "1px solid var(--card-border)",
                borderRadius: "0.75rem", padding: "1rem", marginBottom: "0.75rem",
              }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  {/* Before / After thumbnails */}
                  <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                    <div style={{ textAlign: "center" }}>
                      <img src={r.previewOriginal} alt="Original" style={{
                        width: "60px", height: "60px", objectFit: "contain",
                        borderRadius: "0.25rem", border: "1px solid var(--card-border)",
                      }} />
                      <div style={{ fontSize: "0.6rem", color: "var(--muted)", marginTop: "0.15rem" }}>Before</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <img src={r.previewCompressed} alt="Compressed" style={{
                        width: "60px", height: "60px", objectFit: "contain",
                        borderRadius: "0.25rem", border: "1px solid var(--card-border)",
                      }} />
                      <div style={{ fontSize: "0.6rem", color: "var(--muted)", marginTop: "0.15rem" }}>After</div>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.name}
                      </span>
                      <span style={{
                        fontWeight: 700, fontSize: "0.8rem",
                        color: reduction > 5 ? "#22c55e" : reduction > 0 ? "#eab308" : "#94a3b8",
                      }}>
                        {reduction > 0 ? `−${reduction.toFixed(1)}%` : "—"}
                      </span>
                    </div>

                    {/* Compression bar */}
                    <div style={{ fontSize: "0.7rem", color: "var(--muted)", display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                      <span>{formatSize(r.originalSize)}</span>
                      <span>{formatSize(r.compressedSize)}</span>
                    </div>
                    <div style={{ height: "6px", background: "var(--card-border)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        background: reduction > 20 ? "#22c55e" : reduction > 5 ? "#eab308" : "#94a3b8",
                        borderRadius: "3px",
                        width: `${Math.max(5, (r.compressedSize / r.originalSize) * 100)}%`,
                        transition: "width 0.5s",
                      }} />
                    </div>
                    {r.wasPng && r.outputMode !== "same" && (
                      <p style={{ fontSize: "0.65rem", color: "#b45309", marginTop: "0.2rem" }}>
                        Converted from PNG to {r.outputMode === "webp" ? "WebP" : "JPEG"}
                      </p>
                    )}

                    <a href={r.url} download={r.name} className="btn-primary"
                      style={{ marginTop: "0.5rem", padding: "0.4rem 1rem", fontSize: "0.8rem", textDecoration: "none", display: "inline-block" }}>
                      Download
                    </a>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Compress more button */}
          <button onClick={() => { setFiles([]); setResults([]); }} style={{
            width: "100%", padding: "0.6rem", marginTop: "0.5rem",
            background: "none", border: "1px solid var(--card-border)", borderRadius: "0.5rem",
            cursor: "pointer", color: "var(--primary)", fontSize: "0.85rem", fontWeight: 600,
          }}>
            Compress More Images
          </button>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Compress Images Online
        </h2>
        <p>
          Upload your images and adjust the quality slider. JPEG and WebP images are compressed
          using lossy compression at your chosen quality level. PNG files are lossless by nature —
          for real size reduction, convert them to WebP (recommended) or JPEG. Our compressor
          works entirely in your browser — no files are uploaded to any server. Perfect for
          optimizing images for websites, emails, and social media.
        </p>
      </section>
    </ToolLayout>
  );
}
