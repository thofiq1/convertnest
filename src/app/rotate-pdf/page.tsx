"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { validateFileSize } from "@/utils/fileValidation";

interface PageInfo {
  pageNum: number;
  thumbnailUrl: string | null;
  rotation: number; // 0, 90, 180, 270
}

export default function RotatePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const loadPages = useCallback(async (pdfFile: File) => {
    setLoading(true);
    setPages([]);
    setResultUrl(null);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageInfos: PageInfo[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.25 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const url = canvas.toDataURL("image/jpeg", 0.6);
        canvas.width = 0;
        canvas.height = 0;
        pageInfos.push({ pageNum: i, thumbnailUrl: url, rotation: 0 });
      }
      setPages(pageInfos);
    } catch (err: unknown) {
      console.error("Error loading PDF:", err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("encrypt") || msg.toLowerCase().includes("password")) {
        alert("This PDF is locked (it has a password or editing restrictions). Unlock it first with the PDF Unlock tool, then try again.");
      } else {
        alert("Error loading PDF. Please try another file.");
      }
      // Go back to the upload box instead of leaving an empty editor behind.
      setFile(null);
    }
    setLoading(false);
  }, []);

  // Warn before leaving with unsaved work
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
    if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) {
      setFileError(`${f.name} isn't a PDF. Please choose a PDF file.`);
      return;
    }
    setFileError(null);
    const validation = validateFileSize(f, "pdf");
    if (!validation.valid) { alert(validation.error); return; }
    if (validation.warning) alert(validation.warning);
    setFile(f);
    loadPages(f);
  }, [loadPages]);

  const rotatePage = (index: number, direction: "cw" | "ccw") => {
    setPages((prev) => prev.map((p, i) => {
      if (i !== index) return p;
      const delta = direction === "cw" ? 90 : -90;
      return { ...p, rotation: ((p.rotation + delta) % 360 + 360) % 360 };
    }));
    setResultUrl(null);
  };

  const rotateAll = (direction: "cw" | "ccw") => {
    const delta = direction === "cw" ? 90 : -90;
    setPages((prev) => prev.map((p) => ({
      ...p, rotation: ((p.rotation + delta) % 360 + 360) % 360,
    })));
    setResultUrl(null);
  };

  const resetAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, rotation: 0 })));
    setResultUrl(null);
  };

  const applyRotation = async () => {
    if (!file) return;
    setProcessing(true);
    setResultUrl(null);
    try {
      const { PDFDocument, degrees } = await import("pdf-lib");
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pdfPages = pdfDoc.getPages();

      for (let i = 0; i < pdfPages.length && i < pages.length; i++) {
        if (pages[i].rotation !== 0) {
          const currentRotation = pdfPages[i].getRotation().angle;
          pdfPages[i].setRotation(degrees((((currentRotation + pages[i].rotation) % 360) + 360) % 360));
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      console.error("Rotation error:", err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("encrypt") || msg.toLowerCase().includes("password")) {
        alert("This PDF is locked (it has a password or editing restrictions). Unlock it first with the PDF Unlock tool, then try again.");
      } else {
        alert("Error rotating PDF. Please try again.");
      }
    }
    setProcessing(false);
  };

  // Cleanup result URL on unmount
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasChanges = pages.some((p) => p.rotation !== 0);
  const changedCount = pages.filter((p) => p.rotation !== 0).length;
  const downloadName = file ? file.name.replace(/\.pdf$/i, "") + "-rotated.pdf" : "rotated.pdf";

  return (
    <ToolLayout
      slug="rotate-pdf"
      title="Rotate PDF"
      description="Rotate individual pages or all pages at once. Preview rotations before applying."
      faqs={[
        { question: "Can I rotate only some pages?", answer: "Yes. Rotate any page left or right individually, or use Rotate All to turn every page at once." },
        { question: "Does rotating reduce quality?", answer: "No. The tool changes each page's rotation setting and doesn't re-render or recompress page content, so text and images stay as they were." },
        { question: "Why are my scanned pages sideways?", answer: "Scanners and phone apps sometimes save the wrong orientation. Rotate the affected pages here and download the corrected PDF." },
        { question: "Can I rotate a password-protected PDF?", answer: "Remove the password first with the Unlock PDF tool, then rotate the pages." },
      ]}
    >
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
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔄</div>
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop a PDF file here or click to browse</p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Rotate pages individually or all at once</p>
          {fileError && <p role="alert" style={{ color: "#dc2626", fontSize: "0.85rem", marginTop: "0.75rem", fontWeight: 600 }}>{fileError}</p>}
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
              {/* Rotate all controls */}
              <div style={{
                display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap",
                padding: "0.75rem", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.5rem",
              }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", marginRight: "0.5rem" }}>
                  Rotate All:
                </span>
                <button onClick={() => rotateAll("ccw")} className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
                  ↺ 90° Left
                </button>
                <button onClick={() => rotateAll("cw")} className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
                  ↻ 90° Right
                </button>
                <button onClick={resetAll} className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
                  Reset All
                </button>
                {hasChanges && (
                  <span style={{ fontSize: "0.8rem", color: "var(--primary)", display: "flex", alignItems: "center", marginLeft: "auto" }}>
                    {changedCount} page{changedCount !== 1 ? "s" : ""} modified
                  </span>
                )}
              </div>

              {/* Page grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                {pages.map((page, i) => (
                  <div key={i} style={{
                    borderRadius: "0.5rem", overflow: "hidden",
                    border: page.rotation !== 0 ? "2px solid var(--primary)" : "1px solid var(--card-border)",
                    background: "var(--card-bg)", transition: "all 0.15s",
                  }}>
                    <div style={{
                      width: "100%", aspectRatio: "3/4", overflow: "hidden",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "#f8f8f8",
                    }}>
                      {page.thumbnailUrl ? (
                        <img src={page.thumbnailUrl} alt=""
                          style={{
                            maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
                            transform: `rotate(${page.rotation}deg)`,
                            transition: "transform 0.3s ease",
                          }}
                        />
                      ) : (
                        <span style={{ color: "var(--muted)" }}>📄</span>
                      )}
                    </div>
                    <div style={{ padding: "0.4rem", textAlign: "center" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.3rem", color: page.rotation !== 0 ? "var(--primary)" : "var(--muted)" }}>
                        Page {page.pageNum}
                        {page.rotation !== 0 && <span style={{ marginLeft: "0.25rem" }}>({page.rotation}°)</span>}
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", gap: "0.3rem" }}>
                        <button onClick={() => rotatePage(i, "ccw")}
                          style={{
                            width: "28px", height: "28px", border: "1px solid var(--card-border)",
                            borderRadius: "0.25rem", background: "var(--card-bg)",
                            cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                          ↺
                        </button>
                        <button onClick={() => rotatePage(i, "cw")}
                          style={{
                            width: "28px", height: "28px", border: "1px solid var(--card-border)",
                            borderRadius: "0.25rem", background: "var(--card-bg)",
                            cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                          ↻
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={applyRotation} disabled={processing || !hasChanges} className="btn-primary"
                style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}>
                {processing ? "Applying Rotation..." : hasChanges ? `Apply Rotation to ${changedCount} Page${changedCount !== 1 ? "s" : ""}` : "No Changes to Apply"}
              </button>
            </>
          )}
        </div>
      )}

      {resultUrl && (
        <div style={{ marginTop: "1.5rem", padding: "1.5rem", textAlign: "center", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.75rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "1rem", color: "#22c55e", fontSize: "1.1rem" }}>✓ Rotation applied successfully!</p>
          <a href={resultUrl} download={downloadName} className="btn-primary"
            style={{ padding: "0.75rem 2rem", fontSize: "1rem", textDecoration: "none", display: "inline-block" }}>
            Download Rotated PDF
          </a>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Rotate PDF Pages Online
        </h2>
        <p>
          Upload your PDF and see thumbnail previews of every page. Rotate individual pages left or right,
          or use the &quot;Rotate All&quot; buttons to fix an entire document at once. The preview updates
          in real-time so you can verify your changes before downloading. All processing happens locally
          in your browser — your files stay private.
        </p>
      </section>
    </ToolLayout>
  );
}
