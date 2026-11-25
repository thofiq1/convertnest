"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { sizePages } from "@/lib/sizePages";
import { type SizePreset, loadImageFile, drawExact, bestQualityUnder, padJpegTo, cleanSource, frameWarnings, looksTruncated } from "@/lib/exactSize";

interface Result {
  url: string;
  size: number;
  width: number;
  height: number;
  quality: number;
  reachedTarget: boolean;
  targetKb: number; // the limit this result was made for
  minKb?: number;
  padded?: boolean;
  label?: string; // preset id used for the file name
  sig: string; // settings this result was made with
  warnings?: string[];
  cleaned?: boolean;
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

// Below this JPG quality, blocky artefacts become obvious, so it's better to
// make the image a little smaller than to crush the quality.
const MIN_GOOD_QUALITY = 0.5;
// Don't shrink below this on the short side just to keep quality up.
const MIN_SIDE = 160;

// Finds the highest JPG quality that fits under the target. If the best
// quality that fits is too low (or nothing fits), shrinks the dimensions by
// 20% and tries again. Falls back to a lower quality only once the image
// would otherwise get very small.
async function compressToTarget(file: File, targetBytes: number) {
  const img = await loadImage(file);
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  let lowQuality: { blob: Blob; w: number; h: number; q: number } | null = null;

  for (let round = 0; round < 25; round++) {
    let lo = 0.1, hi = 0.95, found: { blob: Blob; q: number } | null = null;
    for (let i = 0; i < 7; i++) {
      const mid = (lo + hi) / 2;
      const blob = await encode(img, w, h, mid);
      if (blob.size <= targetBytes) { found = { blob, q: mid }; lo = mid; } else { hi = mid; }
    }
    if (found && found.q >= MIN_GOOD_QUALITY) {
      return { blob: found.blob, w, h, q: found.q, reached: true };
    }
    // Remember a fallback in case we can't keep quality up: prefer the largest
    // size whose quality is still tolerable, otherwise the best quality seen.
    if (found && (!lowQuality || lowQuality.q < 0.3)) lowQuality = { blob: found.blob, w, h, q: found.q };
    const nw = Math.round(w * 0.8);
    const nh = Math.round(h * 0.8);
    if (Math.min(nw, nh) < MIN_SIDE) {
      if (lowQuality) break;
      if (Math.min(nw, nh) < 1) break;
    }
    w = Math.max(1, nw);
    h = Math.max(1, nh);
  }

  if (lowQuality) return { ...lowQuality, reached: true };
  const blob = await encode(img, w, h, 0.1);
  return { blob, w, h, q: 0.1, reached: blob.size <= targetBytes };
}

const fmt = (bytes: number) => (bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`);

export default function TargetSizeCompressor({
  defaultKb,
  presets,
  showOtherSizes = true,
}: {
  defaultKb: number;
  presets?: SizePreset[];
  showOtherSizes?: boolean;
}) {
  const [presetId, setPresetId] = useState(presets?.[0]?.id ?? "");
  const preset = presets?.find((p) => p.id === presetId);
  // Optional exact dimensions on the general size pages.
  const [dimW, setDimW] = useState("");
  const [dimH, setDimH] = useState("");
  const [cleanUp, setCleanUp] = useState(true);
  // Keep what the user is typing as a string; only clamp when it's used,
  // so typing "15" or clearing the box doesn't fight the user.
  const [kbInput, setKbInput] = useState(String(defaultKb));
  const parsedKb = parseInt(kbInput, 10);
  const targetKb = preset ? preset.maxKb : Number.isFinite(parsedKb) ? Math.min(20000, Math.max(5, parsedKb)) : defaultKb;
  const exactW = parseInt(dimW, 10), exactH = parseInt(dimH, 10);
  const exactDims = preset
    ? { w: preset.width, h: preset.height, fit: preset.fit, minKb: preset.minKb }
    : exactW >= 16 && exactH >= 16 && exactW <= 8000 && exactH <= 8000
      ? { w: exactW, h: exactH, fit: "cover" as const, minKb: undefined }
      : null;
  const dimsInvalid = !preset && (dimW.trim() !== "" || dimH.trim() !== "") && !exactDims;
  const doClean = Boolean(preset && preset.fit === "contain" && cleanUp);
  const sig = `${targetKb}|${exactDims ? `${exactDims.w}x${exactDims.h}` : ""}|${presetId}|${doClean}`;
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [result]);

  // Each run gets an id; only the newest run may publish a result, so a file
  // dropped mid-run can never be paired with the previous file's output.
  const runIdRef = useRef(0);
  const run = async (f: File, kb: number) => {
    const id = ++runIdRef.current;
    const live = () => runIdRef.current === id;
    const publish = (r: Result) => { if (live()) setResult(r); else URL.revokeObjectURL(r.url); };
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const damaged = (await looksTruncated(f)) ? ["This file looks incomplete (it may be a damaged or partial download), so part of the picture may be missing. Check the result before uploading it."] : [];
      // Use 1KB = 1000 bytes so the file fits whether a portal counts
      // KB as 1000 or 1024 bytes.
      const target = kb * 1000;
      if (exactDims) {
        const img = await loadImageFile(f);
        const source = doClean ? cleanSource(img, { w: exactDims.w, h: exactDims.h }) : img;
        const cleaned = doClean;
        const canvas = drawExact(source, exactDims.w, exactDims.h, exactDims.fit);
        const warnings = [...damaged, ...frameWarnings(img, exactDims.w, exactDims.h, exactDims.fit)];
        const r = await bestQualityUnder(canvas, target);
        let blob = r.blob;
        let padded = false;
        // Meet a portal's minimum under either KB definition (1000 or 1024 bytes).
        if (exactDims.minKb && blob.size < exactDims.minKb * 1024) {
          blob = await padJpegTo(blob, exactDims.minKb * 1024 + 256);
          padded = true;
        }
        publish({ url: URL.createObjectURL(blob), size: blob.size, width: exactDims.w, height: exactDims.h, quality: r.q, reachedTarget: r.reached, targetKb: kb, minKb: exactDims.minKb, padded, label: preset?.id, sig, warnings, cleaned });
      } else if (f.size <= target && f.type === "image/jpeg" && damaged.length === 0) {
        const img = await loadImage(f);
        publish({ url: URL.createObjectURL(f), size: f.size, width: img.naturalWidth, height: img.naturalHeight, quality: 1, reachedTarget: true, targetKb: kb, sig });
      } else {
        const r = await compressToTarget(f, target);
        publish({ url: URL.createObjectURL(r.blob), size: r.blob.size, width: r.w, height: r.h, quality: r.q, reachedTarget: r.reached, targetKb: kb, sig, warnings: damaged });
      }
    } catch (e) {
      if (!live()) return;
      const heic = /\.hei[cf]$/i.test(f.name) || /hei[cf]/i.test(f.type);
      setError(heic ? "iPhone HEIC photos can't be read here. Convert it with HEIC to JPG first, then compress." : e instanceof Error ? e.message : "Something went wrong.");
    }
    if (live()) setBusy(false);
  };

  const onFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif|bmp|hei[cf])$/i.test(f.name)) { setError(`${f.name} isn't an image. Please choose a JPG, PNG or WebP file.`); return; }
    setKbInput(String(targetKb));
    setFile(f);
    run(f, targetKb);
  };

