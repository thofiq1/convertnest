"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";

interface ResizedImage {
  file: File;
  previewUrl: string;
  originalWidth: number;
  originalHeight: number;
  resizedBlob: Blob | null;
  resizedUrl: string | null;
  processing: boolean;
}

const socialPresets = [
  { label: "Instagram Post", w: 1080, h: 1080 },
  { label: "Instagram Story", w: 1080, h: 1920 },
  { label: "Facebook Cover", w: 820, h: 312 },
  { label: "Twitter Header", w: 1500, h: 500 },
  { label: "YouTube Thumbnail", w: 1280, h: 720 },
  { label: "LinkedIn Banner", w: 1584, h: 396 },
  { label: "Full HD", w: 1920, h: 1080 },
  { label: "4K", w: 3840, h: 2160 },
];

export default function ImageResizer() {
  const [images, setImages] = useState<ResizedImage[]>([]);
  const [mode, setMode] = useState<"exact" | "percentage" | "preset">("exact");
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [lockAspect, setLockAspect] = useState(true);
  const [percentage, setPercentage] = useState(50);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [outputFormat, setOutputFormat] = useState<"original" | "jpeg" | "png" | "webp">("original");
  const [quality, setQuality] = useState(92);
  const [dragOver, setDragOver] = useState(false);

  // Cleanup Object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
        if (img.resizedUrl) URL.revokeObjectURL(img.resizedUrl);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resizeImage = async (
    file: File, targetW: number, targetH: number, fmt: string, q: number
  ): Promise<{ blob: Blob; url: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Failed to load image: ${file.name}`));
      };
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Canvas not supported by your browser"));
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        let mimeType: string;
        if (fmt === "original") {
          mimeType = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
        } else {
          const mimeMap: Record<string, string> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
          mimeType = mimeMap[fmt] || "image/jpeg";
        }

        if (mimeType === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const qualityParam = mimeType === "image/png" ? undefined : q / 100;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              URL.revokeObjectURL(url);
              reject(new Error("Failed to resize image"));
              return;
            }
            const resUrl = URL.createObjectURL(blob);
            canvas.width = 0;
            canvas.height = 0;
            URL.revokeObjectURL(url);
            resolve({ blob, url: resUrl });
          },
          mimeType,
          qualityParam
        );
      };
      img.src = url;
    });
  };

  const getTargetDimensions = (origW: number, origH: number): [number, number] => {
    if (mode === "percentage") {
      return [Math.round(origW * percentage / 100), Math.round(origH * percentage / 100)];
    }
    if (mode === "preset") {
      const preset = socialPresets[selectedPreset];
      return [preset.w, preset.h];
    }
    // exact
    if (lockAspect) {
      const aspect = origW / origH;
      return [width, Math.round(width / aspect)];
    }
    return [width, height];
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const imgFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));

    const newImages: ResizedImage[] = [];
    for (const file of imgFiles) {
      const url = URL.createObjectURL(file);
      const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.width, h: img.height });
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Failed to load image: ${file.name}`)); };
        img.src = url;
      });
      newImages.push({
        file, previewUrl: url,
        originalWidth: dims.w, originalHeight: dims.h,
        resizedBlob: null, resizedUrl: null, processing: false,
      });
    }

    setImages((prev) => [...prev, ...newImages]);
    if (newImages.length > 0 && mode === "exact") {
      setWidth(newImages[0].originalWidth);
      setHeight(newImages[0].originalHeight);
    }
  }, [mode]);

  const resizeAll = async () => {
    setImages((prev) => prev.map((img) => ({ ...img, processing: true, resizedBlob: null, resizedUrl: null })));

    for (const img of images) {
      const [tw, th] = getTargetDimensions(img.originalWidth, img.originalHeight);
      const { blob, url } = await resizeImage(img.file, tw, th, outputFormat, quality);
      setImages((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((r) => r.file === img.file);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], resizedBlob: blob, resizedUrl: url, processing: false };
        }
        return updated;
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const downloadSingle = (img: ResizedImage) => {
    if (!img.resizedUrl) return;
    const extMap: Record<string, string> = { jpeg: "jpg", png: "png", webp: "webp" };
    const ext = outputFormat === "original" ? img.file.name.split(".").pop() : extMap[outputFormat];
    const a = document.createElement("a");
    a.href = img.resizedUrl;
    a.download = img.file.name.replace(/\.[^.]+$/, "") + `-resized.${ext}`;
    a.click();
  };

  const downloadAll = async () => {
    const completed = images.filter((img) => img.resizedBlob);
    if (completed.length === 0) return;
    if (completed.length === 1) { downloadSingle(completed[0]); return; }

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const extMap: Record<string, string> = { jpeg: "jpg", png: "png", webp: "webp" };
    completed.forEach((img) => {
      const ext = outputFormat === "original" ? img.file.name.split(".").pop() || "jpg" : extMap[outputFormat];
      zip.file(img.file.name.replace(/\.[^.]+$/, "") + `-resized.${ext}`, img.resizedBlob!);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    const zipUrl = URL.createObjectURL(blob);
    a.href = zipUrl;
    a.download = "resized-images.zip";
    a.click();
    URL.revokeObjectURL(zipUrl);
  };

  const completedCount = images.filter((img) => img.resizedBlob).length;

  return (
    <ToolLayout
      title="Image Resizer"
      description="Resize images to exact dimensions, by percentage, or social media presets. Batch resize supported."
    >
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
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📐</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop images here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Resize to any dimension or social media size</p>
      </div>

      {images.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          {/* Mode tabs */}
          <div style={{ display: "flex", gap: "0", marginBottom: "1rem", borderRadius: "0.5rem", overflow: "hidden", border: "1px solid var(--card-border)" }}>
            {([
              { key: "exact" as const, label: "Exact Size" },
              { key: "percentage" as const, label: "Percentage" },
              { key: "preset" as const, label: "Social Media" },
            ]).map((m) => (
              <button key={m.key} onClick={() => setMode(m.key)}
                style={{
                  flex: 1, padding: "0.6rem", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
                  background: mode === m.key ? "var(--primary)" : "var(--card-bg)",
                  color: mode === m.key ? "#fff" : "var(--foreground)", transition: "all 0.15s",
                }}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Settings */}
          <div style={{
            padding: "1rem", background: "var(--card-bg)", border: "1px solid var(--card-border)",
            borderRadius: "0.5rem", marginBottom: "1rem",
          }}>
            {mode === "exact" && (
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Width (px)</label>
                  <input type="number" value={width} onChange={(e) => {
                    const w = parseInt(e.target.value) || 0;
                    setWidth(w);
                    if (lockAspect && images.length > 0) {
                      const aspect = images[0].originalWidth / images[0].originalHeight;
                      setHeight(Math.round(w / aspect));
                    }
                  }}
                    style={{ width: "100%", padding: "0.5rem", border: "1px solid var(--card-border)", borderRadius: "0.3rem", background: "var(--card-bg)", fontSize: "0.9rem" }}
                  />
                </div>
                <button onClick={() => setLockAspect(!lockAspect)}
                  style={{
                    padding: "0.5rem", border: "1px solid var(--card-border)", borderRadius: "0.3rem",
                    background: lockAspect ? "var(--primary)" : "var(--card-bg)",
                    color: lockAspect ? "#fff" : "var(--foreground)",
                    cursor: "pointer", fontSize: "1rem", marginBottom: "1px",
                  }}>
                  {lockAspect ? "🔗" : "🔓"}
                </button>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Height (px)</label>
                  <input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                    disabled={lockAspect}
                    style={{
                      width: "100%", padding: "0.5rem", border: "1px solid var(--card-border)",
                      borderRadius: "0.3rem", background: "var(--card-bg)", fontSize: "0.9rem",
                      opacity: lockAspect ? 0.5 : 1,
                    }}
                  />
                </div>
              </div>
            )}

            {mode === "percentage" && (
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                  Scale: {percentage}%
                </label>
                <input type="range" min="10" max="200" step="5" value={percentage}
                  onChange={(e) => setPercentage(parseInt(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--muted)" }}>
                  <span>10%</span><span>100%</span><span>200%</span>
                </div>
              </div>
            )}

            {mode === "preset" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.5rem" }}>
                {socialPresets.map((preset, i) => (
                  <button key={i} onClick={() => setSelectedPreset(i)}
                    style={{
                      padding: "0.6rem", border: selectedPreset === i ? "2px solid var(--primary)" : "1px solid var(--card-border)",
                      borderRadius: "0.3rem", background: selectedPreset === i ? "rgba(37,99,235,0.06)" : "var(--card-bg)",
                      cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                    }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{preset.label}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{preset.w} × {preset.h}</div>
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Output Format</label>
                <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as "original" | "jpeg" | "png" | "webp")}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--card-border)", background: "var(--card-bg)", fontSize: "0.85rem" }}>
                  <option value="original">Keep Original</option>
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
              {(outputFormat === "jpeg" || outputFormat === "webp") && (
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Quality: {quality}%
                  </label>
                  <input type="range" min="10" max="100" step="5" value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* File list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
            {images.map((img, i) => {
              const [tw, th] = getTargetDimensions(img.originalWidth, img.originalHeight);
              return (
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
                      {img.processing ? "Resizing..." : (
                        <>
                          {img.originalWidth}×{img.originalHeight} → {tw}×{th}
                          {img.resizedBlob && <span style={{ marginLeft: "0.4rem" }}>({formatSize(img.resizedBlob.size)})</span>}
                        </>
                      )}
                    </div>
                  </div>
                  {img.resizedUrl && (
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
              );
            })}
          </div>

          <button onClick={resizeAll} disabled={images.some((img) => img.processing)} className="btn-primary"
            style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            {images.some((img) => img.processing) ? "Resizing..." : `Resize ${images.length} Image${images.length !== 1 ? "s" : ""}`}
          </button>

          {completedCount > 0 && (
            <button onClick={downloadAll} className="btn-secondary"
              style={{ width: "100%", padding: "0.75rem", fontSize: "0.9rem", fontWeight: 600 }}>
              {completedCount > 1 ? `Download All ${completedCount} (ZIP)` : "Download Resized Image"}
            </button>
          )}
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Resize Images Online
        </h2>
        <p>
          Upload images and choose your resize method: exact pixel dimensions with aspect ratio lock,
          percentage scaling, or preset social media sizes (Instagram, Facebook, Twitter, YouTube, LinkedIn).
          Optionally convert to a different format and adjust quality. Batch resize multiple images and
          download them individually or as a ZIP. All processing happens in your browser — your images
          are never uploaded.
        </p>
      </section>
    </ToolLayout>
  );
}
