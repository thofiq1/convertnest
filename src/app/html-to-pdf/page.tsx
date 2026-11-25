"use client";

import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import ErrorBoundary from "@/components/ErrorBoundary";

type PaperSize = "A4" | "Letter" | "Legal";
type Orientation = "portrait" | "landscape";

const PAPER_DIMENSIONS: Record<PaperSize, { width: string; height: string }> = {
  A4: { width: "210mm", height: "297mm" },
  Letter: { width: "8.5in", height: "11in" },
  Legal: { width: "8.5in", height: "14in" },
};

const sampleHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 2rem; color: #333; }
    h1 { color: #2563eb; }
    p { line-height: 1.6; }
    table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f1f5f9; }
  </style>
</head>
<body>
  <h1>Sample Document</h1>
  <p>This is a sample HTML document. Replace this with your own HTML content.</p>
  <table>
    <tr><th>Name</th><th>Value</th></tr>
    <tr><td>Item 1</td><td>100</td></tr>
    <tr><td>Item 2</td><td>200</td></tr>
  </table>
</body>
</html>`;

function HtmlToPdfTool() {
  const [htmlContent, setHtmlContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [paperSize, setPaperSize] = useState<PaperSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [includeMargins, setIncludeMargins] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getIframeContent = useCallback(() => {
    const content = htmlContent.trim();
    if (!content) return "";

    // If it's a full HTML document, use it directly
    if (content.toLowerCase().includes("<html") || content.toLowerCase().includes("<!doctype")) {
      return content;
    }

    // Wrap partial HTML in a basic document
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 1rem; color: #333; line-height: 1.6; }
    img { max-width: 100%; }
    table { border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; }
  </style>
</head>
<body>${content}</body>
</html>`;
  }, [htmlContent]);

  const handlePreview = () => {
    if (!htmlContent.trim()) {
      alert("Please enter some HTML content first.");
      return;
    }
    setShowPreview(true);
  };

  const handlePrint = () => {
    if (!iframeRef.current?.contentWindow) {
      alert("Please preview the content first.");
      return;
    }

    const iframeWindow = iframeRef.current.contentWindow;
    const iframeDoc = iframeWindow.document;
    const paper = PAPER_DIMENSIONS[paperSize];
    const margin = includeMargins ? "15mm" : "0";

    // Inject print styles into the iframe
    const printStyle = iframeDoc.createElement("style");
    printStyle.setAttribute("media", "print");
    printStyle.textContent = `
      @page {
        size: ${orientation === "portrait" ? `${paper.width} ${paper.height}` : `${paper.height} ${paper.width}`};
        margin: ${margin};
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    `;
    iframeDoc.head.appendChild(printStyle);

    // Trigger the browser's print dialog
    iframeWindow.focus();
    iframeWindow.print();

    // Remove injected style after print dialog
    setTimeout(() => {
      try { iframeDoc.head.removeChild(printStyle); } catch { /* already removed */ }
    }, 1000);
  };

  const loadSample = () => {
    setHtmlContent(sampleHtml);
    setShowPreview(false);
  };

  return (
    <ToolLayout
      slug="html-to-pdf"
      title="HTML to PDF Converter"
      description="Convert HTML code or web content to PDF. Paste your HTML, preview it, and download a clean PDF document."
      faqs={[
        { question: "How is the PDF created?", answer: "The tool renders your HTML in a preview frame, then opens your browser's print dialog with the paper size, orientation and margins you picked. Choose \"Save as PDF\" as the destination to save the file." },
        { question: "Can I paste just a fragment of HTML?", answer: "Yes. If you paste a snippet without <html> tags, it is wrapped in a simple page with basic styling for text, images and tables." },
        { question: "Can I convert a web page by its URL?", answer: "No. This tool converts HTML code that you paste. To save a live web page, open it in your browser and use Print > Save as PDF." },
        { question: "Is my HTML uploaded anywhere?", answer: "No. The preview and printing happen in your browser." },
      ]}
    >
      {/* HTML Input Area */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Paste your HTML</label>
          <button
            onClick={loadSample}
            className="btn-secondary"
            style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}
          >
            Load Sample
          </button>
        </div>
        <textarea
          value={htmlContent}
          onChange={(e) => { setHtmlContent(e.target.value); setShowPreview(false); }}
          placeholder="Paste your HTML code here..."
          style={{
            width: "100%",
            minHeight: "200px",
            padding: "0.75rem",
            border: "1px solid var(--card-border)",
            borderRadius: "0.5rem",
            fontSize: "0.85rem",
            fontFamily: "'SF Mono', 'Fira Code', 'Fira Mono', Menlo, monospace",
            background: "var(--background)",
            color: "var(--foreground)",
            resize: "vertical",
            boxSizing: "border-box",
            lineHeight: 1.5,
          }}
        />
      </div>

      {/* Controls */}
      <div style={{
        background: "var(--card-bg)", border: "1px solid var(--card-border)",
        borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.5rem",
      }}>
        <div style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.25rem" }}>PDF Settings</div>

        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          {/* Paper Size */}
          <label style={{ flex: 1, minWidth: "120px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Paper Size</span>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as PaperSize)}
              style={{
                width: "100%", padding: "0.6rem 0.75rem",
                border: "1px solid var(--card-border)", borderRadius: "0.5rem",
                fontSize: "0.9rem", background: "var(--background)", color: "var(--foreground)",
              }}
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </label>

          {/* Orientation */}
          <label style={{ flex: 1, minWidth: "120px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Orientation</span>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as Orientation)}
              style={{
                width: "100%", padding: "0.6rem 0.75rem",
                border: "1px solid var(--card-border)", borderRadius: "0.5rem",
                fontSize: "0.9rem", background: "var(--background)", color: "var(--foreground)",
              }}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </label>
        </div>

        {/* Margins toggle */}
        <label style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          cursor: "pointer", fontSize: "0.85rem", marginTop: "1rem",
        }}>
          <input
            type="checkbox"
            checked={includeMargins}
            onChange={(e) => setIncludeMargins(e.target.checked)}
            style={{ width: "16px", height: "16px", cursor: "pointer" }}
          />
          <span style={{ fontWeight: 500 }}>Include page margins</span>
        </label>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button
          onClick={handlePreview}
          disabled={!htmlContent.trim()}
          className="btn-primary"
          style={{ flex: 1, padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}
        >
          Preview
        </button>
        <button
          onClick={handlePrint}
          disabled={!showPreview}
          className="btn-primary"
          style={{
            flex: 1, padding: "0.85rem", fontSize: "1rem", fontWeight: 700,
            background: showPreview ? "#22c55e" : undefined,
            borderColor: showPreview ? "#22c55e" : undefined,
          }}
        >
          Convert to PDF
        </button>
      </div>

      {!showPreview && htmlContent.trim() && (
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.8rem", marginBottom: "1rem" }}>
          Click &quot;Preview&quot; to see your HTML rendered, then &quot;Convert to PDF&quot; to save
        </p>
      )}

      {showPreview && (
        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.8rem", marginBottom: "1rem" }}>
          In the print dialog, select &quot;Save as PDF&quot; as the destination to download your PDF
        </p>
      )}

      {/* Preview iframe */}
      {showPreview && (
        <div style={{
          border: "1px solid var(--card-border)", borderRadius: "0.75rem",
          overflow: "hidden", marginBottom: "1.5rem", background: "#fff",
        }}>
          <div style={{
            padding: "0.5rem 1rem", background: "var(--card-bg)",
            borderBottom: "1px solid var(--card-border)",
            fontSize: "0.8rem", fontWeight: 600, color: "var(--muted)",
          }}>
            Preview
          </div>
          <iframe
            ref={iframeRef}
            srcDoc={getIframeContent()}
            title="HTML Preview"
            style={{
              width: "100%", minHeight: "400px", border: "none",
              background: "#fff",
            }}
            sandbox="allow-same-origin allow-modals"
          />
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Convert HTML to PDF Online
        </h2>
        <p>
          Paste your HTML code into the editor above and click &quot;Preview&quot; to see how it looks.
          Adjust the paper size, orientation, and margin settings as needed. Then click &quot;Convert to PDF&quot;
          to open your browser&apos;s print dialog &mdash; select &quot;Save as PDF&quot; as the destination to download your file.
          All rendering happens locally in your browser. Your HTML content is never uploaded to any server.
        </p>
      </section>
    </ToolLayout>
  );
}

export default function HtmlToPdfPage() {
  return (
    <ErrorBoundary fallbackMessage="Something went wrong with the HTML to PDF converter. Please refresh and try again.">
      <HtmlToPdfTool />
    </ErrorBoundary>
  );
}
