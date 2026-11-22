"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { validateFileSize, isDuplicateFile } from "@/utils/fileValidation";

interface PdfFileEntry {
  file: File;
  thumbnailUrl: string | null;
  pageCount: number;
}

export default function MergePDF() {
  const [entries, setEntries] = useState<PdfFileEntry[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const generateThumbnail = async (file: File): Promise<{ url: string; pages: number }> => {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return { url: "", pages: 0 };
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const url = canvas.toDataURL("image/jpeg", 0.7);
      canvas.width = 0;
      canvas.height = 0;
      return { url, pages: pdf.numPages };
    } catch {
      return { url: "", pages: 0 };
    }
  };

  // Warn before leaving with unsaved work
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (entries.length > 0 || processing) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [entries, processing]);

  const handleFiles = useCallback(async (newFiles: FileList | null) => {
    if (!newFiles) return;
    const pdfFiles = Array.from(newFiles).filter((f) => f.type === "application/pdf");
    setResultUrl(null);

    // Validate file sizes and filter duplicates
    const accepted: File[] = [];
    for (const f of pdfFiles) {
      const validation = validateFileSize(f, "pdf");
      if (!validation.valid) { alert(validation.error); continue; }
      if (validation.warning) alert(validation.warning);
      accepted.push(f);
    }

    const newEntries: PdfFileEntry[] = accepted
      .filter((f) => !isDuplicateFile(f, entries.map((e) => e.file)))
      .map((file) => ({ file, thumbnailUrl: null, pageCount: 0 }));
    setEntries((prev) => [...prev, ...newEntries]);

    const addedFiles = newEntries.map((e) => e.file);
    for (let i = 0; i < addedFiles.length; i++) {
      const { url, pages } = await generateThumbnail(addedFiles[i]);
      setEntries((prev) => {
        const updated = [...prev];
        const idx = updated.findIndex((e) => e.file === addedFiles[i]);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], thumbnailUrl: url, pageCount: pages };
        }
        return updated;
      });
    }
  }, []);

  const removeFile = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setResultUrl(null);
  };

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) setDragOverIndex(index);
  };
  const handleDrop = (index: number) => {
    if (dragIndex !== null && dragIndex !== index) {
      setEntries((prev) => {
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

  const merge = async () => {
    if (entries.length < 2) return;
    setProcessing(true);
    setResultUrl(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();
      for (const entry of entries) {
        const arrayBuffer = await entry.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes as BlobPart], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: unknown) {
      console.error("Merge error:", err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("encrypt") || msg.toLowerCase().includes("password")) {
        alert("One or more PDFs are password-protected. Please remove passwords before merging.");
      } else {
        alert("Error merging PDFs. Please check your files and try again.");
      }
    }
    setProcessing(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Cleanup result URL on unmount
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalSize = entries.reduce((sum, e) => sum + e.file.size, 0);
  const totalPages = entries.reduce((sum, e) => sum + e.pageCount, 0);
  const downloadName = entries.length > 0
    ? entries[0].file.name.replace(/\.pdf$/i, "") + "-merged.pdf"
    : "merged.pdf";

  return (
    <ErrorBoundary fallbackMessage="The PDF merger encountered an error. Please refresh and try again.">
    <ToolLayout
      title="Merge PDF"
      description="Combine multiple PDF files into one. Drag to reorder pages before merging — completely free."
    >
      <div
        onDragOver={(e) => { e.preventDefault(); if (dragIndex === null) setDragOver(true); }}
        onDragLeave={() => { if (dragIndex === null) setDragOver(false); }}
        onDrop={(e) => { e.preventDefault(); if (dragIndex === null) { setDragOver(false); handleFiles(e.dataTransfer.files); } }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file"; input.accept = ".pdf"; input.multiple = true;
          input.onchange = () => handleFiles(input.files); input.click();
        }}
        style={{
          border: `2px dashed ${dragOver ? "var(--primary)" : "var(--card-border)"}`,
          borderRadius: "1rem", padding: "3rem 2rem", textAlign: "center",
          cursor: "pointer", background: dragOver ? "rgba(37,99,235,0.04)" : "var(--card-bg)", transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📎</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop PDF files here or click to browse</p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Select two or more PDFs to combine</p>
      </div>

      {entries.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              {entries.length} file{entries.length !== 1 ? "s" : ""}
              {totalPages > 0 && ` · ${totalPages} pages`}
              {" · "}{formatSize(totalSize)} total
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const input = document.createElement("input");
                  input.type = "file"; input.accept = ".pdf"; input.multiple = true;
                  input.onchange = () => handleFiles(input.files); input.click();
                }}
                className="btn-secondary"
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
              >
                + Add More
              </button>
              <button
                onClick={() => {
                  entries.forEach((e) => { if (e.thumbnailUrl) URL.revokeObjectURL(e.thumbnailUrl); });
                  setEntries([]);
                }}
                className="btn-secondary"
                style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", color: "#ef4444" }}
              >
                Clear All
              </button>
            </div>
          </div>

          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
            Drag files to reorder. Files merge top to bottom.
          </p>

          {entries.map((entry, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={handleDragEnd}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.6rem 0.75rem",
                background: dragOverIndex === i ? "rgba(37,99,235,0.06)" : "var(--card-bg)",
                border: dragOverIndex === i ? "2px dashed var(--primary)" : "1px solid var(--card-border)",
                borderRadius: "0.5rem", marginBottom: "0.5rem",
                cursor: "grab", opacity: dragIndex === i ? 0.5 : 1, transition: "all 0.15s",
              }}
            >
              <span style={{ color: "var(--muted)", fontSize: "1rem", cursor: "grab", userSelect: "none" }}>⠿</span>
              <div style={{
                width: "40px", height: "52px", borderRadius: "0.25rem", overflow: "hidden",
                border: "1px solid var(--card-border)", background: "#f8f8f8", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {entry.thumbnailUrl ? (
                  <img src={entry.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "1.2rem" }}>📄</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {entry.file.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {formatSize(entry.file.size)}
                  {entry.pageCount > 0 && ` · ${entry.pageCount} page${entry.pageCount !== 1 ? "s" : ""}`}
                </div>
              </div>
              <span style={{
                fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", background: "var(--accent)",
                borderRadius: "50%", width: "24px", height: "24px",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>{i + 1}</span>
              <button onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.1rem", padding: "0.25rem", flexShrink: 0 }}>
                ✕
              </button>
            </div>
          ))}

          <button onClick={merge} disabled={processing || entries.length < 2} className="btn-primary"
            style={{ marginTop: "1rem", width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}>
            {processing ? "Merging..." : `Merge ${entries.length} PDFs`}
          </button>
        </div>
      )}

      {resultUrl && (
        <div style={{ marginTop: "1.5rem", padding: "1.5rem", textAlign: "center", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.75rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "1rem", color: "#22c55e", fontSize: "1.1rem" }}>✓ PDFs merged successfully!</p>
          <a href={resultUrl} download={downloadName} className="btn-primary"
            style={{ padding: "0.75rem 2rem", fontSize: "1rem", textDecoration: "none", display: "inline-block" }}>
            Download Merged PDF
          </a>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Merge PDF Files Online
        </h2>
        <p>
          Select or drag and drop the PDF files you want to combine. Drag them to reorder — files merge from
          top to bottom. Each file shows a thumbnail preview so you can verify the right documents are included.
          Click Merge and download your combined PDF. All processing happens in your browser — your files
          never leave your device.
        </p>
      </section>
    </ToolLayout>
    </ErrorBoundary>
  );
}
