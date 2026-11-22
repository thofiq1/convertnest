"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

interface CompressedImage {
  name: string;
  originalSize: number;
  compressedSize: number;
  url: string;
}

export default function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(80);
  const [results, setResults] = useState<CompressedImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const imageFiles = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...imageFiles]);
    setResults([]);
  }, []);

  const compress = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResults([]);

    for (const file of files) {
      try {
        const img = new Image();
        const url = URL.createObjectURL(file);
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);

        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const qualityVal = mimeType === "image/png" ? undefined : quality / 100;

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), mimeType, qualityVal)
        );

        const resultUrl = URL.createObjectURL(blob);
        URL.revokeObjectURL(url);

        setResults((prev) => [
          ...prev,
          {
            name: file.name,
            originalSize: file.size,
            compressedSize: blob.size,
            url: resultUrl,
          },
        ]);
      } catch {
        console.error(`Error compressing ${file.name}`);
      }
    }

    setProcessing(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <ToolLayout
      title="Image Compressor"
      description="Compress JPEG, PNG, and WebP images without losing visible quality. Reduce file sizes for faster websites and easy sharing."
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
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🗜️</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop images here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          Supports JPG, PNG, WebP — up to 50MB per file
        </p>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              Quality: {quality}%
            </label>
            <input
              type="range" min="10" max="100" value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              style={{ width: "100%", marginTop: "0.5rem" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--muted)" }}>
              <span>Smaller file</span><span>Higher quality</span>
            </div>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
            {files.length} image{files.length > 1 ? "s" : ""} selected
          </p>

          <button onClick={compress} disabled={processing} className="btn-primary"
            style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", fontWeight: 600 }}>
            {processing ? "Compressing..." : `Compress Image${files.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Compressed Images</h3>
          {results.map((r, i) => {
            const reduction = ((1 - r.compressedSize / r.originalSize) * 100).toFixed(1);
            return (
              <div key={i} className="result-box" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", marginBottom: "0.5rem" }}>
                <div>
                  <p style={{ fontWeight: 600 }}>{r.name}</p>
                  <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {formatSize(r.originalSize)} → {formatSize(r.compressedSize)}{" "}
                    <span style={{ color: Number(reduction) > 0 ? "#22c55e" : "var(--muted)" }}>
                      ({Number(reduction) > 0 ? `-${reduction}%` : "no change"})
                    </span>
                  </p>
                </div>
                <a href={r.url} download={r.name.replace(/\.[^.]+$/, "-compressed$&")} className="btn-primary"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", textDecoration: "none" }}>
                  Download
                </a>
              </div>
            );
          })}
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Compress Images Online
        </h2>
        <p>
          Upload your images, adjust the quality slider, and download the compressed versions.
          Our image compressor works entirely in your browser — no uploads to any server.
          Perfect for optimizing images for websites, emails, and social media.
        </p>
      </section>
    </ToolLayout>
  );
}
