"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rangeInput, setRangeInput] = useState("");
  const [results, setResults] = useState<{ name: string; url: string }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState<"range" | "each">("range");

  const handleFile = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.type !== "application/pdf") { alert("Please select a PDF file."); return; }
    setFile(f);
    setResults([]);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(await f.arrayBuffer());
      setPageCount(doc.getPageCount());
      setRangeInput(`1-${doc.getPageCount()}`);
    } catch { setPageCount(0); }
  }, []);

  const parseRanges = (input: string, max: number): number[] => {
    const pages = new Set<number>();
    input.split(",").forEach((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [a, b] = trimmed.split("-").map(Number);
        if (!isNaN(a) && !isNaN(b)) {
          for (let i = Math.max(1, a); i <= Math.min(max, b); i++) pages.add(i);
        }
      } else {
        const n = parseInt(trimmed);
        if (!isNaN(n) && n >= 1 && n <= max) pages.add(n);
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
  };

  const split = async () => {
    if (!file) return;
    setProcessing(true);
    setResults([]);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const srcDoc = await PDFDocument.load(await file.arrayBuffer());
      const total = srcDoc.getPageCount();
      const baseName = file.name.replace(".pdf", "");

      if (mode === "each") {
        const urls: { name: string; url: string }[] = [];
        for (let i = 0; i < total; i++) {
          const newDoc = await PDFDocument.create();
          const [page] = await newDoc.copyPages(srcDoc, [i]);
          newDoc.addPage(page);
          const bytes = await newDoc.save();
          const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
          urls.push({ name: `${baseName}-page-${i + 1}.pdf`, url: URL.createObjectURL(blob) });
        }
        setResults(urls);
      } else {
        const pages = parseRanges(rangeInput, total);
        if (pages.length === 0) { alert("No valid pages selected."); setProcessing(false); return; }
        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(srcDoc, pages.map((p) => p - 1));
        copied.forEach((page) => newDoc.addPage(page));
        const bytes = await newDoc.save();
        const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
        setResults([{ name: `${baseName}-pages-${rangeInput.replace(/\s/g, "")}.pdf`, url: URL.createObjectURL(blob) }]);
      }
    } catch (err) {
      console.error("Split error:", err);
      alert("Error splitting PDF.");
    }

    setProcessing(false);
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract specific pages or split a PDF into individual pages."
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files); }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".pdf";
          input.onchange = () => handleFile(input.files);
          input.click();
        }}
        style={{
          border: `2px dashed ${dragOver ? "var(--primary)" : "var(--card-border)"}`,
          borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center",
          cursor: "pointer", background: dragOver ? "var(--accent)" : "var(--card-bg)", transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✂️</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop a PDF here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          Split by page range or into individual pages
        </p>
      </div>

      {file && pageCount > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>📄 {file.name} — {pageCount} page{pageCount > 1 ? "s" : ""}</p>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            {([["range", "Extract Range"], ["each", "Split All Pages"]] as const).map(([value, label]) => (
              <button key={value} onClick={() => setMode(value as "range" | "each")}
                style={{
                  padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--card-border)",
                  background: mode === value ? "var(--primary)" : "var(--card-bg)",
                  color: mode === value ? "white" : "var(--foreground)",
                  cursor: "pointer", fontSize: "0.85rem",
                }}>
                {label}
              </button>
            ))}
          </div>

          {mode === "range" && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                Pages (e.g. 1-3, 5, 7-10)
              </label>
              <input type="text" value={rangeInput} onChange={(e) => setRangeInput(e.target.value)}
                style={{
                  width: "100%", padding: "0.6rem 0.75rem", borderRadius: "0.5rem",
                  border: "1px solid var(--card-border)", background: "var(--card-bg)", color: "var(--foreground)", fontSize: "0.9rem",
                }} />
            </div>
          )}

          <button onClick={split} disabled={processing} className="btn-primary"
            style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", fontWeight: 600 }}>
            {processing ? "Splitting..." : mode === "each" ? `Split into ${pageCount} Files` : "Extract Pages"}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="result-box" style={{ marginTop: "1.5rem", padding: "1.5rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "1rem", color: "#22c55e" }}>
            {results.length === 1 ? "PDF extracted!" : `Split into ${results.length} files!`}
          </p>
          {results.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: i < results.length - 1 ? "1px solid var(--card-border)" : "none" }}>
              <span style={{ fontSize: "0.85rem" }}>{r.name}</span>
              <a href={r.url} download={r.name} className="btn-primary" style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", textDecoration: "none" }}>Download</a>
            </div>
          ))}
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Split a PDF Online
        </h2>
        <p>
          Upload your PDF, choose a page range or split into individual pages, and download the result.
          Perfect for extracting chapters, removing unwanted pages, or breaking large documents into smaller files.
        </p>
      </section>
    </ToolLayout>
  );
}
