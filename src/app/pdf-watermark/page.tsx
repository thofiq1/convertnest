"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { validateFileSize } from "@/utils/fileValidation";

type WatermarkPosition = "center" | "diagonal" | "top" | "bottom";

export default function PDFWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);

  // Watermark settings
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(36);
  const [opacity, setOpacity] = useState(30);
  const [color, setColor] = useState("#888888");
  const [position, setPosition] = useState<WatermarkPosition>("diagonal");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadPreview = useCallback(async (pdfFile: File) => {
    setLoading(true);
    setThumbnailUrl(null);
    setResultUrl(null);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      setThumbnailUrl(canvas.toDataURL("image/jpeg", 0.7));
      canvas.width = 0;
      canvas.height = 0;
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

  // Draw watermark preview overlay
  useEffect(() => {
    if (!thumbnailUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw watermark overlay
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r},${g},${b},${opacity / 100})`;
      const previewFontSize = fontSize * (canvas.width / 612); // scale relative to letter width
      ctx.font = `${previewFontSize}px Helvetica, Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (position === "diagonal") {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(watermarkText, 0, 0);
        ctx.restore();
      } else if (position === "center") {
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);
      } else if (position === "top") {
        ctx.fillText(watermarkText, canvas.width / 2, previewFontSize + 20);
      } else if (position === "bottom") {
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height - 20);
      }
    };
    img.src = thumbnailUrl;
  }, [thumbnailUrl, watermarkText, fontSize, opacity, color, position]);

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
    loadPreview(f);
  }, [loadPreview]);

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  };

  const applyWatermark = async () => {
    if (!file || !watermarkText.trim()) return;
    setProcessing(true);
    setResultUrl(null);
    try {
      const { PDFDocument, rgb, degrees, StandardFonts } = await import("pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const { r, g, b } = hexToRgb(color);

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

        let x: number;
        let y: number;
        let rotation = degrees(0);

        if (position === "diagonal") {
          x = width / 2 - textWidth / 2;
          y = height / 2;
          rotation = degrees(45);
        } else if (position === "center") {
          x = width / 2 - textWidth / 2;
          y = height / 2;
        } else if (position === "top") {
          x = width / 2 - textWidth / 2;
          y = height - fontSize - 20;
        } else {
          // bottom
          x = width / 2 - textWidth / 2;
          y = 20;
        }

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity: opacity / 100,
          rotate: rotation,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      console.error("Watermark error:", err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("encrypt") || msg.toLowerCase().includes("password")) {
        alert("This PDF is password-protected. Please remove the password first.");
      } else {
        alert("Error adding watermark. Please try again.");
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

  const downloadName = file ? file.name.replace(/\.pdf$/i, "") + "-watermarked.pdf" : "watermarked.pdf";

  return (
    <ToolLayout
      title="Add Watermark to PDF"
      description="Add text watermarks to your PDF files. Customize font size, opacity, position, and color. Free online tool."
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
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>💧</div>
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop a PDF file here or click to browse</p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Add a text watermark to every page</p>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{file.name}</span>
              <span style={{ color: "var(--muted)", fontSize: "0.85rem", marginLeft: "0.5rem" }}>
                ({pageCount} page{pageCount !== 1 ? "s" : ""})
              </span>
            </div>
            <button onClick={() => { setFile(null); setThumbnailUrl(null); setResultUrl(null); setPageCount(0); }}
              className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
              Change File
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>&#x23F3;</div>
              <p>Loading PDF preview...</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {/* Preview */}
              <div style={{
                background: "var(--card-bg)", border: "1px solid var(--card-border)",
                borderRadius: "0.75rem", padding: "1rem", textAlign: "center",
              }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.75rem" }}>Preview</div>
                <div style={{
                  background: "#f8f8f8", borderRadius: "0.5rem", overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  minHeight: "200px",
                }}>
                  <canvas ref={canvasRef} style={{ maxWidth: "100%", maxHeight: "350px", objectFit: "contain" }} />
                </div>
                <p style={{ color: "var(--muted)", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                  Page 1 of {pageCount} (watermark applies to all pages)
                </p>
              </div>

              {/* Controls */}
              <div style={{
                background: "var(--card-bg)", border: "1px solid var(--card-border)",
                borderRadius: "0.75rem", padding: "1.25rem",
              }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "1rem" }}>Watermark Settings</div>

                {/* Text */}
                <label style={{ display: "block", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Text</span>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => { setWatermarkText(e.target.value); setResultUrl(null); }}
                    placeholder="Enter watermark text"
                    style={{
                      width: "100%", padding: "0.5rem 0.75rem", border: "1px solid var(--card-border)",
                      borderRadius: "0.5rem", fontSize: "0.9rem", background: "var(--background)",
                      color: "var(--foreground)", boxSizing: "border-box",
                    }}
                  />
                </label>

                {/* Font Size */}
                <label style={{ display: "block", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>
                    Font Size: {fontSize}px
                  </span>
                  <input type="range" min={12} max={72} value={fontSize}
                    onChange={(e) => { setFontSize(Number(e.target.value)); setResultUrl(null); }}
                    style={{ width: "100%" }}
                  />
                </label>

                {/* Opacity */}
                <label style={{ display: "block", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>
                    Opacity: {opacity}%
                  </span>
                  <input type="range" min={10} max={100} value={opacity}
                    onChange={(e) => { setOpacity(Number(e.target.value)); setResultUrl(null); }}
                    style={{ width: "100%" }}
                  />
                </label>

                {/* Color & Position row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <label>
                    <span style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Color</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input type="color" value={color}
                        onChange={(e) => { setColor(e.target.value); setResultUrl(null); }}
                        style={{ width: "36px", height: "36px", border: "1px solid var(--card-border)", borderRadius: "0.25rem", cursor: "pointer", padding: 0 }}
                      />
                      <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{color}</span>
                    </div>
                  </label>
                  <label>
                    <span style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Position</span>
                    <select value={position}
                      onChange={(e) => { setPosition(e.target.value as WatermarkPosition); setResultUrl(null); }}
                      style={{
                        width: "100%", padding: "0.5rem", border: "1px solid var(--card-border)",
                        borderRadius: "0.5rem", fontSize: "0.85rem", background: "var(--background)",
                        color: "var(--foreground)",
                      }}
                    >
                      <option value="diagonal">Diagonal</option>
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          )}

          {!loading && (
            <button onClick={applyWatermark} disabled={processing || !watermarkText.trim()} className="btn-primary"
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700, marginTop: "1.5rem" }}>
              {processing ? "Adding Watermark..." : "Add Watermark"}
            </button>
          )}
        </div>
      )}

      {resultUrl && (
        <div style={{ marginTop: "1.5rem", padding: "1.5rem", textAlign: "center", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.75rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "1rem", color: "#22c55e", fontSize: "1.1rem" }}>&#x2713; Watermark added successfully!</p>
          <a href={resultUrl} download={downloadName} className="btn-primary"
            style={{ padding: "0.75rem 2rem", fontSize: "1rem", textDecoration: "none", display: "inline-block", background: "#22c55e", borderColor: "#22c55e" }}>
            Download Watermarked PDF
          </a>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Add a Watermark to PDF Online
        </h2>
        <p>
          Upload your PDF and customize the watermark text, font size, opacity, color, and position.
          Preview how the watermark looks on the first page before applying it to the entire document.
          Choose diagonal for a classic draft watermark or center, top, and bottom for stamps and labels.
          All processing happens locally in your browser &mdash; your files stay private and are never uploaded to a server.
        </p>
      </section>
    </ToolLayout>
  );
}
