"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";
interface ConvertedFile { name: string; url: string; size: number; originalSize: number; }

export default function ImageConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ConvertedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState(0.92);

  const formatExt: Record<OutputFormat, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const formatLabel: Record<OutputFormat, string> = { "image/jpeg": "JPG", "image/png": "PNG", "image/webp": "WebP" };

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const imageFiles = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...imageFiles]);
    setResults([]);
  }, []);

  const convert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResults([]);

    const converted: ConvertedFile[] = [];
    for (const file of files) {
      try {
        const img = new Image();
        const url = URL.createObjectURL(file);
        await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = url; });
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), outputFormat, quality));
        const baseName = file.name.replace(/\.[^.]+$/, "");
        converted.push({
          name: `${baseName}.${formatExt[outputFormat]}`,
          url: URL.createObjectURL(blob),
          size: blob.size,
          originalSize: file.size,
        });
      } catch (err) {
        console.error(`Error converting ${file.name}:`, err);
      }
    }

    setResults(converted);
    setProcessing(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <ToolLayout
      title="Image Converter"
      description="Convert images between JPG, PNG, and WebP formats instantly."
    >
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
          borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center",
          cursor: "pointer", background: dragOver ? "var(--accent)" : "var(--card-bg)", transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔄</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop images here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          JPG, PNG, WebP, BMP, GIF — convert to any format
        </p>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Convert to</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(["image/jpeg", "image/png", "image/webp"] as const).map((fmt) => (
                  <button key={fmt} onClick={() => setOutputFormat(fmt)}
                    style={{
                      padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--card-border)",
                      background: outputFormat === fmt ? "var(--primary)" : "var(--card-bg)",
                      color: outputFormat === fmt ? "white" : "var(--foreground)",
                      cursor: "pointer", fontSize: "0.85rem",
                    }}>
                    {formatLabel[fmt]}
                  </button>
                ))}
              </div>
            </div>
            {outputFormat !== "image/png" && (
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
                  Quality: {Math.round(quality * 100)}%
                </label>
                <input type="range" min="0.1" max="1" step="0.05" value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))} style={{ width: "150px" }} />
              </div>
            )}
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>

          <button onClick={convert} disabled={processing} className="btn-primary"
            style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", fontWeight: 600 }}>
            {processing ? "Converting..." : `Convert to ${formatLabel[outputFormat]}`}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="result-box" style={{ marginTop: "1.5rem", padding: "1.5rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "1rem", color: "#22c55e" }}>Converted {results.length} file{results.length > 1 ? "s" : ""}!</p>
          {results.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: i < results.length - 1 ? "1px solid var(--card-border)" : "none", fontSize: "0.85rem" }}>
              <div>
                <span>{r.name}</span>
                <span style={{ color: "var(--muted)", marginLeft: "0.75rem" }}>{formatSize(r.originalSize)} → {formatSize(r.size)}</span>
              </div>
              <a href={r.url} download={r.name} className="btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", textDecoration: "none" }}>Download</a>
            </div>
          ))}
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          Convert Images Between Formats
        </h2>
        <p>
          Easily convert WebP to JPG, PNG to WebP, or any image format combination. Batch convert multiple images at once with adjustable quality. Great for web optimization and compatibility.
        </p>
      </section>
    </ToolLayout>
  );
}
