"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";

interface PageInfo {
  pageNum: number;
  thumbnailUrl: string | null;
  selected: boolean;
}

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"visual" | "range">("visual");
  const [rangeInput, setRangeInput] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const loadPages = useCallback(async (pdfFile: File) => {
    setLoading(true);
    setPages([]);
    setResultUrl(null);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageInfos: PageInfo[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.25 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const url = canvas.toDataURL("image/jpeg", 0.6);
        canvas.width = 0;
        canvas.height = 0;
        pageInfos.push({ pageNum: i, thumbnailUrl: url, selected: false });
      }
      setPages(pageInfos);
    } catch (err) {
      console.error("Error loading PDF:", err);
      alert("Error loading PDF. Please try another file.");
    }
    setLoading(false);
  }, []);

  const handleFile = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.type !== "application/pdf") return;
    setFile(f);
    loadPages(f);
  }, [loadPages]);

  const togglePage = (index: number) => {
    setPages((prev) => prev.map((p, i) => i === index ? { ...p, selected: !p.selected } : p));
    setResultUrl(null);
  };

  const selectAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: true })));
    setResultUrl(null);
  };

  const deselectAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: false })));
    setResultUrl(null);
  };

  const parseRange = (input: string, totalPages: number): number[] => {
    const result = new Set<number>();
    const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-").map((s) => s.trim());
        const start = parseInt(startStr);
        const end = parseInt(endStr);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
            result.add(i);
          }
        }
      } else {
        const num = parseInt(part);
        if (!isNaN(num) && num >= 1 && num <= totalPages) {
          result.add(num);
        }
      }
    }
    return Array.from(result).sort((a, b) => a - b);
  };

  const extractPages = async () => {
    if (!file) return;
    setProcessing(true);
    setResultUrl(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(arrayBuffer);

      let selectedPageNums: number[];
      if (mode === "visual") {
        selectedPageNums = pages.filter((p) => p.selected).map((p) => p.pageNum);
      } else {
        selectedPageNums = parseRange(rangeInput, srcPdf.getPageCount());
      }

      if (selectedPageNums.length === 0) {
        alert("Please select at least one page.");
        setProcessing(false);
        return;
      }

      const newPdf = await PDFDocument.create();
      const indices = selectedPageNums.map((n) => n - 1);
      const copiedPages = await newPdf.copyPages(srcPdf, indices);
      copiedPages.forEach((page) => newPdf.addPage(page));
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Split error:", err);
      alert("Error splitting PDF. Please try again.");
    }
    setProcessing(false);
  };

  const splitAll = async () => {
    if (!file) return;
    setProcessing(true);
    setResultUrl(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const JSZip = (await import("jszip")).default;
      const arrayBuffer = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(arrayBuffer);
      const zip = new JSZip();
      const baseName = file.name.replace(/\.pdf$/i, "");

      for (let i = 0; i < srcPdf.getPageCount(); i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(srcPdf, [i]);
        newPdf.addPage(page);
        const pdfBytes = await newPdf.save();
        zip.file(`${baseName}_page_${i + 1}.pdf`, pdfBytes);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      setResultUrl(URL.createObjectURL(zipBlob));
    } catch (err) {
      console.error("Split all error:", err);
      alert("Error splitting pages. Please try again.");
    }
    setProcessing(false);
  };

  const selectedCount = pages.filter((p) => p.selected).length;
  const downloadName = file
    ? file.name.replace(/\.pdf$/i, "") + (mode === "visual" ? "-extracted.pdf" : "-split.pdf")
    : "split.pdf";
  const isZipDownload = mode === "visual" ? false : false;

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract specific pages or split every page into a separate PDF. Visual page selector included."
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
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✂️</div>
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop a PDF file here or click to browse</p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Select pages visually or by range</p>
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
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⏳</div>
              <p>Loading page thumbnails...</p>
            </div>
          ) : (
            <>
              {/* Mode tabs */}
              <div style={{ display: "flex", gap: "0", marginBottom: "1rem", borderRadius: "0.5rem", overflow: "hidden", border: "1px solid var(--card-border)" }}>
                {(["visual", "range"] as const).map((m) => (
                  <button key={m} onClick={() => { setMode(m); setResultUrl(null); }}
                    style={{
                      flex: 1, padding: "0.6rem", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem",
                      background: mode === m ? "var(--primary)" : "var(--card-bg)",
                      color: mode === m ? "#fff" : "var(--foreground)", transition: "all 0.15s",
                    }}>
                    {m === "visual" ? "🖼 Visual Select" : "🔢 Page Range"}
                  </button>
                ))}
              </div>

              {mode === "visual" ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                      Click pages to select · {selectedCount} of {pages.length} selected
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={selectAll} className="btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}>Select All</button>
                      <button onClick={deselectAll} className="btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}>Deselect All</button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    {pages.map((page, i) => (
                      <div key={i} onClick={() => togglePage(i)}
                        style={{
                          cursor: "pointer", borderRadius: "0.5rem", overflow: "hidden",
                          border: page.selected ? "3px solid var(--primary)" : "2px solid var(--card-border)",
                          background: page.selected ? "rgba(37,99,235,0.06)" : "var(--card-bg)",
                          transition: "all 0.15s", position: "relative",
                        }}>
                        {page.selected && (
                          <div style={{
                            position: "absolute", top: "4px", right: "4px", width: "20px", height: "20px",
                            background: "var(--primary)", borderRadius: "50%", display: "flex",
                            alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.65rem", fontWeight: 700, zIndex: 1,
                          }}>✓</div>
                        )}
                        <div style={{ width: "100%", aspectRatio: "3/4", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8f8" }}>
                          {page.thumbnailUrl ? (
                            <img src={page.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                          ) : (
                            <span style={{ color: "var(--muted)" }}>📄</span>
                          )}
                        </div>
                        <div style={{ textAlign: "center", padding: "0.3rem", fontSize: "0.75rem", fontWeight: 600, color: page.selected ? "var(--primary)" : "var(--muted)" }}>
                          Page {page.pageNum}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button onClick={extractPages} disabled={processing || selectedCount === 0} className="btn-primary"
                      style={{ flex: 1, padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}>
                      {processing ? "Extracting..." : `Extract ${selectedCount} Page${selectedCount !== 1 ? "s" : ""}`}
                    </button>
                    <button onClick={splitAll} disabled={processing} className="btn-secondary"
                      style={{ padding: "0.85rem 1.5rem", fontSize: "0.9rem", fontWeight: 600 }}>
                      Split All Pages (ZIP)
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                      Enter page numbers or ranges
                    </label>
                    <input type="text" value={rangeInput} onChange={(e) => { setRangeInput(e.target.value); setResultUrl(null); }}
                      placeholder="e.g. 1-3, 5, 7-10" className="input"
                      style={{ width: "100%", padding: "0.75rem", fontSize: "1rem", borderRadius: "0.5rem", border: "1px solid var(--card-border)", background: "var(--card-bg)" }}
                    />
                    <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.4rem" }}>
                      Separate ranges with commas. Total pages: {pages.length}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button onClick={extractPages} disabled={processing || !rangeInput.trim()} className="btn-primary"
                      style={{ flex: 1, padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}>
                      {processing ? "Extracting..." : "Extract Pages"}
                    </button>
                    <button onClick={splitAll} disabled={processing} className="btn-secondary"
                      style={{ padding: "0.85rem 1.5rem", fontSize: "0.9rem", fontWeight: 600 }}>
                      Split All Pages (ZIP)
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {resultUrl && (
        <div style={{ marginTop: "1.5rem", padding: "1.5rem", textAlign: "center", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.75rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "1rem", color: "#22c55e", fontSize: "1.1rem" }}>✓ Pages extracted successfully!</p>
          <a href={resultUrl} download={downloadName.includes("split") && mode !== "range" ? file!.name.replace(/\.pdf$/i, "") + "-pages.zip" : downloadName}
            className="btn-primary"
            style={{ padding: "0.75rem 2rem", fontSize: "1rem", textDecoration: "none", display: "inline-block" }}>
            Download
          </a>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Split PDF Files Online
        </h2>
        <p>
          Upload your PDF and visually select which pages to extract. Click individual pages in the
          thumbnail grid, or use the range input for precise control (e.g. &quot;1-3, 5, 7-10&quot;).
          Use &quot;Split All Pages&quot; to get every page as a separate PDF in a ZIP file. All processing
          happens locally in your browser — your files are never uploaded to any server.
        </p>
      </section>
    </ToolLayout>
  );
}
