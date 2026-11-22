"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const pdfFiles = Array.from(newFiles).filter(
      (f) => f.type === "application/pdf"
    );
    setFiles((prev) => [...prev, ...pdfFiles]);
    setResultUrl(null);
  }, []);

  const moveFile = (index: number, direction: -1 | 1) => {
    const newFiles = [...files];
    const target = index + direction;
    if (target < 0 || target >= newFiles.length) return;
    [newFiles[index], newFiles[target]] = [newFiles[target], newFiles[index]];
    setFiles(newFiles);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const merge = async () => {
    if (files.length < 2) return;
    setProcessing(true);
    setResultUrl(null);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes as BlobPart], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Merge error:", err);
      alert("Error merging PDFs. Please check your files and try again.");
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
      title="Merge PDF"
      description="Combine multiple PDF files into one. Reorder pages before merging — completely free."
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".pdf";
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
          background: dragOver ? "var(--accent)" : "var(--card-bg)",
          transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📎</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop PDF files here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          Select two or more PDFs to combine
        </p>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
            Drag buttons to reorder. Files merge top to bottom.
          </p>
          {files.map((file, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 1rem",
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.9rem" }}>
                <span style={{ color: "var(--muted)", marginRight: "0.5rem" }}>{i + 1}.</span>
                📄 {file.name}{" "}
                <span style={{ color: "var(--muted)" }}>({formatSize(file.size)})</span>
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={(e) => { e.stopPropagation(); moveFile(i, -1); }}
                  style={{ background: "none", border: "1px solid var(--card-border)", borderRadius: "0.25rem", padding: "0.2rem 0.5rem", cursor: "pointer", color: "var(--foreground)" }}
                  disabled={i === 0}>↑</button>
                <button onClick={(e) => { e.stopPropagation(); moveFile(i, 1); }}
                  style={{ background: "none", border: "1px solid var(--card-border)", borderRadius: "0.25rem", padding: "0.2rem 0.5rem", cursor: "pointer", color: "var(--foreground)" }}
                  disabled={i === files.length - 1}>↓</button>
                <button onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
              </div>
            </div>
          ))}

          <button onClick={merge} disabled={processing || files.length < 2}
            className="btn-primary"
            style={{ marginTop: "1rem", width: "100%", padding: "0.75rem", fontSize: "1rem", fontWeight: 600 }}>
            {processing ? "Merging..." : `Merge ${files.length} PDFs`}
          </button>
        </div>
      )}

      {resultUrl && (
        <div className="result-box" style={{ marginTop: "1.5rem", padding: "1.5rem", textAlign: "center" }}>
          <p style={{ fontWeight: 600, marginBottom: "1rem", color: "#22c55e" }}>PDFs merged successfully!</p>
          <a href={resultUrl} download="merged.pdf" className="btn-primary"
            style={{ padding: "0.75rem 2rem", fontSize: "1rem", textDecoration: "none", display: "inline-block" }}>
            Download Merged PDF
          </a>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Merge PDF Files Online
        </h2>
        <p>
          Select or drag and drop the PDF files you want to combine. Use the arrow buttons to reorder them.
          Click Merge and download your combined PDF. All processing happens in your browser — your files
          never leave your device.
        </p>
      </section>
    </ToolLayout>
  );
}
