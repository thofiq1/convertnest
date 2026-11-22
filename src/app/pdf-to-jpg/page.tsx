"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

interface ConvertedPage {
  pageNum: number;
  dataUrl: string;
  blob: Blob;
}

export default function PDFtoJPG() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [format, setFormat] = useState<"jpeg" | "png">("jpeg");
  const [quality, setQuality] = useState(0.92);
  const [scale, setScale] = useState(2);
  const [rangeMode, setRangeMode] = useState<"all" | "range">("all");
  const [rangeInput, setRangeInput] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.type !== "application/pdf") return;
    setFile(f);
    setConvertedPages([]);
    // Count pages
    (async () => {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const ab = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
      setTotalPages(pdf.numPages);
    })();
  }, []);

  const parseRange = (input: string, total: number): number[] => {
    const result = new Set<number>();
    input.split(",").map((s) => s.trim()).filter(Boolean).forEach((part) => {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map((s) => parseInt(s.trim()));
        if (!isNaN(a) && !isNaN(b)) for (let i = Math.max(1, a); i <= Math.min(total, b); i++) result.add(i);
      } else {
        const n = parseInt(part);
        if (!isNaN(n) && n >= 1 && n <= total) result.add(n);
      }
    });
    return Array.from(result).sort((a, b) => a - b);
  };

  const convert = async () => {
    if (!file) return;
    setProcessing(true);
    setConvertedPages([]);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const ab = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise;

      const pageNums = rangeMode === "all"
        ? Array.from({ length: pdf.numPages }, (_, i) => i + 1)
        : parseRange(rangeInput, pdf.numPages);

      if (pageNums.length === 0) {
        alert("No valid pages selected.");
        setProcessing(false);
        return;
      }

      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const results: ConvertedPage[] = [];

      for (const pageNum of pageNums) {
        setProgress(`Converting page ${pageNum} of ${pdf.numPages}...`);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), mimeType, format === "jpeg" ? quality : undefined)
        );
        const dataUrl = canvas.toDataURL(mimeType, format === "jpeg" ? quality : undefined);
        canvas.width = 0;
        canvas.height = 0;
        results.push({ pageNum, dataUrl, blob });
      }

      setConvertedPages(results);
      setProgress("");
    } catch (err) {
      console.error("Conversion error:", err);
      alert("Error converting PDF. Please try again.");
    }
    setProcessing(false);
  };

  const downloadAll = async () => {
    if (convertedPages.length === 1) {
      const a = document.createElement("a");
      a.href = convertedPages[0].dataUrl;
      a.download = `${file!.name.replace(/\.pdf$/i, "")}_page_${convertedPages[0].pageNum}.${format === "png" ? "png" : "jpg"}`;
      a.click();
      return;
    }
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const baseName = file!.name.replace(/\.pdf$/i, "");
    const ext = format === "png" ? "png" : "jpg";
    convertedPages.forEach((cp) => {
      zip.file(`${baseName}_page_${cp.pageNum}.${ext}`, cp.blob);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${baseName}-images.zip`;
    a.click();
  };

  const downloadSingle = (cp: ConvertedPage) => {
    const a = document.createElement("a");
    a.href = cp.dataUrl;
    a.download = `${file!.name.replace(/\.pdf$/i, "")}_page_${cp.pageNum}.${format === "png" ? "png" : "jpg"}`;
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <ToolLayout
      title="PDF to JPG / PNG"
      description="Convert PDF pages to high-quality JPG or PNG images. Choose resolution, quality, and page range."
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
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🖼</div>
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop a PDF file here or click to browse</p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Convert pages to JPG or PNG images</p>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{file.name}</span>
              <span style={{ color: "var(--muted)", fontSize: "0.85rem", marginLeft: "0.5rem" }}>
                ({totalPages} page{totalPages !== 1 ? "s" : ""})
              </span>
            </div>
            <button onClick={() => { setFile(null); setConvertedPages([]); setTotalPages(0); }}
              className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
              Change File
            </button>
          </div>

          {/* Settings */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem",
            padding: "1rem", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.5rem",
          }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Output Format</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(["jpeg", "png"] as const).map((f) => (
                  <button key={f} onClick={() => setFormat(f)}
                    style={{
                      flex: 1, padding: "0.5rem", border: "1px solid var(--card-border)", borderRadius: "0.3rem",
                      background: format === f ? "var(--primary)" : "var(--card-bg)",
                      color: format === f ? "#fff" : "var(--foreground)",
                      cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "all 0.15s",
                    }}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Resolution</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[{ label: "1x", value: 1 }, { label: "2x", value: 2 }, { label: "3x", value: 3 }].map((r) => (
                  <button key={r.value} onClick={() => setScale(r.value)}
                    style={{
                      flex: 1, padding: "0.5rem", border: "1px solid var(--card-border)", borderRadius: "0.3rem",
                      background: scale === r.value ? "var(--primary)" : "var(--card-bg)",
                      color: scale === r.value ? "#fff" : "var(--foreground)",
                      cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "all 0.15s",
                    }}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {format === "jpeg" && (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                  Quality: {Math.round(quality * 100)}%
                </label>
                <input type="range" min="10" max="100" step="5" value={Math.round(quality * 100)}
                  onChange={(e) => setQuality(parseInt(e.target.value) / 100)}
                  style={{ width: "100%" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--muted)" }}>
                  <span>Smaller file</span><span>Higher quality</span>
                </div>
              </div>
            )}

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>Page Range</label>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button onClick={() => setRangeMode("all")}
                  style={{
                    padding: "0.5rem 0.75rem", border: "1px solid var(--card-border)", borderRadius: "0.3rem",
                    background: rangeMode === "all" ? "var(--primary)" : "var(--card-bg)",
                    color: rangeMode === "all" ? "#fff" : "var(--foreground)",
                    cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
                  }}>
                  All Pages
                </button>
                <button onClick={() => setRangeMode("range")}
                  style={{
                    padding: "0.5rem 0.75rem", border: "1px solid var(--card-border)", borderRadius: "0.3rem",
                    background: rangeMode === "range" ? "var(--primary)" : "var(--card-bg)",
                    color: rangeMode === "range" ? "#fff" : "var(--foreground)",
                    cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
                  }}>
                  Custom Range
                </button>
                {rangeMode === "range" && (
                  <input type="text" value={rangeInput} onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="e.g. 1-3, 5" style={{
                      flex: 1, padding: "0.5rem", border: "1px solid var(--card-border)",
                      borderRadius: "0.3rem", fontSize: "0.85rem", background: "var(--card-bg)",
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <button onClick={convert} disabled={processing} className="btn-primary"
            style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
            {processing ? progress || "Converting..." : `Convert to ${format.toUpperCase()}`}
          </button>

          {/* Results grid */}
          {convertedPages.length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                  {convertedPages.length} image{convertedPages.length !== 1 ? "s" : ""} converted
                </p>
                <button onClick={downloadAll} className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                  {convertedPages.length > 1 ? "Download All (ZIP)" : "Download"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem" }}>
                {convertedPages.map((cp) => (
                  <div key={cp.pageNum} style={{
                    borderRadius: "0.5rem", overflow: "hidden",
                    border: "1px solid var(--card-border)", background: "var(--card-bg)",
                  }}>
                    <div style={{ width: "100%", aspectRatio: "3/4", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8f8" }}>
                      <img src={cp.dataUrl} alt={`Page ${cp.pageNum}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div style={{ padding: "0.4rem 0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>Page {cp.pageNum}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{formatSize(cp.blob.size)}</div>
                      </div>
                      <button onClick={() => downloadSingle(cp)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem", padding: "0.2rem" }}>
                        ⬇
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Convert PDF to Images
        </h2>
        <p>
          Upload a PDF and choose your output format (JPG or PNG), resolution (1x, 2x, 3x), and quality.
          Select specific pages or convert the entire document. Download individual images or get them all
          in a ZIP file. Perfect for presentations, social media, or archiving. All processing happens
          in your browser — your files stay private.
        </p>
      </section>
    </ToolLayout>
  );
}
