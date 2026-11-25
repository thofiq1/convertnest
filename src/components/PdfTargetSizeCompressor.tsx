"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { pdfSizePages } from "@/lib/sizePages";

interface Outcome {
  url: string;
  size: number;
  pages: number;
  dpi: number | null;
  quality: number | null;
  reachedTarget: boolean;
  keptOriginal: boolean;
  targetKb: number; // the limit this result was made for
}

// Resolution ladder: try sharp first, step down only when needed.
const DPI_LADDER = [150, 120, 100, 85, 72, 60, 50, 40];
const MIN_GOOD_QUALITY = 0.35;
const MAX_PAGES = 60;

const fmt = (b: number) => (b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`);

async function loadPdfjs() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjsLib;
}

function canvasToJpeg(canvas: HTMLCanvasElement, q: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(async (b) => {
      if (!b) return reject(new Error("Could not encode page"));
      resolve(new Uint8Array(await b.arrayBuffer()));
    }, "image/jpeg", q)
  );
}

async function buildPdf(canvases: HTMLCanvasElement[], sizes: { w: number; h: number }[], q: number): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  for (let i = 0; i < canvases.length; i++) {
    const img = await doc.embedJpg(await canvasToJpeg(canvases[i], q));
    const page = doc.addPage([sizes[i].w, sizes[i].h]);
    page.drawImage(img, { x: 0, y: 0, width: sizes[i].w, height: sizes[i].h });
  }
  return doc.save({ useObjectStreams: true });
}

async function compressPdfToTarget(
  bytes: Uint8Array,
  targetBytes: number,
  onProgress: (msg: string) => void
): Promise<{ data: Uint8Array; dpi: number; quality: number; pages: number; reached: boolean }> {
  const pdfjsLib = await loadPdfjs();
  const src = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
  const pages = src.numPages;
  if (pages > MAX_PAGES) throw new Error(`This PDF has ${pages} pages. Please split it first (max ${MAX_PAGES} pages for exact-size compression).`);

  const sizes: { w: number; h: number }[] = [];
  for (let i = 1; i <= pages; i++) {
    const vp = (await src.getPage(i)).getViewport({ scale: 1 });
    sizes.push({ w: vp.width, h: vp.height });
  }

  let fallback: { data: Uint8Array; dpi: number; quality: number } | null = null;
  let smallest: { data: Uint8Array; dpi: number; quality: number } | null = null;

  for (const dpi of DPI_LADDER) {
    onProgress(`Rendering ${pages} page${pages > 1 ? "s" : ""} at ${dpi} DPI…`);
    const canvases: HTMLCanvasElement[] = [];
    for (let i = 1; i <= pages; i++) {
      const page = await src.getPage(i);
      const vp = page.getViewport({ scale: dpi / 72 });
      const c = document.createElement("canvas");
      c.width = Math.ceil(vp.width);
      c.height = Math.ceil(vp.height);
      const ctx = c.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported by your browser");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: ctx, viewport: vp, canvas: c }).promise;
      canvases.push(c);
    }

    onProgress(`Finding the best quality under the limit (${dpi} DPI)…`);
    let lo = 0.1, hi = 0.9;
    let best: { data: Uint8Array; q: number } | null = null;
    for (let i = 0; i < 6; i++) {
      const q = (lo + hi) / 2;
      const data = await buildPdf(canvases, sizes, q);
      if (!smallest || data.length < smallest.data.length) smallest = { data, dpi, quality: q };
      if (data.length <= targetBytes) { best = { data, q }; lo = q; } else { hi = q; }
    }
    if (!best) {
      const data = await buildPdf(canvases, sizes, 0.1);
      if (!smallest || data.length < smallest.data.length) smallest = { data, dpi, quality: 0.1 };
      if (data.length <= targetBytes) best = { data, q: 0.1 };
    }
    canvases.forEach((c) => { c.width = 0; c.height = 0; });

    if (best) {
      if (best.q >= MIN_GOOD_QUALITY) return { data: best.data, dpi, quality: best.q, pages, reached: true };
      if (!fallback) fallback = { data: best.data, dpi, quality: best.q };
    }
  }

  if (fallback) return { ...fallback, pages, reached: true };
  return { ...smallest!, pages, reached: false };
}

export default function PdfTargetSizeCompressor({ defaultKb }: { defaultKb: number }) {
  const [kbInput, setKbInput] = useState(String(defaultKb));
  const parsedKb = parseInt(kbInput, 10);
  const targetKb = Number.isFinite(parsedKb) ? Math.min(20000, Math.max(20, parsedKb)) : defaultKb;
  const [file, setFile] = useState<File | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => () => { if (outcome) URL.revokeObjectURL(outcome.url); }, [outcome]);
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (outcome) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [outcome]);

  const run = async (f: File, kb: number) => {
    setBusy(true); setError(null); setOutcome(null); setProgress("Reading PDF…");
    try {
      const target = kb * 1000; // fits whether a portal counts 1KB as 1000 or 1024 bytes
      const bytes = new Uint8Array(await f.arrayBuffer());
      const head = new TextDecoder().decode(bytes.slice(0, 1024));
      if (!head.includes("%PDF-")) throw new Error("This file isn't a valid PDF. Please choose a PDF document.");
      if (f.size <= target) {
        setOutcome({ url: URL.createObjectURL(f), size: f.size, pages: 0, dpi: null, quality: null, reachedTarget: true, keptOriginal: true, targetKb: kb });
      } else {
        const r = await compressPdfToTarget(bytes, target, setProgress);
        const blob = new Blob([r.data as BlobPart], { type: "application/pdf" });
        setOutcome({ url: URL.createObjectURL(blob), size: blob.size, pages: r.pages, dpi: r.dpi, quality: r.quality, reachedTarget: r.reached, keptOriginal: false, targetKb: kb });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setError(/password/i.test(msg) ? "This PDF is password-protected. Unlock it first with our PDF Unlock tool." : msg || "Something went wrong reading this PDF.");
    }
    setBusy(false); setProgress("");
  };

  const onFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) { setError("Please choose a PDF file."); return; }
    if (f.size > 100 * 1024 * 1024) { setError("Please use a PDF under 100MB."); return; }
    setKbInput(String(targetKb));
    setFile(f);
    run(f, targetKb);
  };

  const downloadName = file && outcome ? file.name.replace(/\.pdf$/i, "") + `-${outcome.targetKb}kb.pdf` : "compressed.pdf";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <label style={{ fontWeight: 600, fontSize: "0.9rem" }} htmlFor="pdf-target-kb">Target size</label>
        <input id="pdf-target-kb" type="number" min={20} max={20000} inputMode="numeric" value={kbInput}
          onChange={(e) => setKbInput(e.target.value)} onBlur={() => setKbInput(String(targetKb))} style={{ width: 110 }} />
        <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>KB (maximum)</span>
        {file && <button className="btn-secondary" onClick={() => { setKbInput(String(targetKb)); run(file, targetKb); }} disabled={busy}>{outcome && outcome.targetKb !== targetKb ? `Compress to ${targetKb} KB` : "Recompress"}</button>}
      </div>

      <div
        className={`drop-zone ${dragOver ? "drag-active" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
        onClick={() => !busy && document.getElementById("pdf-target-file")?.click()}
      >
        <input id="pdf-target-file" type="file" accept="application/pdf,.pdf" hidden onChange={(e) => onFiles(e.target.files)} />
        <p style={{ fontWeight: 600, marginBottom: "0.35rem" }}>{busy ? progress || "Working…" : `Drop a PDF here or tap to choose one (under ${targetKb} KB)`}</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>Up to {MAX_PAGES} pages · Stays on your device · No signup</p>
      </div>

      {error && <p style={{ color: "var(--danger)", marginTop: "1rem" }}>{error}</p>}

      {outcome && file && (
        <div ref={resultRef} className="scale-in" style={{ marginTop: "1.5rem", padding: "1.5rem", border: "1px solid var(--card-border)", borderRadius: "1rem", background: "var(--card-bg)" }}>
          <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem", color: outcome.reachedTarget ? "var(--success)" : "var(--warning)" }}>
            {outcome.keptOriginal
              ? `✓ Already under ${outcome.targetKb} KB (${fmt(outcome.size)}) — no changes needed`
              : outcome.reachedTarget
                ? `✓ ${fmt(outcome.size)} — under ${outcome.targetKb} KB`
                : `Couldn't reach ${outcome.targetKb} KB. Smallest possible: ${fmt(outcome.size)}`}
          </p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.7 }}>
            Original: {fmt(file.size)}
            {!outcome.keptOriginal && <> · {outcome.pages} page{outcome.pages > 1 ? "s" : ""} · {outcome.dpi} DPI · quality {Math.round((outcome.quality ?? 0) * 100)}%</>}
          </p>
          <a href={outcome.url} download={downloadName}
            style={{ display: "inline-block", marginTop: "0.9rem", background: "#15803d", color: "white", padding: "0.7rem 1.5rem", borderRadius: "0.625rem", fontWeight: 600, textDecoration: "none" }}>
            Download PDF
          </a>
          {!outcome.keptOriginal && (
            <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6 }}>
              To fit under a size limit, each page is saved as an image, so text in the result can&apos;t be selected or searched.
              {!outcome.reachedTarget && <> This PDF has too many pages for {outcome.targetKb} KB — try a larger target, or <Link href="/split-pdf" style={{ color: "var(--primary)" }}>split it</Link> and compress the parts.</>}
              {outcome.reachedTarget && (outcome.dpi ?? 999) < 72 && <> At this size, small text may be hard to read — check the file before you submit it.</>}
            </p>
          )}
        </div>
      )}

      <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--muted)" }}>
        Other sizes:{" "}
        {pdfSizePages.map((p, i) => (
          <span key={p.slug}>
            <Link href={`/${p.slug}`} style={{ color: "var(--primary)" }}>{p.kb} KB</Link>
            {i < pdfSizePages.length - 1 ? " · " : ""}
          </span>
        ))}
        {" · "}<Link href="/compress-pdf" style={{ color: "var(--primary)" }}>Standard PDF compressor</Link>
      </p>
    </div>
  );
}
