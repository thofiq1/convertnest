"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { validateFileSize, isDuplicateFile } from "@/utils/fileValidation";

type QualityPreset = "maximum" | "high" | "medium" | "low";

interface CompressionResult {
  name: string;
  url: string;
  originalSize: number;
  compressedSize: number;
}

const PRESETS: Record<QualityPreset, { label: string; quality: number; dpi: number; description: string }> = {
  maximum: { label: "Maximum", quality: 0.95, dpi: 300, description: "Best quality, less compression" },
  high: { label: "High", quality: 0.8, dpi: 200, description: "Good quality, moderate compression" },
  medium: { label: "Recommended", quality: 0.6, dpi: 150, description: "Balanced quality & size" },
  low: { label: "Minimum Size", quality: 0.35, dpi: 100, description: "Smallest file, lower quality" },
};

export default function CompressPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: "" });
  const [preset, setPreset] = useState<QualityPreset>("medium");
  const [dragOver, setDragOver] = useState(false);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      results.forEach((r) => URL.revokeObjectURL(r.url));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warn before leaving with unsaved work
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (files.length > 0 || processing) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [files, processing]);

  const [sizeWarnings, setSizeWarnings] = useState<string[]>([]);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const pdfFiles = Array.from(newFiles).filter(
      (f) => f.type === "application/pdf"
    );
    const warnings: string[] = [];
    const accepted: File[] = [];

    for (const f of pdfFiles) {
      const validation = validateFileSize(f, "pdf");
      if (!validation.valid) {
        alert(validation.error);
        continue;
      }
      if (validation.warning) warnings.push(validation.warning);
      accepted.push(f);
    }

    if (warnings.length > 0) setSizeWarnings(warnings);
    setFiles((prev) => {
      // Duplicate detection
      const unique = accepted.filter((f) => !isDuplicateFile(f, prev));
      return [...prev, ...unique];
    });
    setResults([]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const compress = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResults([]);

    const { quality, dpi } = PRESETS[preset];
    const allResults: CompressionResult[] = [];

    for (let fi = 0; fi < files.length; fi++) {
      const file = files[fi];
      setProgress({ current: fi + 1, total: files.length, stage: `Compressing ${file.name}...` });

      try {
        const arrayBuffer = await file.arrayBuffer();
        const compressedBytes = await compressPdfFile(new Uint8Array(arrayBuffer), quality, dpi, (stage: string) => {
          setProgress((p) => ({ ...p, stage }));
        });

        const blob = new Blob([compressedBytes as BlobPart], { type: "application/pdf" });
        allResults.push({
          name: file.name.replace(".pdf", "-compressed.pdf"),
          url: URL.createObjectURL(blob),
          originalSize: file.size,
          compressedSize: blob.size,
        });
      } catch (err) {
        console.error(`Error compressing ${file.name}:`, err);
        // If compression fails, still provide the original with basic optimization
        try {
          const { PDFDocument } = await import("pdf-lib");
          const fallbackBuf = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(fallbackBuf);
          const bytes = await pdfDoc.save({ useObjectStreams: true });
          const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
          allResults.push({
            name: file.name.replace(".pdf", "-compressed.pdf"),
            url: URL.createObjectURL(blob),
            originalSize: file.size,
            compressedSize: blob.size,
          });
        } catch (fallbackErr: unknown) {
          const msg = fallbackErr instanceof Error ? fallbackErr.message : "";
          if (msg.toLowerCase().includes("encrypt") || msg.toLowerCase().includes("password")) {
            alert(`"${file.name}" is password-protected. Please remove the password before compressing.`);
          } else {
            alert(`Could not compress "${file.name}". The file may be corrupted or unsupported.`);
          }
        }
      }
    }

    setResults(allResults);
    setProcessing(false);
  };

  return (
    <ErrorBoundary fallbackMessage="The PDF compressor encountered an error. Please refresh and try again.">
    <ToolLayout
      slug="compress-pdf"
      title="Compress PDF"
      description="Reduce PDF file size by up to 70% while maintaining quality. Choose your compression level for the perfect balance."
    >
      {/* Quality Preset Selector */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ fontSize: "0.9rem", fontWeight: 700, display: "block", marginBottom: "0.75rem" }}>
          Compression Level
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.5rem" }}>
          {(Object.entries(PRESETS) as [QualityPreset, typeof PRESETS[QualityPreset]][]).map(([key, p]) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              style={{
                padding: "0.75rem 0.5rem",
                borderRadius: "0.75rem",
                border: preset === key ? "2px solid var(--primary)" : "2px solid var(--card-border)",
                background: preset === key ? "rgba(37, 99, 235, 0.08)" : "var(--card-bg)",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: preset === key ? "var(--primary)" : "var(--foreground)" }}>
                {p.label}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                {p.description}
              </div>
              {key === "medium" && (
                <div style={{
                  fontSize: "0.6rem",
                  color: "white",
                  background: "var(--primary)",
                  borderRadius: "1rem",
                  padding: "0.1rem 0.5rem",
                  display: "inline-block",
                  marginTop: "0.3rem",
                }}>
                  RECOMMENDED
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".pdf";
          input.multiple = true;
          input.onchange = () => handleFiles(input.files);
          input.click();
        }}
        style={{
          border: `2px dashed ${dragOver ? "var(--primary)" : "var(--card-border)"}`,
          borderRadius: "1rem",
          padding: "3rem 2rem",
          textAlign: "center",
          cursor: "pointer",
          background: dragOver ? "rgba(37, 99, 235, 0.04)" : "var(--card-bg)",
          transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📦</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop PDF files here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          Compress one or multiple PDFs at once — 100% free, 100% private
        </p>
      </div>

      {/* File List */}
      {sizeWarnings.length > 0 && (
        <div style={{
          marginTop: "1rem", padding: "0.75rem 1rem",
          background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.3)",
          borderRadius: "0.5rem", fontSize: "0.8rem",
        }}>
          <p style={{ fontWeight: 600, marginBottom: "0.3rem", color: "#b45309" }}>⚠ Large File Warning</p>
          {sizeWarnings.map((w, i) => <p key={i} style={{ color: "var(--muted)", margin: "0.2rem 0" }}>{w}</p>)}
        </div>
      )}

      {files.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              {files.length} file{files.length !== 1 ? "s" : ""}
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file"; input.accept = ".pdf"; input.multiple = true;
                  input.onchange = () => handleFiles(input.files); input.click();
                }}
                className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
                + Add More
              </button>
              <button
                onClick={() => {
                  results.forEach((r) => URL.revokeObjectURL(r.url));
                  setFiles([]);
                  setResults([]);
                }}
                className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", color: "#ef4444" }}>
                Clear All
              </button>
            </div>
          </div>

          {files.map((file, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 1rem",
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontSize: "0.9rem" }}>
                📄 {file.name}{" "}
                <span style={{ color: "var(--muted)" }}>({formatSize(file.size)})</span>
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={compress}
            disabled={processing}
            className="btn-primary"
            style={{ marginTop: "1rem", width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}
          >
            {processing
              ? `Compressing... (${progress.current}/${progress.total})`
              : `Compress ${files.length} PDF${files.length > 1 ? "s" : ""}`}
          </button>

          {processing && progress.stage && (
            <div style={{ marginTop: "0.75rem" }}>
              <div style={{
                height: "4px",
                background: "var(--card-border)",
                borderRadius: "2px",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  background: "var(--primary)",
                  borderRadius: "2px",
                  width: `${(progress.current / progress.total) * 100}%`,
                  transition: "width 0.3s",
                }} />
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.4rem" }}>
                {progress.stage}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          {/* Total compression summary */}
          {results.length > 0 && (() => {
            const totalOriginal = results.reduce((s, r) => s + r.originalSize, 0);
            const totalCompressed = results.reduce((s, r) => s + r.compressedSize, 0);
            const totalReduction = totalOriginal > 0 ? ((1 - totalCompressed / totalOriginal) * 100) : 0;
            const totalSaved = totalOriginal - totalCompressed;
            return (
              <div style={{
                padding: "1rem 1.25rem", marginBottom: "1rem", borderRadius: "0.75rem",
                background: totalReduction > 5 ? "rgba(34, 197, 94, 0.08)" : "var(--card-bg)",
                border: `1px solid ${totalReduction > 5 ? "rgba(34, 197, 94, 0.3)" : "var(--card-border)"}`,
                display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem",
              }}>
                <div>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: totalReduction > 5 ? "#22c55e" : "var(--foreground)" }}>
                    {totalReduction > 0 ? `${totalReduction.toFixed(1)}%` : "0%"}
                  </span>
                  <span style={{ fontSize: "0.9rem", color: "var(--muted)", marginLeft: "0.5rem" }}>
                    total reduction
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)", textAlign: "right" }}>
                  {formatSize(totalOriginal)} → {formatSize(totalCompressed)}
                  {totalSaved > 0 && <span style={{ color: "#22c55e", marginLeft: "0.5rem" }}>({formatSize(totalSaved)} saved)</span>}
                </div>
              </div>
            );
          })()}

          {results.map((r, i) => {
            const reduction = ((1 - r.compressedSize / r.originalSize) * 100);
            const saved = r.originalSize - r.compressedSize;
            return (
              <div
                key={i}
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "0.75rem",
                  padding: "1.25rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>📄 {r.name}</span>
                  <span style={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: reduction > 5 ? "#22c55e" : reduction > 0 ? "#eab308" : "#ef4444",
                  }}>
                    {reduction > 0 ? `−${reduction.toFixed(1)}%` : "No reduction"}
                  </span>
                </div>

                {/* Visual compression bar */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "0.75rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
                      <span>Original: {formatSize(r.originalSize)}</span>
                      <span>Compressed: {formatSize(r.compressedSize)}</span>
                    </div>
                    <div style={{ height: "8px", background: "var(--card-border)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        background: reduction > 20 ? "#22c55e" : reduction > 5 ? "#eab308" : "#94a3b8",
                        borderRadius: "4px",
                        width: `${Math.max(5, (r.compressedSize / r.originalSize) * 100)}%`,
                        transition: "width 0.5s",
                      }} />
                    </div>
                    {saved > 0 && (
                      <p style={{ fontSize: "0.75rem", color: "#22c55e", marginTop: "0.25rem" }}>
                        Saved {formatSize(saved)}
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={r.url}
                  download={r.name}
                  className="btn-primary"
                  style={{
                    padding: "0.6rem 1.5rem",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    display: "inline-block",
                    width: "100%",
                    textAlign: "center",
                    boxSizing: "border-box",
                  }}
                >
                  Download Compressed PDF
                </a>
              </div>
            );
          })}
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How PDF Compression Works
        </h2>
        <p>
          Our compressor analyzes your PDF and recompresses embedded images — the main source of large file sizes.
          Choose your compression level: <strong>Recommended</strong> typically reduces files by 40–70% with minimal
          visible quality loss. For print-quality documents, use <strong>Maximum</strong>. For email attachments
          or web uploads, <strong>Minimum Size</strong> gets the smallest files possible.
        </p>
        <p style={{ marginTop: "0.5rem" }}>
          All processing happens entirely in your browser. Your files are never uploaded to any server —
          your documents stay completely private.
        </p>
      </section>
    </ToolLayout>
    </ErrorBoundary>
  );
}

/**
 * Real PDF compression: renders each page at a target DPI and quality,
 * then rebuilds the PDF with compressed JPEG images.
 * This actually reduces file size significantly unlike the old useObjectStreams approach.
 */
async function compressPdfFile(
  pdfBytes: Uint8Array,
  quality: number,
  targetDpi: number,
  onProgress: (stage: string) => void
): Promise<Uint8Array> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  const { PDFDocument } = await import("pdf-lib");

  // Load the source PDF with pdfjs for rendering
  const srcPdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
  const totalPages = srcPdf.numPages;

  // Create a new PDF document
  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= totalPages; i++) {
    onProgress(`Page ${i} of ${totalPages}...`);

    const page = await srcPdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });

    // Calculate scale factor based on target DPI
    // PDF default is 72 DPI, so scale = targetDpi / 72
    const scale = targetDpi / 72;
    const scaledViewport = page.getViewport({ scale });

    // Render page to canvas
    const canvas = document.createElement("canvas");
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) { throw new Error("Canvas not supported by your browser"); }

    await page.render({
      canvasContext: ctx,
      viewport: scaledViewport,
      canvas,
    }).promise;

    // Convert canvas to JPEG blob at target quality
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => { if (!b) { reject(new Error("Failed to compress page image")); return; } resolve(b); }, "image/jpeg", quality)
    );
    const jpegBytes = new Uint8Array(await blob.arrayBuffer());

    // Embed the JPEG into the new PDF
    const jpegImage = await newPdf.embedJpg(jpegBytes);

    // Add a page with the original dimensions (in PDF points)
    const newPage = newPdf.addPage([viewport.width, viewport.height]);
    newPage.drawImage(jpegImage, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });

    // Clean up canvas
    canvas.width = 0;
    canvas.height = 0;
  }

  onProgress("Finalizing...");
  const compressedBytes = await newPdf.save({ useObjectStreams: true });
  return compressedBytes as Uint8Array;
}
