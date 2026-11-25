"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { parsePageRange } from "@/lib/pageRange";
import ToolLayout from "@/components/ToolLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { validateFileSize } from "@/utils/fileValidation";

interface ConvertedPage {
  pageNum: number;
  url: string;
  blob: Blob;
  /** File extension matching the encoded data, fixed at conversion time */
  ext: "jpg" | "png";
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

  // Cleanup Object URLs on unmount
  useEffect(() => {
    return () => {
      convertedPages.forEach((cp) => {
        if (cp.url) URL.revokeObjectURL(cp.url);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warn before leaving page with active work
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (file || processing) { e.preventDefault(); }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [file, processing]);

  const [sizeWarning, setSizeWarning] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFile = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) {
      setFileError(`${f.name} isn't a PDF. Please choose a PDF file.`);
      return;
    }
    setFileError(null);

    const sizeCheck = validateFileSize(f, "pdf");
    if (!sizeCheck.valid) {
      alert(sizeCheck.error);
      return;
    }
    setSizeWarning(sizeCheck.warning || "");

    setFile(f);
    setConvertedPages([]);
    // Count pages
    (async () => {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const ab = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
      setTotalPages(pdf.numPages);
    })().catch((err) => {
      const msg = err instanceof Error ? err.message.toLowerCase() : "";
      if (msg.includes("encrypt") || msg.includes("password")) {
        alert("This PDF is password-protected. Please remove the password and try again.");
      } else {
        alert("Error reading PDF file. Please try another file.");
      }
      setFile(null);
    });
  }, []);


  const convertingRef = useRef(false);
  const convert = async () => {
    if (!file || convertingRef.current) return;
    convertingRef.current = true;
    setProcessing(true);
    setConvertedPages([]);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const ab = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise;

      const parsed = rangeMode === "all" ? null : parsePageRange(rangeInput, pdf.numPages);
      if (parsed?.error) {
        alert(parsed.error);
        convertingRef.current = false;
        setProcessing(false);
        return;
      }
      const pageNums = parsed ? parsed.pages : Array.from({ length: pdf.numPages }, (_, i) => i + 1);

      if (pageNums.length === 0) {
        alert("No valid pages selected.");
        convertingRef.current = false;
        setProcessing(false);
        return;
      }
      if (pageNums.length > 300 && !window.confirm(`This will convert ${pageNums.length} pages, which can take a long time and use a lot of memory. Continue? (Tip: pick a page range instead.)`)) {
        convertingRef.current = false;
        setProcessing(false);
        return;
      }

      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const ext: "jpg" | "png" = format === "png" ? "png" : "jpg";
      const results: ConvertedPage[] = [];

      for (const pageNum of pageNums) {
        setProgress(`Converting page ${pageNum} of ${pdf.numPages}...`);
        const page = await pdf.getPage(pageNum);
        // Cap each page at ~16 megapixels so very large pages still convert.
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: Math.min(scale, Math.sqrt(16_000_000 / Math.max(1, base.width * base.height))) });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported by your browser");
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob((b) => {
            if (!b) { reject(new Error(`Failed to convert page ${pageNum}`)); return; }
            resolve(b);
          }, mimeType, format === "jpeg" ? quality : undefined)
        );
        const url = URL.createObjectURL(blob);
        canvas.width = 0;
        canvas.height = 0;
        results.push({ pageNum, url, blob, ext });
      }

      setConvertedPages(results);
      setProgress("");
    } catch (err) {
      console.error("Conversion error:", err);
      const msg = err instanceof Error ? err.message.toLowerCase() : "";
      if (msg.includes("encrypt") || msg.includes("password")) {
        alert("This PDF is password-protected. Please remove the password and try again.");
      } else {
        alert("Error converting PDF. Please try again.");
      }
    }
    convertingRef.current = false;
        setProcessing(false);
  };

  const downloadAll = async () => {
    if (convertedPages.length === 1) {
      const a = document.createElement("a");
      a.href = convertedPages[0].url;
      a.download = `${file!.name.replace(/\.pdf$/i, "")}_page_${convertedPages[0].pageNum}.${convertedPages[0].ext}`;
      a.click();
      return;
    }
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const baseName = file!.name.replace(/\.pdf$/i, "");
    convertedPages.forEach((cp) => {
      zip.file(`${baseName}_page_${cp.pageNum}.${cp.ext}`, cp.blob);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    const zipUrl = URL.createObjectURL(blob);
    a.href = zipUrl;
    a.download = `${baseName}-images.zip`;
    a.click();
    URL.revokeObjectURL(zipUrl);
  };

  const downloadSingle = (cp: ConvertedPage) => {
    const a = document.createElement("a");
    a.href = cp.url;
    a.download = `${file!.name.replace(/\.pdf$/i, "")}_page_${cp.pageNum}.${cp.ext}`;
    a.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <ErrorBoundary>
    <ToolLayout
      slug="pdf-to-jpg"
      title="PDF to JPG / PNG"
      description="Convert PDF pages to high-quality JPG or PNG images. Choose resolution, quality, and page range."
      faqs={[
        { question: "Should I choose JPG or PNG?", answer: "JPG is best for photos and general use — smaller files with great quality. PNG is ideal when you need transparency or pixel-perfect text." },
        { question: "What resolution should I use?", answer: "2x (default) works well for most uses. Use 3x for print-quality images or 1x for smaller file sizes." },
        { question: "Can I convert specific pages only?", answer: "Yes. Switch to 'Custom Range' and enter page numbers like '1-3, 5' to convert only the pages you need." },
      ]}
    >
      {sizeWarning && (
        <div style={{
          padding: "0.75rem 1rem", marginBottom: "1rem",
          background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.3)",
          borderRadius: "0.5rem", fontSize: "0.85rem", color: "#b45309",
        }}>
          ⚠ {sizeWarning}
        </div>
      )}
      {!file ? (
        <div data-dropzone="true"
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
          {fileError && <p role="alert" style={{ color: "#dc2626", fontSize: "0.85rem", marginTop: "0.75rem", fontWeight: 600 }}>{fileError}</p>}
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
                      <img src={cp.url} alt={`Page ${cp.pageNum}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
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
    </ErrorBoundary>
  );
}
