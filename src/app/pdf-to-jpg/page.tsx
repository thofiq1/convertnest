"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [quality, setQuality] = useState(0.92);
  const [scale, setScale] = useState(2);

  const handleFile = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.type !== "application/pdf") { alert("Please select a PDF file."); return; }
    setFile(f);
    setImages([]);
  }, []);

  const convert = async () => {
    if (!file) return;
    setProcessing(true);
    setImages([]);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const urls: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        const url = canvas.toDataURL("image/jpeg", quality);
        urls.push(url);
      }

      setImages(urls);
    } catch (err) {
      console.error("Conversion error:", err);
      alert("Error converting PDF. The file may be corrupted or password-protected.");
    }

    setProcessing(false);
  };

  const downloadImage = (url: string, index: number) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name?.replace(".pdf", "") || "page"}-${index + 1}.jpg`;
    a.click();
  };

  const downloadAll = () => {
    images.forEach((url, i) => {
      setTimeout(() => downloadImage(url, i), i * 200);
    });
  };

  return (
    <ToolLayout
      title="PDF to JPG"
      description="Convert each page of a PDF into a high-quality JPG image."
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
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📄</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop a PDF here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          Each page will be converted to a JPG image
        </p>
      </div>

      {file && (
        <div style={{ marginTop: "1.5rem" }}>
          <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>📄 {file.name}</p>

          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                Quality: {Math.round(quality * 100)}%
              </label>
              <input type="range" min="0.1" max="1" step="0.05" value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))} style={{ width: "150px" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
                Resolution
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {([1, 2, 3] as const).map((s) => (
                  <button key={s} onClick={() => setScale(s)}
                    style={{
                      padding: "0.4rem 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--card-border)",
                      background: scale === s ? "var(--primary)" : "var(--card-bg)",
                      color: scale === s ? "white" : "var(--foreground)",
                      cursor: "pointer", fontSize: "0.8rem",
                    }}>
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={convert} disabled={processing} className="btn-primary"
            style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", fontWeight: 600 }}>
            {processing ? "Converting..." : "Convert to JPG"}
          </button>
        </div>
      )}

      {images.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <p style={{ fontWeight: 600, color: "#22c55e" }}>Converted {images.length} page{images.length > 1 ? "s" : ""}!</p>
            {images.length > 1 && (
              <button onClick={downloadAll} className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                Download All
              </button>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {images.map((url, i) => (
              <div key={i} style={{ border: "1px solid var(--card-border)", borderRadius: "0.5rem", overflow: "hidden", background: "var(--card-bg)" }}>
                <img src={url} alt={`Page ${i + 1}`} style={{ width: "100%", display: "block" }} />
                <button onClick={() => downloadImage(url, i)}
                  style={{ width: "100%", padding: "0.5rem", border: "none", background: "var(--primary)", color: "white", cursor: "pointer", fontSize: "0.8rem" }}>
                  Page {i + 1} ↓
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          Convert PDF to JPG Images Online
        </h2>
        <p>
          Extract every page from your PDF as a high-quality JPG image. Adjust the quality and resolution
          to balance file size and clarity. Perfect for presentations, social media, or archiving.
        </p>
      </section>
    </ToolLayout>
  );
}
