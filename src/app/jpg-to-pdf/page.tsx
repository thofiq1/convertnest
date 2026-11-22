"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";

interface ImageEntry {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

export default function JPGtoPDF() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [pageSize, setPageSize] = useState<"a4" | "letter" | "fit">("a4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape" | "auto">("auto");
  const [margin, setMargin] = useState(20);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => { if (img.previewUrl) URL.revokeObjectURL(img.previewUrl); });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadImage = (file: File): Promise<ImageEntry> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => resolve({ file, previewUrl: url, width: img.width, height: img.height });
      img.onerror = () => resolve({ file, previewUrl: url, width: 0, height: 0 });
      img.src = url;
    });
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const imgFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setResultUrl(null);
    const newEntries = await Promise.all(imgFiles.map(loadImage));
    setImages((prev) => [...prev, ...newEntries]);
  }, []);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setResultUrl(null);
  };

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) setDragOverIndex(index);
  };
  const handleDrop = (index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      setImages((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(dragIndex, 1);
        updated.splice(index, 0, moved);
        return updated;
      });
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => { setDragIndex(null); setDragOverIndex(null); };

  const convert = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    setResultUrl(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();

      const pageSizes: Record<string, [number, number]> = {
        a4: [595.28, 841.89],
        letter: [612, 792],
      };

      for (const entry of images) {
        const imgBytes = new Uint8Array(await entry.file.arrayBuffer());
        let pdfImage;
        const type = entry.file.type.toLowerCase();
        if (type === "image/png") {
          pdfImage = await pdfDoc.embedPng(imgBytes);
        } else {
          // Convert non-JPEG to JPEG via canvas
          if (type !== "image/jpeg" && type !== "image/jpg") {
            const canvas = document.createElement("canvas");
            const img = new Image();
            await new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.src = entry.previewUrl;
            });
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Canvas not supported by your browser");
            ctx.drawImage(img, 0, 0);
            const blob = await new Promise<Blob>((resolve, reject) =>
              canvas.toBlob((b) => {
                if (!b) { reject(new Error("Failed to convert image")); return; }
                resolve(b);
              }, "image/jpeg", 0.92)
            );
            const jpegBytes = new Uint8Array(await blob.arrayBuffer());
            pdfImage = await pdfDoc.embedJpg(jpegBytes);
            canvas.width = 0;
            canvas.height = 0;
          } else {
            pdfImage = await pdfDoc.embedJpg(imgBytes);
          }
        }

        const imgWidth = pdfImage.width;
        const imgHeight = pdfImage.height;
        const isLandscapeImg = imgWidth > imgHeight;

        let pageWidth: number, pageHeight: number;

        if (pageSize === "fit") {
          pageWidth = imgWidth + margin * 2;
          pageHeight = imgHeight + margin * 2;
        } else {
          [pageWidth, pageHeight] = pageSizes[pageSize];
          if (orientation === "landscape" || (orientation === "auto" && isLandscapeImg)) {
            [pageWidth, pageHeight] = [pageHeight, pageWidth];
          }
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const drawableW = pageWidth - margin * 2;
        const drawableH = pageHeight - margin * 2;
        const scaleX = drawableW / imgWidth;
        const scaleY = drawableH / imgHeight;
        const s = Math.min(scaleX, scaleY, 1);
        const finalW = imgWidth * s;
        const finalH = imgHeight * s;
        const x = margin + (drawableW - finalW) / 2;
        const y = margin + (drawableH - finalH) / 2;

        page.drawImage(pdfImage, { x, y, width: finalW, height: finalH });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Conversion error:", err);
      alert("Error creating PDF. Please try again.");
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
      title="JPG to PDF"
      description="Convert images to PDF. Supports JPG, PNG, WebP, and BMP. Reorder, set page size, orientation, and margins."
    >
      <div
        onDragOver={(e) => { e.preventDefault(); if (dragIndex === null) setDragOver(true); }}
        onDragLeave={() => { if (dragIndex === null) setDragOver(false); }}
        onDrop={(e) => { e.preventDefault(); if (dragIndex === null) { setDragOver(false); handleFiles(e.dataTransfer.files); } }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file"; input.accept = "image/*"; input.multiple = true;
          input.onchange = () => handleFiles(input.files); input.click();
        }}
        style={{
          border: `2px dashed ${dragOver ? "var(--primary)" : "var(--card-border)"}`,
          borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center",
          cursor: "pointer", background: dragOver ? "rgba(37,99,235,0.04)" : "var(--card-bg)", transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📸</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop images here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Supports JPG, PNG, WebP, BMP</p>
      </div>

      {images.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          {/* Settings */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem",
            padding: "1rem", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.5rem",
          }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Page Size</label>
              <select value={pageSize} onChange={(e) => { setPageSize(e.target.value as "a4" | "letter" | "fit"); setResultUrl(null); }}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--card-border)", background: "var(--card-bg)", fontSize: "0.85rem" }}>
                <option value="a4">A4</option>
                <option value="letter">US Letter</option>
                <option value="fit">Fit to Image</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Orientation</label>
              <select value={orientation} onChange={(e) => { setOrientation(e.target.value as "portrait" | "landscape" | "auto"); setResultUrl(null); }}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.3rem", border: "1px solid var(--card-border)", background: "var(--card-bg)", fontSize: "0.85rem" }}
                disabled={pageSize === "fit"}>
                <option value="auto">Auto</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                Margin: {margin}pt
              </label>
              <input type="range" min="0" max="72" step="4" value={margin}
                onChange={(e) => { setMargin(parseInt(e.target.value)); setResultUrl(null); }}
                style={{ width: "100%" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--muted)" }}>
                <span>None</span><span>1 inch</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              {images.length} image{images.length !== 1 ? "s" : ""} · Drag to reorder
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const input = document.createElement("input");
                input.type = "file"; input.accept = "image/*"; input.multiple = true;
                input.onchange = () => handleFiles(input.files); input.click();
              }}
              className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
              + Add More
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
            {images.map((entry, i) => (
              <div key={i} draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                style={{
                  borderRadius: "0.5rem", overflow: "hidden",
                  border: dragOverIndex === i ? "2px dashed var(--primary)" : "1px solid var(--card-border)",
                  background: "var(--card-bg)", cursor: "grab",
                  opacity: dragIndex === i ? 0.5 : 1, transition: "all 0.15s", position: "relative",
                }}>
                <button onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                  style={{
                    position: "absolute", top: "2px", right: "2px", width: "20px", height: "20px",
                    background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%",
                    cursor: "pointer", fontSize: "0.65rem", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1,
                  }}>✕</button>
                <div style={{ width: "100%", aspectRatio: "1", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8f8" }}>
                  <img src={entry.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "0.3rem", textAlign: "center" }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.file.name}
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "var(--muted)" }}>
                    {entry.width}×{entry.height} · {formatSize(entry.file.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={convert} disabled={processing} className="btn-primary"
            style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}>
            {processing ? "Creating PDF..." : `Convert ${images.length} Image${images.length !== 1 ? "s" : ""} to PDF`}
          </button>
        </div>
      )}

      {resultUrl && (
        <div style={{ marginTop: "1.5rem", padding: "1.5rem", textAlign: "center", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.75rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "1rem", color: "#22c55e", fontSize: "1.1rem" }}>✓ PDF created successfully!</p>
          <a href={resultUrl} download={images.length > 0 ? images[0].file.name.replace(/\.[^.]+$/, "") + ".pdf" : "images.pdf"}
            className="btn-primary"
            style={{ padding: "0.75rem 2rem", fontSize: "1rem", textDecoration: "none", display: "inline-block" }}>
            Download PDF
          </a>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Convert Images to PDF
        </h2>
        <p>
          Select or drag and drop your images (JPG, PNG, WebP, or BMP). Drag to reorder them — images
          convert top to bottom. Choose your page size (A4, US Letter, or fit to image), orientation,
          and margins. Click Convert and download your PDF. All processing happens in your browser —
          your images are never uploaded anywhere.
        </p>
      </section>
    </ToolLayout>
  );
}
