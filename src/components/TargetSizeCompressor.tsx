"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { sizePages } from "@/lib/sizePages";

interface Result {
  url: string;
  size: number;
  width: number;
  height: number;
  quality: number;
  reachedTarget: boolean;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read this image. Try a JPG, PNG or WebP file.")); };
    img.src = url;
  });
}

function encode(img: HTMLImageElement, w: number, h: number, q: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("Canvas not supported"));
  ctx.fillStyle = "#ffffff"; // JPG has no transparency
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Compression failed"))), "image/jpeg", q)
  );
}

// Finds the highest JPG quality that fits under the target. If even the lowest
// sensible quality is too big, shrinks the dimensions and tries again.
async function compressToTarget(file: File, targetBytes: number) {
  const img = await loadImage(file);
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  let best: { blob: Blob; w: number; h: number; q: number } | null = null;

  for (let round = 0; round < 12; round++) {
    let lo = 0.1, hi = 0.95, found: { blob: Blob; q: number } | null = null;
    for (let i = 0; i < 7; i++) {
      const mid = (lo + hi) / 2;
      const blob = await encode(img, w, h, mid);
      if (blob.size <= targetBytes) { found = { blob, q: mid }; lo = mid; } else { hi = mid; }
    }
    if (found) { best = { blob: found.blob, w, h, q: found.q }; break; }
    w = Math.max(1, Math.round(w * 0.8));
    h = Math.max(1, Math.round(h * 0.8));
  }

  if (!best) {
    const blob = await encode(img, w, h, 0.1);
    return { blob, w, h, q: 0.1, reached: blob.size <= targetBytes };
  }
  return { blob: best.blob, w: best.w, h: best.h, q: best.q, reached: true };
}

const fmt = (bytes: number) => (bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`);

export default function TargetSizeCompressor({ defaultKb }: { defaultKb: number }) {
  const [targetKb, setTargetKb] = useState(defaultKb);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  const run = async (f: File, kb: number) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const target = kb * 1024;
      if (f.size <= target && f.type === "image/jpeg") {
        const img = await loadImage(f);
        setResult({ url: URL.createObjectURL(f), size: f.size, width: img.naturalWidth, height: img.naturalHeight, quality: 1, reachedTarget: true });
      } else {
        const r = await compressToTarget(f, target);
        setResult({ url: URL.createObjectURL(r.blob), size: r.blob.size, width: r.w, height: r.h, quality: r.q, reachedTarget: r.reached });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
    setBusy(false);
  };

  const onFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { setError("Please choose an image file (JPG, PNG or WebP)."); return; }
    setFile(f);
    run(f, targetKb);
  };

  const downloadName = file ? file.name.replace(/\.[^.]+$/, "") + `-${targetKb}kb.jpg` : "image.jpg";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <label style={{ fontWeight: 600, fontSize: "0.9rem" }} htmlFor="target-kb">Target size</label>
        <input
          id="target-kb"
          type="number"
          min={5}
          max={5000}
          value={targetKb}
          onChange={(e) => setTargetKb(Math.max(5, parseInt(e.target.value) || defaultKb))}
          style={{ width: 110 }}
        />
        <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>KB (maximum)</span>
        {file && (
          <button className="btn-secondary" onClick={() => run(file, targetKb)} disabled={busy}>
            Recompress
          </button>
        )}
      </div>

      <div
        className={`drop-zone ${dragOver ? "drag-active" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
        onClick={() => document.getElementById("target-file")?.click()}
      >
        <input id="target-file" type="file" accept="image/*" hidden onChange={(e) => onFiles(e.target.files)} />
        <p style={{ fontWeight: 600, marginBottom: "0.35rem" }}>
          {busy ? "Compressing…" : `Drop an image here to compress it under ${targetKb} KB`}
        </p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>JPG, PNG or WebP · Output is JPG · Stays on your device</p>
      </div>

      {error && <p style={{ color: "var(--danger)", marginTop: "1rem" }}>{error}</p>}

      {result && file && (
        <div className="scale-in" style={{ marginTop: "1.5rem", padding: "1.5rem", border: "1px solid var(--card-border)", borderRadius: "1rem", background: "var(--card-bg)" }}>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.url} alt="Compressed preview" style={{ maxWidth: 220, maxHeight: 220, borderRadius: 8, border: "1px solid var(--card-border)" }} />
            <div style={{ flex: 1, minWidth: 220 }}>
              <p style={{ fontWeight: 700, fontSize: "1.1rem", color: result.reachedTarget ? "var(--success)" : "var(--warning)", marginBottom: "0.5rem" }}>
                {result.reachedTarget ? `✓ ${fmt(result.size)} — under ${targetKb} KB` : `Smallest we could reach: ${fmt(result.size)}`}
              </p>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                Original: {fmt(file.size)}<br />
                Dimensions: {result.width} × {result.height}px<br />
                JPG quality: {Math.round(result.quality * 100)}%
              </p>
              <a
                href={result.url}
                download={downloadName}
                style={{ display: "inline-block", marginTop: "0.9rem", background: "#22c55e", color: "white", padding: "0.7rem 1.5rem", borderRadius: "0.625rem", fontWeight: 600, textDecoration: "none" }}
              >
                Download JPG
              </a>
            </div>
          </div>
          {result.quality < 0.4 && result.reachedTarget && (
            <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--muted)" }}>
              To fit this limit the image needed heavy compression. If it looks too soft, crop it first with our{" "}
              <Link href="/image-crop" style={{ color: "var(--primary)" }}>Image Crop</Link> tool, then compress again.
            </p>
          )}
        </div>
      )}

      <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--muted)" }}>
        Other sizes:{" "}
        {sizePages.map((p, i) => (
          <span key={p.slug}>
            <Link href={`/${p.slug}`} style={{ color: "var(--primary)" }}>{p.kb} KB</Link>
            {i < sizePages.length - 1 ? " · " : ""}
          </span>
        ))}
      </p>
    </div>
  );
}
