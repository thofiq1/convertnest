"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function CompressPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<
    { name: string; originalSize: number; compressedSize: number; url: string }[]
  >([]);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const pdfFiles = Array.from(newFiles).filter(
      (f) => f.type === "application/pdf"
    );
    setFiles((prev) => [...prev, ...pdfFiles]);
    setResults([]);
  }, []);

  const compress = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResults([]);

    try {
      const { PDFDocument } = await import("pdf-lib");

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        // Re-serialize the PDF — this strips unused objects and can reduce size
        const compressedBytes = await pdfDoc.save({
          useObjectStreams: true,
          addDefaultPage: false,
        });

        const blob = new Blob([compressedBytes as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        setResults((prev) => [
          ...prev,
          {
            name: file.name,
            originalSize: file.size,
            compressedSize: compressedBytes.length,
            url,
          },
        ]);
      }
    } catch (err) {
      console.error("Compression error:", err);
      alert("Error compressing PDF. Please try again with a different file.");
    }

    setProcessing(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduce PDF file size online for free. Upload your PDF and get a smaller file — no quality loss, no watermarks."
    >
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
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
          background: dragOver ? "var(--accent)" : "var(--card-bg)",
          transition: "all 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📦</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>
          Drop PDF files here or click to browse
        </p>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          Select one or more PDF files to compress
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
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
                <span style={{ color: "var(--muted)" }}>
                  ({formatSize(file.size)})
                </span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={compress}
            disabled={processing}
            className="btn-primary"
            style={{
              marginTop: "1rem",
              width: "100%",
              padding: "0.75rem",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {processing ? "Compressing..." : `Compress PDF${files.length > 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
            Compressed Files
          </h3>
          {results.map((r, i) => {
            const reduction = ((1 - r.compressedSize / r.originalSize) * 100).toFixed(1);
            return (
              <div
                key={i}
                className="result-box"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                <div>
                  <p style={{ fontWeight: 600 }}>{r.name}</p>
                  <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {formatSize(r.originalSize)} → {formatSize(r.compressedSize)}{" "}
                    <span style={{ color: Number(reduction) > 0 ? "#22c55e" : "var(--muted)" }}>
                      ({Number(reduction) > 0 ? `-${reduction}%` : "no change"})
                    </span>
                  </p>
                </div>
                <a
                  href={r.url}
                  download={r.name.replace(".pdf", "-compressed.pdf")}
                  className="btn-primary"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", textDecoration: "none" }}
                >
                  Download
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* SEO content */}
      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Compress a PDF Online
        </h2>
        <p>
          Upload your PDF file, click compress, and download the smaller version. Our PDF compressor
          works entirely in your browser — your files are never uploaded to any server. This means
          maximum privacy and instant processing, no matter the file size.
        </p>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--foreground)", marginTop: "1rem" }}>
          Why Compress PDF Files?
        </h3>
        <p>
          Large PDF files are hard to email, slow to upload, and take up too much storage.
          Compressing a PDF reduces its file size so you can share it easily via email, messaging apps,
          or upload it to websites with file size limits.
        </p>
      </section>
    </ToolLayout>
  );
}
