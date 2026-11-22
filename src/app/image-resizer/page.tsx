"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [keepAspect, setKeepAspect] = useState(true);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith("image/")) { alert("Please select an image file."); return; }
    setFile(f);
    setResultUrl(null);

    const img = new Image();
    img.onload = () => {
      setOriginalDims({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = URL.createObjectURL(f);
  }, []);

  const updateWidth = (w: number) => {
    setWidth(w);
    if (keepAspect && originalDims.w > 0) {
      setHeight(Math.round((w / originalDims.w) * originalDims.h));
    }
  };

  const updateHeight = (h: number) => {
    setHeight(h);
    if (keepAspect && originalDims.h > 0) {
      setWidth(Math.round((h / originalDims.h) * originalDims.w));
    }
  };

  const resize = async () => {
    if (!file || width <= 0 || height <= 0) return;
    setProcessing(true);
    setResultUrl(null);

    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = url; });
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), outputType, 0.92));
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch (err) {
      console.error("Resize error:", err);
      alert("Error resizing image.");
    }

    setProcessing(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const presets = [
    { label: "50%", w: Math.round(originalDims.w * 0.5), h: Math.round(originalDims.h * 0.5) },
    { label: "25%", w: Math.round(originalDims.w * 0.25), h: Math.round(originalDims.h * 0.25) },
    { label: "1920×1080", w: 1920, h: 1080 },
    { label: "1080×1080", w: 1080, h: 1080 },
    { label: "800×600", w: 800, h: 600 },
  ];

  return (
    <ToolLayout
      title="Image Resizer"
      description="Resize images to exact dimensions or scale by percentage."
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files); }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = () => handleFile(input.files);
          input.click();
        }}
        style={{
          border: `2px dashed ${dragOver ? "var(--primary)" : "var(--card-border)"}`,
          borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center",
          cursor: "pointer", background: dragOver ? "var(--accent)" : "var(--card-bg)", transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📐</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop an image here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          JPG, PNG, WebP — resize to any dimension
        </p>
      </div>

      {file && originalDims.w > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            🖼️ {file.name} — {originalDims.w} × {originalDims.h} px ({formatSize(file.size)})
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
            {presets.map((p) => (
              <button key={p.label} onClick={() => { setWidth(p.w); setHeight(p.h); }}
                style={{
                  padding: "0.4rem 0.75rem", borderRadius: "0.5rem",
                  border: "1px solid var(--card-border)", background: "var(--card-bg)",
                  color: "var(--foreground)", cursor: "pointer", fontSize: "0.8rem",
                }}>
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "end", flexWrap: "wrap", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Width (px)</label>
              <input type="number" value={width} onChange={(e) => updateWidth(parseInt(e.target.value) || 0)} min={1}
                style={{ width: "120px", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--card-border)", background: "var(--card-bg)", color: "var(--foreground)", fontSize: "0.9rem" }} />
            </div>
            <span style={{ fontSize: "1.2rem", paddingBottom: "0.3rem" }}>×</span>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Height (px)</label>
              <input type="number" value={height} onChange={(e) => updateHeight(parseInt(e.target.value) || 0)} min={1}
                style={{ width: "120px", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--card-border)", background: "var(--card-bg)", color: "var(--foreground)", fontSize: "0.9rem" }} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", paddingBottom: "0.3rem", cursor: "pointer" }}>
              <input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} /> Lock ratio
            </label>
          </div>

          <button onClick={resize} disabled={processing} className="btn-primary"
            style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", fontWeight: 600 }}>
            {processing ? "Resizing..." : `Resize to ${width} × ${height}`}
          </button>
        </div>
      )}

      {resultUrl && (
        <div className="result-box" style={{ marginTop: "1.5rem", padding: "1.5rem", textAlign: "center" }}>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#22c55e" }}>Resized!</p>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1rem" }}>
            {width} × {height} px — {formatSize(resultSize)}
          </p>
          <a href={resultUrl} download={`resized-${file?.name}`} className="btn-primary"
            style={{ padding: "0.75rem 2rem", fontSize: "1rem", textDecoration: "none", display: "inline-block" }}>
            Download Resized Image
          </a>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          Resize Images Online Free
        </h2>
        <p>
          Quickly resize any image to exact pixel dimensions. Use presets for common sizes or enter custom width and height. Keep the aspect ratio locked to avoid distortion. Perfect for social media, websites, or email.
        </p>
      </section>
    </ToolLayout>
  );
}
