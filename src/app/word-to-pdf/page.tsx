"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [resultHtml, setResultHtml] = useState<string | null>(null);

  const handleFile = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.name.match(/\.(docx?|odt)$/i)) { alert("Please select a Word document (.docx)."); return; }
    setFile(f);
    setResultHtml(null);
  }, []);

  const convert = async () => {
    if (!file) return;
    setProcessing(true);
    setResultHtml(null);

    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setResultHtml(result.value);
    } catch (err) {
      console.error("Conversion error:", err);
      alert("Error converting document. Make sure it's a valid .docx file.");
    }

    setProcessing(false);
  };

  const downloadPdf = async () => {
    if (!resultHtml) return;
    // Use browser print-to-PDF via an iframe
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><style>
      body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; }
      h1 { font-size: 24px; } h2 { font-size: 20px; } h3 { font-size: 16px; }
      table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #ddd; padding: 8px; }
      img { max-width: 100%; }
    </style></head><body>${resultHtml}</body></html>`);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow!.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  };

  return (
    <ToolLayout
      title="Word to PDF"
      description="Convert Word documents (.docx) to PDF. Preview and print as PDF directly from your browser."
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files); }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".docx,.doc";
          input.onchange = () => handleFile(input.files);
          input.click();
        }}
        style={{
          border: `2px dashed ${dragOver ? "var(--primary)" : "var(--card-border)"}`,
          borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center",
          cursor: "pointer", background: dragOver ? "var(--accent)" : "var(--card-bg)", transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📝</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop a Word document here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          Supports .docx files — converts to HTML then PDF via print
        </p>
      </div>

      {file && !resultHtml && (
        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>📝 {file.name}</p>
          <button onClick={convert} disabled={processing} className="btn-primary"
            style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", fontWeight: 600 }}>
            {processing ? "Converting..." : "Convert to PDF"}
          </button>
        </div>
      )}

      {resultHtml && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <p style={{ fontWeight: 600, color: "#22c55e" }}>Document converted!</p>
            <button onClick={downloadPdf} className="btn-primary" style={{ padding: "0.6rem 1.5rem", fontSize: "0.9rem" }}>
              Save as PDF (Print)
            </button>
          </div>
          <div style={{
            border: "1px solid var(--card-border)", borderRadius: "0.5rem", padding: "2rem",
            background: "white", color: "#333", maxHeight: "600px", overflow: "auto",
            fontFamily: "Arial, sans-serif", lineHeight: 1.6,
          }} dangerouslySetInnerHTML={{ __html: resultHtml }} />
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          Convert Word Documents to PDF
        </h2>
        <p>
          Upload your .docx Word document, preview it in the browser, and use your browser's print function to save as PDF.
          Your document is processed entirely in the browser — no files are uploaded to any server.
        </p>
      </section>
    </ToolLayout>
  );
}