  const downloadName = file && result ? file.name.replace(/\.[^.]+$/, "") + (result.label ? `-${result.label}` : `-${result.targetKb}kb`) + ".jpg" : "image.jpg";

  return (
    <div>
      {presets ? (
        <div style={{ marginBottom: "1rem" }}>
          <div role="radiogroup" aria-label="Choose what you're uploading" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={p.id === presetId}
                className={`category-pill ${p.id === presetId ? "active" : ""}`}
                onClick={() => setPresetId(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          {preset && (
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              Output: JPG, exactly {preset.width} × {preset.height}px,{" "}
              {preset.minKb ? `${preset.minKb}–${preset.maxKb} KB` : `under ${preset.maxKb} KB`}
              {preset.fit === "contain" ? " · fitted on white, nothing cut off" : " · centred and cropped to fit"}
            </p>
          )}
          {preset?.fit === "contain" && (
            <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", marginTop: "0.4rem", cursor: "pointer" }}>
              <input type="checkbox" checked={cleanUp} onChange={(e) => setCleanUp(e.target.checked)} />
              Clean up: make the paper white and the ink darker
            </label>
          )}
          {file && (
            <button className="btn-secondary" style={{ marginTop: "0.6rem" }} onClick={() => run(file, targetKb)} disabled={busy}>
              {result && result.sig !== sig ? "Apply to this photo" : "Redo"}
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
            <label style={{ fontWeight: 600, fontSize: "0.9rem" }} htmlFor="target-kb">Target size</label>
            <input
              id="target-kb"
              type="number"
              min={5}
              max={20000}
              inputMode="numeric"
              value={kbInput}
              onChange={(e) => setKbInput(e.target.value)}
              onBlur={() => setKbInput(String(targetKb))}
              style={{ width: 110 }}
            />
            <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>KB (maximum)</span>
            {file && (
              <button className="btn-secondary" onClick={() => { setKbInput(String(targetKb)); run(file, targetKb); }} disabled={busy}>
                {result && result.sig !== sig ? "Apply new settings" : "Recompress"}
              </button>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem", fontSize: "0.9rem" }}>
            <label htmlFor="exact-w" style={{ fontWeight: 600 }}>Exact size</label>
            <span style={{ color: "var(--muted)" }}>(optional)</span>
            <input id="exact-w" type="number" inputMode="numeric" placeholder="Width" aria-label="Exact width in pixels" value={dimW} onChange={(e) => setDimW(e.target.value)} style={{ width: 90 }} />
            <span aria-hidden="true">×</span>
            <input id="exact-h" type="number" inputMode="numeric" placeholder="Height" aria-label="Exact height in pixels" value={dimH} onChange={(e) => setDimH(e.target.value)} style={{ width: 90 }} />
            <span style={{ color: "var(--muted)" }}>px</span>
          </div>
          {dimsInvalid && (
            <p role="alert" style={{ color: "var(--danger)", fontSize: "0.85rem", margin: "-0.5rem 0 1rem" }}>
              Exact size needs both width and height, each between 16 and 8000 px. It is being ignored for now.
            </p>
          )}
        </>
      )}

      <div
        className={`drop-zone ${dragOver ? "drag-active" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
        onClick={() => document.getElementById("target-file")?.click()}
      >
        <input id="target-file" type="file" accept="image/*" hidden onChange={(e) => onFiles(e.target.files)} />
        <p style={{ fontWeight: 600, marginBottom: "0.35rem" }}>
          {busy ? "Compressing…" : preset ? `Drop your ${preset.label.split(" ·")[0].toLowerCase()} here or tap to choose it` : `Drop an image here or tap to choose one (under ${targetKb} KB)`}
        </p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>JPG, PNG or WebP · Output is JPG · Stays on your device</p>
      </div>

      {error && <p style={{ color: "var(--danger)", marginTop: "1rem" }}>{error}</p>}

      {result && file && (
        <div ref={resultRef} className="scale-in" style={{ marginTop: "1.5rem", padding: "1.5rem", border: "1px solid var(--card-border)", borderRadius: "1rem", background: "var(--card-bg)" }}>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.url} alt="Compressed preview" style={{ maxWidth: 220, maxHeight: 220, borderRadius: 8, border: "1px solid var(--card-border)" }} />
            <div style={{ flex: 1, minWidth: 220 }}>
              <p style={{ fontWeight: 700, fontSize: "1.1rem", color: result.reachedTarget ? "var(--success)" : "var(--warning)", marginBottom: "0.5rem" }}>
                {result.reachedTarget
                  ? result.minKb
                    ? `✓ ${fmt(result.size)} — within ${result.minKb}–${result.targetKb} KB`
                    : `✓ ${fmt(result.size)} — under ${result.targetKb} KB`
                  : `Smallest we could reach: ${fmt(result.size)}`}
              </p>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                Original: {fmt(file.size)}<br />
                Dimensions: {result.width} × {result.height}px<br />
                JPG quality: {Math.round(result.quality * 100)}%
                {result.cleaned && (
                  <>
                    <br />
                    Cleaned up: paper whitened and ink darkened. Untick &ldquo;Clean up&rdquo; and press Apply if you prefer the original look.
                  </>
                )}
                {result.padded && (
                  <>
                    <br />
                    Even at top quality this image is smaller than the {result.minKb} KB minimum, so we added
                    empty metadata to reach it. The picture itself is unchanged.
                  </>
                )}
              </p>
              <a
                href={result.url}
                download={downloadName}
                style={{ display: "inline-block", marginTop: "0.9rem", background: "#15803d", color: "white", padding: "0.7rem 1.5rem", borderRadius: "0.625rem", fontWeight: 600, textDecoration: "none" }}
              >
                Download JPG
              </a>
            </div>
          </div>
          {result.warnings && result.warnings.length > 0 && (
            <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--foreground)", background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.4)", borderRadius: "0.6rem", padding: "0.6rem 0.8rem" }}>
              {result.warnings.map((w) => <p key={w}>{w}</p>)}
            </div>
          )}
          {result.quality < 0.4 && result.reachedTarget && (
            <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--muted)" }}>
              To fit this limit the image needed heavy compression. If it looks too soft, crop it first with our{" "}
              <Link href="/image-crop" style={{ color: "var(--primary)" }}>Image Crop</Link> tool, then compress again.
            </p>
          )}
        </div>
      )}

      {showOtherSizes && <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--muted)" }}>
        Other sizes:{" "}
        {sizePages.map((p, i) => (
          <span key={p.slug}>
            <Link href={`/${p.slug}`} style={{ color: "var(--primary)" }}>{p.kb} KB</Link>
            {i < sizePages.length - 1 ? " · " : ""}
          </span>
        ))}
      </p>}
    </div>
  );
}
