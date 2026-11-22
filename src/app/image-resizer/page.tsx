"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";

type FitMode = "stretch" | "contain" | "cover";
type OutputFormat = "original" | "jpeg" | "png" | "webp";

interface ResizedImage {
  name: string;
  originalSize: number;
  resizedSize: number;
  originalDims: string;
  resizedDims: string;
  url: string;
  preview: string;
}

interface PresetGroup {
  label: string;
  presets: { name: string; w: number; h: number }[];
}

const PRESET_GROUPS: PresetGroup[] = [
  {
    label: "Common Sizes",
    presets: [
      { name: "HD 1920×1080", w: 1920, h: 1080 },
      { name: "2K 2560×1440", w: 2560, h: 1440 },
      { name: "4K 3840×2160", w: 3840, h: 2160 },
      { name: "Square 1080", w: 1080, h: 1080 },
      { name: "800×600", w: 800, h: 600 },
    ],
  },
  {
    label: "Instagram",
    presets: [
      { name: "Post 1080×1080", w: 1080, h: 1080 },
      { name: "Portrait 1080×1350", w: 1080, h: 1350 },
      { name: "Story 1080×1920", w: 1080, h: 1920 },
      { name: "Landscape 1080×566", w: 1080, h: 566 },
    ],
  },
  {
    label: "Facebook",
    presets: [
      { name: "Post 1200×630", w: 1200, h: 630 },
      { name: "Cover 820×312", w: 820, h: 312 },
      { name: "Profile 170×170", w: 170, h: 170 },
      { name: "Story 1080×1920", w: 1080, h: 1920 },
    ],
  },
  {
    label: "Twitter / X",
    presets: [
      { name: "Post 1600×900", w: 1600, h: 900 },
      { name: "Header 1500×500", w: 1500, h: 500 },
      { name: "Profile 400×400", w: 400, h: 400 },
    ],
  },
  {
    label: "LinkedIn",
    presets: [
      { name: "Post 1200×627", w: 1200, h: 627 },
      { name: "Cover 1584×396", w: 1584, h: 396 },
      { name: "Profile 400×400", w: 400, h: 400 },
    ],
  },
  {
    label: "YouTube",
    presets: [
      { name: "Thumbnail 1280×720", w: 1280, h: 720 },
      { name: "Banner 2560×1440", w: 2560, h: 1440 },
      { name: "Channel Art 2048×1152", w: 2048, h: 1152 },
    ],
  },
];

