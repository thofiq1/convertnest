"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotation, setRotation] = useState(90);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.type !== "application/pdf") { alert("Please select a PDF file."); return; }
    setFile(f);
    setResultUrl(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(await f.arrayBuffer());
      setPageCount(doc.getPageCount());
    } catch { setPageCount(0); }
  }, []);

  const rotate = async () => {
    if (!file) return;
    setProcessing(true);
    setResultUrl(null);

    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const pages = doc.getPages();
      pages.forEach((page) => {
        page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
      });
      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Rotate error:", err);
      alert("Error rotating PDF.");
    }

    setProcessing(false);
  };

  return (
    <ToolLayout
      title="Rotate PDF"
      description="Rotate all pages of a PDF by 90°, 180°, or 270° — fix scanned documents instantly."
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
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔄</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop a PDF here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          Rotate pages to fix orientation issues
        </p>
      </div>

      {file && (
        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>📄 {file.name} — {pageCount} page{pageCount > 1 ? "s" : ""}</p>

          <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>Rotation</label>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            {[90, 180, 270].map((deg) => (
              <button key={deg} onClick={() => setRotation(deg)}
                style={{
                  padding: "0.5rem 1.25rem", borderRadius: "0.5rem", border: "1px solid var(--card-border)",
                  background: rotation === deg ? "var(--primary)" : "var(--card-bg)",
                  color: rotation === deg ? "white" : "var(--foreground)",
                  cursor: "pointer", fontSize: "0.85rem",
                }}>
                {deg}°
              </button>
            ))}
          </div>

          <button onClick={rotate} disabled={processing} className="btn-primary"
            style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", fontWeight: 600 }}>
            {processing ? "Rotating..." : `Rotate All Pages ${rotation}°`}
          </button>
        </div>
      )}

      {resultUrl && (
        <div className="result-box" style={{ marginTop: "1.5rem", padding: "1.5rem", textAlign: "center" }}>
          <p style={{ fontWeight: 600, marginBottom: "1rem", color: "#22c55e" }}>PDF rotated successfully!</p>
          <a href={resultUrl} download={`${file?.name?.replace(".pdf", "")}-rotated.pdf`} className="btn-primary"
            style={{ padding: "0.75rem 2rem", fontSize: "1rem", textDecoration: "none", display: "inline-block" }}>
            Download Rotated PDF
          </a>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          Rotate PDF Pages Online
        </h2>
        <p>
          Fix upside-down or sideways scanned documents. Rotate all pages at once by 90, 180, or 270 degrees and download the corrected PDF instantly.
        </p>
      </section>
    </ToolLayout>
  );
}
