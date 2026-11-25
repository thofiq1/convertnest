"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { validateFileSize } from "@/utils/fileValidation";

type NumberPosition = "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-left" | "top-right";
type NumberFormat = "1" | "Page 1" | "1 of N" | "Page 1 of N";

interface PageThumb {
  pageNum: number;
  thumbnailUrl: string | null;
}

export default function PDFPageNumbers() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageThumb[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Settings
  const [numberPosition, setNumberPosition] = useState<NumberPosition>("bottom-center");
  const [numberFormat, setNumberFormat] = useState<NumberFormat>("1");
  const [startingNumber, setStartingNumber] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [skipFirstPage, setSkipFirstPage] = useState(false);

  const loadPages = useCallback(async (pdfFile: File) => {
    setLoading(true);
    setPages([]);
    setResultUrl(null);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const thumbs: PageThumb[] = [];

      const maxPreview = Math.min(pdf.numPages, 20);
      for (let i = 1; i <= maxPreview; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.25 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        thumbs.push({ pageNum: i, thumbnailUrl: canvas.toDataURL("image/jpeg", 0.6) });
        canvas.width = 0;
        canvas.height = 0;
      }
      // Add remaining pages without thumbnails
      for (let i = maxPreview + 1; i <= pdf.numPages; i++) {
        thumbs.push({ pageNum: i, thumbnailUrl: null });
      }
      setPages(thumbs);
    } catch (err: unknown) {
      console.error("Error loading PDF:", err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("encrypt") || msg.toLowerCase().includes("password")) {
        alert("This PDF is password-protected. Please remove the password first.");
      } else {
        alert("Error loading PDF. Please try another file.");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (file || processing) { e.preventDefault(); }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [file, processing]);

  const handleFile = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.type !== "application/pdf") return;
    const validation = validateFileSize(f, "pdf");
    if (!validation.valid) { alert(validation.error); return; }
    if (validation.warning) alert(validation.warning);
    setFile(f);
    loadPages(f);
  }, [loadPages]);

  const formatPageNumber = (pageIndex: number, totalPages: number): string => {
    const num = pageIndex + startingNumber;
    const total = totalPages + startingNumber - 1;
    switch (numberFormat) {
      case "1": return String(num);
      case "Page 1": return `Page ${num}`;
      case "1 of N": return `${num} of ${total}`;
      case "Page 1 of N": return `Page ${num} of ${total}`;
      default: return String(num);
    }
  };

  const getPositionCoords = (pos: NumberPosition, pageWidth: number, pageHeight: number, textWidth: number) => {
    const margin = 36; // 0.5 inch margin
    let x: number;
    let y: number;

    if (pos.includes("left")) {
      x = margin;
    } else if (pos.includes("right")) {
      x = pageWidth - margin - textWidth;
    } else {
      x = (pageWidth - textWidth) / 2;
    }

    if (pos.includes("top")) {
      y = pageHeight - margin;
    } else {
      y = margin;
    }

    return { x, y };
  };

  const applyPageNumbers = async () => {
    if (!file) return;
    setProcessing(true);
    setResultUrl(null);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pdfPages = pdfDoc.getPages();
      const totalPages = skipFirstPage ? pdfPages.length - 1 : pdfPages.length;

      for (let i = 0; i < pdfPages.length; i++) {
        if (skipFirstPage && i === 0) continue;

        const pageIndex = skipFirstPage ? i - 1 : i;
        const text = formatPageNumber(pageIndex, totalPages);
        const page = pdfPages[i];
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const { x, y } = getPositionCoords(numberPosition, width, height, textWidth);

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      console.error("Page number error:", err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("encrypt") || msg.toLowerCase().includes("password")) {
        alert("This PDF is password-protected. Please remove the password first.");
      } else {
        alert("Error adding page numbers. Please try again.");
      }
    }
    setProcessing(false);
  };

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getOverlayPosition = (pos: NumberPosition): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      fontSize: "0.5rem",
      fontWeight: 600,
      color: "#333",
      padding: "0 4px",
      whiteSpace: "nowrap",
    };
    if (pos.includes("top")) base.top = "4px";
    else base.bottom = "4px";
    if (pos.includes("left")) base.left = "4px";
    else if (pos.includes("right")) base.right = "4px";
    else { base.left = "50%"; base.transform = "translateX(-50%)"; }
    return base;
  };

  const downloadName = file ? file.name.replace(/\.pdf$/i, "") + "-numbered.pdf" : "numbered.pdf";

  return (
    <ToolLayout
      slug="pdf-page-numbers"
      title="Add Page Numbers to PDF"
      description="Add page numbers to your PDF files. Choose position, format, and starting number. Free online tool."
      faqs={[
        { question: "Which number formats can I use?", answer: "Four formats: 1, Page 1, 1 of N, and Page 1 of N. You can also choose the position (top or bottom; left, center or right), the font size and the starting number." },
        { question: "Can I leave the cover page unnumbered?", answer: "Yes. Turn on \"Skip first page\" and numbering starts on the second page." },
        { question: "Does adding page numbers change the rest of my PDF?", answer: "No. The numbers are drawn on top of your existing pages; the original content stays as it was." },
        { question: "Can I number a password-protected PDF?", answer: "Not directly. Remove the password first with the Unlock PDF tool, then add page numbers." },
      ]}
    >
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files); }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file"; input.accept = ".pdf";
            input.onchange = () => handleFile(input.files); input.click();
          }}
          style={{
            border: `2px dashed ${dragOver ? "var(--primary)" : "var(--card-border)"}`,
            borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center",
            cursor: "pointer", background: dragOver ? "rgba(37,99,235,0.04)" : "var(--card-bg)", transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>#</div>
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop a PDF file here or click to browse</p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Add page numbers to every page of your PDF</p>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{file.name}</span>
              <span style={{ color: "var(--muted)", fontSize: "0.85rem", marginLeft: "0.5rem" }}>
                ({pages.length} page{pages.length !== 1 ? "s" : ""})
              </span>
            </div>
            <button onClick={() => { setFile(null); setPages([]); setResultUrl(null); }}
              className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
              Change File
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>&#x23F3;</div>
              <p>Loading page thumbnails...</p>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div style={{
                background: "var(--card-bg)", border: "1px solid var(--card-border)",
                borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.5rem",
              }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "1rem" }}>Page Number Settings</div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {/* Position */}
                  <label>
                    <span style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Position</span>
                    <select value={numberPosition}
                      onChange={(e) => { setNumberPosition(e.target.value as NumberPosition); setResultUrl(null); }}
                      style={{
                        width: "100%", padding: "0.5rem", border: "1px solid var(--card-border)",
                        borderRadius: "0.5rem", fontSize: "0.85rem", background: "var(--background)",
                        color: "var(--foreground)",
                      }}
                    >
                      <option value="bottom-center">Bottom Center</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="top-center">Top Center</option>
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                    </select>
                  </label>

                  {/* Format */}
                  <label>
                    <span style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Format</span>
                    <select value={numberFormat}
                      onChange={(e) => { setNumberFormat(e.target.value as NumberFormat); setResultUrl(null); }}
                      style={{
                        width: "100%", padding: "0.5rem", border: "1px solid var(--card-border)",
                        borderRadius: "0.5rem", fontSize: "0.85rem", background: "var(--background)",
                        color: "var(--foreground)",
                      }}
                    >
                      <option value="1">1, 2, 3...</option>
                      <option value="Page 1">Page 1, Page 2...</option>
                      <option value="1 of N">1 of N, 2 of N...</option>
                      <option value="Page 1 of N">Page 1 of N...</option>
                    </select>
                  </label>

                  {/* Starting Number */}
                  <label>
                    <span style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Starting Number</span>
                    <input type="number" min={1} value={startingNumber}
                      onChange={(e) => { setStartingNumber(Math.max(1, Number(e.target.value))); setResultUrl(null); }}
                      style={{
                        width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--card-border)",
                        borderRadius: "0.5rem", fontSize: "0.85rem", background: "var(--background)",
                        color: "var(--foreground)", boxSizing: "border-box",
                      }}
                    />
                  </label>

                  {/* Font Size */}
                  <label>
                    <span style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>
                      Font Size: {fontSize}pt
                    </span>
                    <input type="range" min={8} max={24} value={fontSize}
                      onChange={(e) => { setFontSize(Number(e.target.value)); setResultUrl(null); }}
                      style={{ width: "100%" }}
                    />
                  </label>
                </div>

                {/* Skip first page toggle */}
                <label style={{
                  display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem",
                  cursor: "pointer", fontSize: "0.85rem",
                }}>
                  <input type="checkbox" checked={skipFirstPage}
                    onChange={(e) => { setSkipFirstPage(e.target.checked); setResultUrl(null); }}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: 500 }}>Skip first page (title page)</span>
                </label>
              </div>

              {/* Page preview grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
                {pages.slice(0, 12).map((page, i) => {
                  const shouldSkip = skipFirstPage && i === 0;
                  const pageIndex = skipFirstPage ? i - 1 : i;
                  const displayNum = shouldSkip ? null : formatPageNumber(pageIndex, skipFirstPage ? pages.length - 1 : pages.length);

                  return (
                    <div key={i} style={{
                      borderRadius: "0.5rem", overflow: "hidden",
                      border: "1px solid var(--card-border)",
                      background: "var(--card-bg)", opacity: shouldSkip ? 0.5 : 1,
                    }}>
                      <div style={{
                        width: "100%", aspectRatio: "3/4", overflow: "hidden",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "#f8f8f8", position: "relative",
                      }}>
                        {page.thumbnailUrl ? (
                          <img src={page.thumbnailUrl} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                        ) : (
                          <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>Page {page.pageNum}</span>
                        )}
                        {displayNum && (
                          <span style={getOverlayPosition(numberPosition)}>{displayNum}</span>
                        )}
                        {shouldSkip && (
                          <span style={{
                            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                            fontSize: "0.6rem", color: "var(--muted)", fontWeight: 600, background: "rgba(255,255,255,0.8)",
                            padding: "2px 6px", borderRadius: "4px",
                          }}>
                            Skipped
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {pages.length > 12 && (
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "0.5rem", border: "1px solid var(--card-border)",
                    background: "var(--card-bg)", aspectRatio: "3/4",
                    color: "var(--muted)", fontSize: "0.8rem", fontWeight: 600,
                  }}>
                    +{pages.length - 12} more
                  </div>
                )}
              </div>

              <button onClick={applyPageNumbers} disabled={processing} className="btn-primary"
                style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}>
                {processing ? "Adding Page Numbers..." : `Add Page Numbers to ${pages.length} Page${pages.length !== 1 ? "s" : ""}`}
              </button>
            </>
          )}
        </div>
      )}

      {resultUrl && (
        <div style={{ marginTop: "1.5rem", padding: "1.5rem", textAlign: "center", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.75rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "1rem", color: "#22c55e", fontSize: "1.1rem" }}>&#x2713; Page numbers added successfully!</p>
          <a href={resultUrl} download={downloadName} className="btn-primary"
            style={{ padding: "0.75rem 2rem", fontSize: "1rem", textDecoration: "none", display: "inline-block", background: "#22c55e", borderColor: "#22c55e" }}>
            Download Numbered PDF
          </a>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Add Page Numbers to PDF Online
        </h2>
        <p>
          Upload your PDF and configure page number position, format, and starting number.
          Preview how the numbers will look on your pages before applying. Use the skip first page
          option for documents with a title page. Choose from formats like simple numbers, &quot;Page X&quot;,
          or &quot;X of N&quot; styles. All processing happens locally in your browser &mdash; your files
          stay private.
        </p>
      </section>
    </ToolLayout>
  );
}