export default function ImageResizer() {
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [lockAspect, setLockAspect] = useState(true);
  const [fitMode, setFitMode] = useState<FitMode>("contain");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("original");
  const [quality, setQuality] = useState(90);
  const [scalePercent, setScalePercent] = useState<number | null>(null);
  const [results, setResults] = useState<ResizedImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progressIdx, setProgressIdx] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const imageFiles = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...imageFiles]);
    setResults([]);
    setScalePercent(null);
  }, []);

  // Read dimensions of first file for aspect-ratio lock
  useEffect(() => {
    if (files.length === 0) return;
    const img = new Image();
    img.onload = () => {
      setNaturalW(img.naturalWidth);
      setNaturalH(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = URL.createObjectURL(files[0]);
  }, [files]);

  const handleWidthChange = (w: number) => {
    setWidth(w);
    setScalePercent(null);
    if (lockAspect && naturalW > 0) {
      setHeight(Math.round((w / naturalW) * naturalH));
    }
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    setScalePercent(null);
    if (lockAspect && naturalH > 0) {
      setWidth(Math.round((h / naturalH) * naturalW));
    }
  };

  const applyScale = (pct: number) => {
    setScalePercent(pct);
    if (naturalW > 0) {
      setWidth(Math.round(naturalW * pct / 100));
      setHeight(Math.round(naturalH * pct / 100));
    }
  };

  const applyPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
    setScalePercent(null);
    setLockAspect(false);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const resize = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResults([]);
    setProgressIdx(0);

    const resized: ResizedImage[] = [];

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

        const targetW = scalePercent ? Math.round(img.naturalWidth * scalePercent / 100) : width;
        const targetH = scalePercent ? Math.round(img.naturalHeight * scalePercent / 100) : height;

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d")!;

        if (fitMode === "stretch") {
          ctx.drawImage(img, 0, 0, targetW, targetH);
        } else if (fitMode === "contain") {
          const scale = Math.min(targetW / img.naturalWidth, targetH / img.naturalHeight);
          const dw = img.naturalWidth * scale;
          const dh = img.naturalHeight * scale;
          const dx = (targetW - dw) / 2;
          const dy = (targetH - dh) / 2;
          // Transparent / white background
          if (outputFormat === "jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, targetW, targetH);
          }
          ctx.drawImage(img, dx, dy, dw, dh);
        } else {
          // Cover
          const scale = Math.max(targetW / img.naturalWidth, targetH / img.naturalHeight);
          const dw = img.naturalWidth * scale;
          const dh = img.naturalHeight * scale;
          const dx = (targetW - dw) / 2;
          const dy = (targetH - dh) / 2;
          ctx.drawImage(img, dx, dy, dw, dh);
        }

        // Determine output MIME and extension
        let mimeType: string;
        let ext: string;
        if (outputFormat === "original") {
          if (file.type === "image/png") { mimeType = "image/png"; ext = "png"; }
          else if (file.type === "image/webp") { mimeType = "image/webp"; ext = "webp"; }
          else { mimeType = "image/jpeg"; ext = "jpg"; }
        } else {
          mimeType = `image/${outputFormat}`;
          ext = outputFormat === "jpeg" ? "jpg" : outputFormat;
        }

        const qualityVal = (mimeType === "image/png") ? undefined : quality / 100;
        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), mimeType, qualityVal)
        );

        // Build preview
        const prevCanvas = document.createElement("canvas");
        const pRatio = Math.min(80 / targetW, 80 / targetH, 1);
        prevCanvas.width = targetW * pRatio;
        prevCanvas.height = targetH * pRatio;
        prevCanvas.getContext("2d")!.drawImage(canvas, 0, 0, prevCanvas.width, prevCanvas.height);
        const preview = prevCanvas.toDataURL("image/jpeg", 0.6);

        URL.revokeObjectURL(url);

        const baseName = file.name.replace(/\.[^.]+$/, "");

        resized.push({
          name: `${baseName}-${targetW}x${targetH}.${ext}`,
          originalSize: file.size,
          resizedSize: blob.size,
          originalDims: `${img.naturalWidth}×${img.naturalHeight}`,
          resizedDims: `${targetW}×${targetH}`,
          url: URL.createObjectURL(blob),
          preview,
        });
      } catch (err) {
        console.error(`Error resizing ${file.name}:`, err);
      }
    }

    setResults(resized);
    setProcessing(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <ToolLayout
      title="Image Resizer"
      description="Resize images to exact dimensions, scale by percentage, or use social media presets. Batch resize with fit modes — 100% private, runs in your browser."
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
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📐</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop images here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          JPG, PNG, WebP — batch resize with presets for every social platform
        </p>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          {/* Dimension inputs */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 700, display: "block", marginBottom: "0.5rem" }}>Dimensions (px)</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: "0.65rem", color: "var(--muted)" }}>Width</label>
                <input type="number" value={width} onChange={(e) => handleWidthChange(Number(e.target.value))}
                  style={{ width: "90px", padding: "0.4rem", borderRadius: "0.25rem", border: "1px solid var(--card-border)", fontSize: "0.85rem", display: "block" }}
                />
              </div>
              <button
                onClick={() => setLockAspect(!lockAspect)}
                title={lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                style={{
                  background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem",
                  marginTop: "0.75rem", color: lockAspect ? "var(--primary)" : "var(--muted)",
                }}
              >
                {lockAspect ? "🔗" : "🔓"}
              </button>
              <div>
                <label style={{ fontSize: "0.65rem", color: "var(--muted)" }}>Height</label>
                <input type="number" value={height} onChange={(e) => handleHeightChange(Number(e.target.value))}
                  style={{ width: "90px", padding: "0.4rem", borderRadius: "0.25rem", border: "1px solid var(--card-border)", fontSize: "0.85rem", display: "block" }}
                />
              </div>
              {naturalW > 0 && (
                <span style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.75rem" }}>
                  Original: {naturalW}×{naturalH}
                </span>
              )}
            </div>
          </div>

          {/* Scale by percentage */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 700, display: "block", marginBottom: "0.5rem" }}>Scale by Percentage</label>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {[25, 50, 75, 100, 150, 200].map((pct) => (
                <button
                  key={pct}
                  onClick={() => applyScale(pct)}
                  style={{
                    padding: "0.3rem 0.6rem",
                    borderRadius: "0.375rem",
                    border: scalePercent === pct ? "1.5px solid var(--primary)" : "1px solid var(--card-border)",
                    background: scalePercent === pct ? "rgba(37, 99, 235, 0.08)" : "var(--card-bg)",
                    color: scalePercent === pct ? "var(--primary)" : "var(--foreground)",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: scalePercent === pct ? 600 : 400,
                  }}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Social media presets */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 700, display: "block", marginBottom: "0.5rem" }}>Social Media Presets</label>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              {PRESET_GROUPS.map((group) => (
                <button
                  key={group.label}
                  onClick={() => setActiveGroup(activeGroup === group.label ? null : group.label)}
                  style={{
                    padding: "0.3rem 0.65rem",
                    borderRadius: "0.375rem",
                    border: activeGroup === group.label ? "1.5px solid var(--primary)" : "1px solid var(--card-border)",
                    background: activeGroup === group.label ? "rgba(37, 99, 235, 0.08)" : "var(--card-bg)",
                    color: activeGroup === group.label ? "var(--primary)" : "var(--foreground)",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: activeGroup === group.label ? 600 : 400,
                  }}
                >
                  {group.label}
                </button>
              ))}
            </div>
            {activeGroup && (
              <div style={{
                display: "flex", gap: "0.35rem", flexWrap: "wrap",
                padding: "0.5rem 0.75rem",
                background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.5rem",
              }}>
                {PRESET_GROUPS.find((g) => g.label === activeGroup)?.presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p.w, p.h)}
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                      border: (width === p.w && height === p.h) ? "1.5px solid var(--primary)" : "1px solid var(--card-border)",
                      background: (width === p.w && height === p.h) ? "rgba(37, 99, 235, 0.08)" : "transparent",
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      color: "var(--foreground)",
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fit mode */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 700, display: "block", marginBottom: "0.5rem" }}>Fit Mode</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {([
                ["contain", "Contain", "Fit inside, no cropping (may add padding)"],
                ["cover", "Cover", "Fill dimensions, crop overflow"],
                ["stretch", "Stretch", "Exact size, may distort"],
              ] as const).map(([val, label, desc]) => (
                <button
                  key={val}
                  onClick={() => setFitMode(val)}
                  title={desc}
                  style={{
                    padding: "0.4rem 0.8rem",
                    borderRadius: "0.375rem",
                    border: fitMode === val ? "1.5px solid var(--primary)" : "1px solid var(--card-border)",
                    background: fitMode === val ? "rgba(37, 99, 235, 0.08)" : "var(--card-bg)",
                    color: fitMode === val ? "var(--primary)" : "var(--foreground)",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: fitMode === val ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Output format & quality */}
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.9rem", fontWeight: 700, display: "block", marginBottom: "0.5rem" }}>Output Format</label>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {([
                  ["original", "Original"],
                  ["jpeg", "JPEG"],
                  ["png", "PNG"],
                  ["webp", "WebP"],
                ] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setOutputFormat(val)}
                    style={{
                      padding: "0.3rem 0.6rem",
                      borderRadius: "0.375rem",
                      border: outputFormat === val ? "1.5px solid var(--primary)" : "1px solid var(--card-border)",
                      background: outputFormat === val ? "rgba(37, 99, 235, 0.08)" : "var(--card-bg)",
                      color: outputFormat === val ? "var(--primary)" : "var(--foreground)",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: outputFormat === val ? 600 : 400,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {(outputFormat === "jpeg" || outputFormat === "webp" || (outputFormat === "original")) && (
              <div style={{ flex: 1, minWidth: "150px" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 700, display: "block", marginBottom: "0.5rem" }}>
                  Quality: {quality}%
                </label>
                <input type="range" min="10" max="100" value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>
            )}
          </div>

          {/* File list */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              {files.length} file{files.length > 1 ? "s" : ""}
            </p>
            <button onClick={() => {
              const input = document.createElement("input");
              input.type = "file"; input.accept = "image/*"; input.multiple = true;
              input.onchange = () => handleFiles(input.files); input.click();
            }} style={{
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

          <button onClick={resize} disabled={processing} className="btn-primary"
            style={{ marginTop: "1rem", width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}>
            {processing ? `Resizing ${progressIdx} of ${files.length}...` : `Resize ${files.length} Image${files.length > 1 ? "s" : ""} to ${width}×${height}`}
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
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
            Resized {results.length} image{results.length > 1 ? "s" : ""}
          </h3>

          {results.map((r, i) => (
            <div key={i} style={{
              display: "flex", gap: "1rem", alignItems: "flex-start",
              background: "var(--card-bg)", border: "1px solid var(--card-border)",
              borderRadius: "0.75rem", padding: "1rem", marginBottom: "0.75rem",
            }}>
              <img src={r.preview} alt={r.name} style={{
                width: "64px", height: "64px", objectFit: "contain",
                borderRadius: "0.25rem", border: "1px solid var(--card-border)", flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.name}
                </p>
                <p style={{ fontSize: "0.7rem", color: "var(--muted)", margin: "0.2rem 0" }}>
                  {r.originalDims} → {r.resizedDims} · {formatSize(r.originalSize)} → {formatSize(r.resizedSize)}
                </p>
                <a href={r.url} download={r.name} className="btn-primary"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem", textDecoration: "none", display: "inline-block", marginTop: "0.3rem" }}>
                  Download
                </a>
              </div>
            </div>
          ))}

          <button onClick={() => { setFiles([]); setResults([]); }} style={{
            width: "100%", padding: "0.6rem", marginTop: "0.5rem",
            background: "none", border: "1px solid var(--card-border)", borderRadius: "0.5rem",
            cursor: "pointer", color: "var(--primary)", fontSize: "0.85rem", fontWeight: 600,
          }}>
            Resize More Images
          </button>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          Resize Images for Any Platform
        </h2>
        <p>
          Quickly resize images to exact pixel dimensions, scale by percentage, or use built-in
          presets for Instagram, Facebook, Twitter, LinkedIn and YouTube. Choose between Contain
          (fit inside without cropping), Cover (fill and crop edges), or Stretch (distort to
          exact size). All processing happens in your browser — no uploads required.
        </p>
      </section>
    </ToolLayout>
  );
}
