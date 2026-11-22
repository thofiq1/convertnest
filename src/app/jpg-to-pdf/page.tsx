"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function JpgToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pageSize, setPageSize] = useState<"fit" | "a4" | "letter">("a4");

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const imageFiles = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...imageFiles]);
    setResultUrl(null);
  }, []);

  const moveFile = (index: number, direction: -1 | 1) => {
    const newFiles = [...files];
    const target = index + direction;
    if (target < 0 || target >= newFiles.length) return;
    [newFiles[index], newFiles[target]] = [newFiles[target], newFiles[index]];
    setFiles(newFiles);
  };

  const convert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResultUrl(null);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);

        let image;
        if (file.type === "image/png") {
          image = await pdfDoc.embedPng(uint8);
        } else {
          // Convert to JPEG via canvas for non-PNG formats
          if (file.type !== "image/jpeg") {
            const img = new Image();
            const url = URL.createObjectURL(file);
            await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = url; });
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext("2d")!.drawImage(img, 0, 0);
            const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/jpeg", 0.95));
            const jpegBuffer = new Uint8Array(await blob.arrayBuffer());
            URL.revokeObjectURL(url);
            image = await pdfDoc.embedJpg(jpegBuffer);
          } else {
            image = await pdfDoc.embedJpg(uint8);
          }
        }

        const imgWidth = image.width;
        const imgHeight = image.height;

        let pageWidth: number, pageHeight: number;
        if (pageSize === "fit") {
          pageWidth = imgWidth;
          pageHeight = imgHeight;
        } else if (pageSize === "letter") {
          pageWidth = 612; pageHeight = 792;
        } else {
          pageWidth = 595.28; pageHeight = 841.89; // A4
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        if (pageSize === "fit") {
          page.drawImage(image, { x: 0, y: 0, width: imgWidth, height: imgHeight });
        } else {
          const scale = Math.min(
            (pageWidth - 40) / imgWidth,
            (pageHeight - 40) / imgHeight
          );
          const w = imgWidth * scale;
          const h = imgHeight * scale;
          page.drawImage(image, {
            x: (pageWidth - w) / 2,
            y: (pageHeight - h) / 2,
            width: w,
            height: h,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Conversion error:", err);
      alert("Error converting images to PDF. Please try different images.");
    }

    setProcessing(false);
  };

  return (
    <ToolLayout
      title="JPG to PDF"
      description="Convert images to PDF for free. Combine multiple photos into a single PDF document."
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.multiple = true;
          input.onchange = () => handleFiles(input.files);
          input.click();
        }}
        style={{
          border: `2px dashed ${dragOver ? "var(--primary)" : "var(--card-border)"}`,
          borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center",
          cursor: "pointer", background: dragOver ? "var(--accent)" : "var(--card-bg)", transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🖼️</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop images here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          JPG, PNG, WebP, BMP — combine multiple images into one PDF
        </p>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", display: "block" }}>
              Page Size
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {([["a4", "A4"], ["letter", "Letter"], ["fit", "Fit to Image"]] as const).map(([value, label]) => (
                <button key={value} onClick={() => setPageSize(value)}
                  style={{
                    padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid var(--card-border)",
                    background: pageSize === value ? "var(--primary)" : "var(--card-bg)",
                    color: pageSize === value ? "white" : "var(--foreground)",
                    cursor: "pointer", fontSize: "0.85rem",
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {files.map((file, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.9rem" }}>
                <span style={{ color: "var(--muted)", marginRight: "0.5rem" }}>{i + 1}.</span>
                🖼️ {file.name}
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => moveFile(i, -1)} disabled={i === 0}
                  style={{ background: "none", border: "1px solid var(--card-border)", borderRadius: "0.25rem", padding: "0.2rem 0.5rem", cursor: "pointer", color: "var(--foreground)" }}>↑</button>
                <button onClick={() => moveFile(i, 1)} disabled={i === files.length - 1}
                  style={{ background: "none", border: "1px solid var(--card-border)", borderRadius: "0.25rem", padding: "0.2rem 0.5rem", cursor: "pointer", color: "var(--foreground)" }}>↓</button>
                <button onClick={() => { setFiles((p) => p.filter((_, j) => j !== i)); }}
                  style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
              </div>
            </div>
          ))}

          <button onClick={convert} disabled={processing} className="btn-primary"
            style={{ marginTop: "1rem", width: "100%", padding: "0.75rem", fontSize: "1rem", fontWeight: 600 }}>
            {processing ? "Converting..." : `Convert ${files.length} Image${files.length > 1 ? "s" : ""} to PDF`}
          </button>
        </div>
      )}

      {resultUrl && (
        <div className="result-box" style={{ marginTop: "1.5rem", padding: "1.5rem", textAlign: "center" }}>
          <p style={{ fontWeight: 600, marginBottom: "1rem", color: "#22c55e" }}>PDF created successfully!</p>
          <a href={resultUrl} download="images.pdf" className="btn-primary"
            style={{ padding: "0.75rem 2rem", fontSize: "1rem", textDecoration: "none", display: "inline-block" }}>
            Download PDF
          </a>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Convert JPG to PDF
        </h2>
        <p>
          Upload your images, choose a page size, reorder if needed, and click convert.
          Your images will be converted into a single PDF document that you can download instantly.
          Perfect for creating PDF portfolios, scanning documents, or combining photos.
        </p>
      </section>
    </ToolLayout>
  );
}
