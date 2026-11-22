"use client";

import { useState, useCallback, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function WordToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [processing, setProcessing] = useState(false);
  const [converting, setConverting] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState(12);
  const [dragOver, setDragOver] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.name.match(/\.docx$/i)) {
      alert("Please select a .docx file");
      return;
    }
    setFile(f);
    setProcessing(true);
    setHtmlContent("");
    setWarnings([]);

    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await f.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setHtmlContent(result.value);

      const msgs = result.messages
        .filter((m: { type: string }) => m.type === "warning")
        .map((m: { message: string }) => m.message);
      if (msgs.length > 0) setWarnings(msgs.slice(0, 5));
    } catch (err) {
      console.error("Error parsing Word document:", err);
      alert("Error reading the Word file. Please make sure it's a valid .docx file.");
    }
    setProcessing(false);
  }, []);

  const convertToPdf = async () => {
    if (!htmlContent) return;
    setConverting(true);
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow pop-ups to generate the PDF.");
        setConverting(false);
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${file?.name || "document"}</title>
          <style>
            @page { size: A4; margin: 2cm; }
            body {
              font-family: 'Times New Roman', 'Georgia', serif;
              font-size: ${fontSize}pt;
              line-height: 1.6;
              color: #000;
              max-width: 100%;
              margin: 0;
              padding: 0;
            }
            h1 { font-size: ${fontSize * 2}pt; margin: 0.67em 0; }
            h2 { font-size: ${fontSize * 1.5}pt; margin: 0.75em 0; }
            h3 { font-size: ${fontSize * 1.17}pt; margin: 0.83em 0; }
            p { margin: 0.5em 0; }
            table { border-collapse: collapse; width: 100%; margin: 1em 0; }
            td, th { border: 1px solid #999; padding: 6px 10px; text-align: left; }
            th { background: #f0f0f0; font-weight: bold; }
            img { max-width: 100%; height: auto; }
            ul, ol { margin: 0.5em 0; padding-left: 2em; }
            blockquote { margin: 1em 0; padding-left: 1em; border-left: 3px solid #ccc; color: #555; }
          </style>
        </head>
        <body>${htmlContent}</body>
        </html>
      `);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.print();
        setConverting(false);
      }, 500);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error generating PDF. Please try again.");
      setConverting(false);
    }
  };

  return (
    <ToolLayout
      title="Word to PDF"
      description="Convert Word documents (.docx) to PDF. Preview your document before converting."
    >
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files); }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file"; input.accept = ".docx";
            input.onchange = () => handleFile(input.files); input.click();
          }}
          style={{
            border: `2px dashed ${dragOver ? "var(--primary)" : "var(--card-border)"}`,
            borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center",
            cursor: "pointer", background: dragOver ? "rgba(37,99,235,0.04)" : "var(--card-bg)", transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📝</div>
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop a Word document here or click to browse</p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Supports .docx files (Word 2007+)</p>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{file.name}</span>
              <span style={{ color: "var(--muted)", fontSize: "0.85rem", marginLeft: "0.5rem" }}>
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button onClick={() => { setFile(null); setHtmlContent(""); setWarnings([]); }}
              className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
              Change File
            </button>
          </div>

          {processing ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⏳</div>
              <p>Parsing document...</p>
            </div>
          ) : (
            <>
              {warnings.length > 0 && (
                <div style={{
                  padding: "0.75rem 1rem", marginBottom: "1rem",
                  background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.3)",
                  borderRadius: "0.5rem", fontSize: "0.8rem",
                }}>
                  <p style={{ fontWeight: 600, marginBottom: "0.3rem", color: "#b45309" }}>⚠ Formatting Notes</p>
                  <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--muted)" }}>
                    {warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              {/* Font size control */}
              <div style={{
                display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem",
                padding: "0.75rem", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.5rem",
              }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Font Size:</span>
                {[10, 11, 12, 14, 16].map((size) => (
                  <button key={size} onClick={() => setFontSize(size)}
                    style={{
                      padding: "0.3rem 0.6rem", border: "1px solid var(--card-border)", borderRadius: "0.3rem",
                      background: fontSize === size ? "var(--primary)" : "var(--card-bg)",
                      color: fontSize === size ? "#fff" : "var(--foreground)",
                      cursor: "pointer", fontWeight: 600, fontSize: "0.8rem",
                    }}>
                    {size}pt
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div style={{
                marginBottom: "1rem", border: "1px solid var(--card-border)", borderRadius: "0.5rem", overflow: "hidden",
              }}>
                <div style={{ padding: "0.5rem 0.75rem", background: "var(--accent)", borderBottom: "1px solid var(--card-border)", fontSize: "0.8rem", fontWeight: 600, color: "var(--muted)" }}>
                  Document Preview
                </div>
                <div ref={previewRef} style={{
                  padding: "2rem", maxHeight: "500px", overflow: "auto",
                  fontFamily: "'Times New Roman', Georgia, serif",
                  fontSize: `${fontSize}pt`, lineHeight: 1.6, background: "#fff", color: "#000",
                }}
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>

              <button onClick={convertToPdf} disabled={converting || !htmlContent} className="btn-primary"
                style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}>
                {converting ? "Opening print dialog..." : "Convert to PDF (Print)"}
              </button>

              <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.5rem", textAlign: "center" }}>
                Uses your browser&apos;s print dialog — select &quot;Save as PDF&quot; as the destination.
              </p>
            </>
          )}
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Convert Word to PDF
        </h2>
        <p>
          Upload your .docx file and preview the document with your chosen font size. Click &quot;Convert
          to PDF&quot; to open your browser&apos;s print dialog — select &quot;Save as PDF&quot; as the
          destination. The document is styled with professional typography for clean PDF output. All
          processing happens locally — your documents are never uploaded anywhere.
        </p>
      </section>
    </ToolLayout>
  );
}
