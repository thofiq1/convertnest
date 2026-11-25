"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { validateFileSize, formatFileSize } from "@/utils/fileValidation";

function PdfUnlockTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  // Encrypted with only an owner (permissions) password: opens without a password, just has restrictions
  const [ownerOnly, setOwnerOnly] = useState(false);
  const [rasterised, setRasterised] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (file || processing) { e.preventDefault(); }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [file, processing]);

  const checkEncryption = useCallback(async (pdfFile: File) => {
    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await pdfFile.arrayBuffer();
      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPageCount(pdfDoc.getPageCount());
        setIsEncrypted(false);
        setError("This PDF is not password-protected. No unlocking needed.");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.toLowerCase().includes("encrypt") || msg.toLowerCase().includes("password")) {
          setIsEncrypted(true);
          setError(null);
          // Try to get page count with pdfjs-dist (which can handle encrypted PDFs with empty password)
          try {
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
            const pdf = await pdfjsLib.getDocument({ data: await pdfFile.arrayBuffer() }).promise;
            setPageCount(pdf.numPages);
            setOwnerOnly(true);
          } catch {
            setPageCount(0);
            setOwnerOnly(false);
          }
        } else {
          setError("Error loading PDF. Please try another file.");
          setIsEncrypted(false);
        }
      }
    } catch {
      setError("Error reading file. Please try again.");
    }
  }, []);

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
    setResultUrl(null);
    setPassword("");
    setError(null);
    setIsEncrypted(false);
    setOwnerOnly(false);
    setPageCount(0);
    checkEncryption(f);
  }, [checkEncryption]);

  const unlockPdf = async () => {
    if (!file || (!password && !ownerOnly)) return;
    setProcessing(true);
    setResultUrl(null);
    setError(null);
    try {
      // Step 1: Open encrypted PDF with pdfjs-dist using the password
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const arrayBuffer = await file.arrayBuffer();

      let pdfJsDoc;
      try {
        pdfJsDoc = await pdfjsLib.getDocument(
          ownerOnly && !password ? { data: arrayBuffer } : { data: arrayBuffer, password }
        ).promise;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.toLowerCase().includes("incorrect") || msg.toLowerCase().includes("password") || msg.toLowerCase().includes("invalid")) {
          setError("Incorrect password. Please try again.");
        } else {
          setError("Could not open PDF with this password. Please check and try again.");
        }
        setProcessing(false);
        return;
      }

      // Step 2: Write a real unlocked copy — text stays selectable and the file stays small.
      try {
        const { unencryptedCopy } = await import("@/lib/pdfOpen");
        const clean = await unencryptedCopy(pdfJsDoc as unknown as Parameters<typeof unencryptedCopy>[0]);
        const cleanBlob = new Blob([clean as BlobPart], { type: "application/pdf" });
        setRasterised(false);
        setResultUrl(URL.createObjectURL(cleanBlob));
        setPageCount(pdfJsDoc.numPages);
        setProcessing(false);
        return;
      } catch (e) {
        console.warn("Direct unlock failed, falling back to page images:", e);
      }

      // Fallback: render each page to a canvas and build a new PDF with pdf-lib
      const { PDFDocument } = await import("pdf-lib");
      const newPdf = await PDFDocument.create();
      const numPages = pdfJsDoc.numPages;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfJsDoc.getPage(i);
        // Cap each page at ~16 megapixels so very large pages still render.
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: Math.min(2, Math.sqrt(16_000_000 / Math.max(1, base.width * base.height))) });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({ canvas, canvasContext: ctx, viewport }).promise;

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95)
        );
        const imgBytes = new Uint8Array(await blob.arrayBuffer());
        const img = await newPdf.embedJpg(imgBytes);

        // Use original page dimensions (in points, at scale 1)
        const origViewport = page.getViewport({ scale: 1 });
        const newPage = newPdf.addPage([origViewport.width, origViewport.height]);
        newPage.drawImage(img, {
          x: 0,
          y: 0,
          width: origViewport.width,
          height: origViewport.height,
        });
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      setRasterised(true);
      setResultUrl(URL.createObjectURL(blob));
      setPageCount(numPages);
    } catch (err: unknown) {
      console.error("Unlock error:", err);
      setError("Error unlocking PDF. Please try again.");
    }
    setProcessing(false);
  };

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadName = file ? file.name.replace(/\.pdf$/i, "") + "-unlocked.pdf" : "unlocked.pdf";

  return (
    <ToolLayout
      slug="pdf-unlock"
      title="Unlock PDF — Remove Password"
      description="Remove password protection from PDF files. Enter the password you know and download an unlocked copy. Free online tool."
      faqs={[
        { question: "Can this tool remove a password I don't know?", answer: "No. It is not a password cracker. You must enter the correct password to open and unlock the file." },
        { question: "Will the unlocked PDF look the same?", answer: "Yes. The unlocked copy keeps the original pages, so text stays selectable and searchable and the quality is unchanged. For a few unusual files the tool falls back to redrawing each page as an image; those look the same but their text can't be selected." },
        { question: "Is my password sent anywhere?", answer: "No. The PDF is opened and rebuilt in your browser, and the password is only used there." },
        { question: "What can I do after unlocking?", answer: "You can merge, split, rotate or add page numbers to the unlocked copy, since those tools can't open password-protected PDFs." },
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
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>&#x1F513;</div>
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop a password-protected PDF here or click to browse</p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>You must know the password to unlock the file</p>
          {fileError && <p role="alert" style={{ color: "#dc2626", fontSize: "0.85rem", marginTop: "0.75rem", fontWeight: 600 }}>{fileError}</p>}
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{file.name}</span>
              <span style={{ color: "var(--muted)", fontSize: "0.85rem", marginLeft: "0.5rem" }}>
                ({formatFileSize(file.size)}{pageCount > 0 ? ` · ${pageCount} page${pageCount !== 1 ? "s" : ""}` : ""})
              </span>
            </div>
            <button
              onClick={() => { setFile(null); setPageCount(0); setResultUrl(null); setPassword(""); setError(null); setIsEncrypted(false); setOwnerOnly(false); }}
              className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
            >
              Change File
            </button>
          </div>

          {/* Encryption status */}
          {isEncrypted && !ownerOnly && (
            <div style={{
              padding: "0.75rem 1rem", marginBottom: "1.5rem", borderRadius: "0.5rem",
              background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.2)",
              fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem",
            }}>
              <span>&#x1F512;</span>
              <span>This PDF is password-protected. Enter the password below to unlock it.</span>
            </div>
          )}

          {error && !isEncrypted && (
            <div style={{
              padding: "0.75rem 1rem", marginBottom: "1.5rem", borderRadius: "0.5rem",
              background: "rgba(234, 179, 8, 0.06)", border: "1px solid rgba(234, 179, 8, 0.2)",
              fontSize: "0.85rem", color: "var(--foreground)",
            }}>
              {error}
            </div>
          )}

          {isEncrypted && ownerOnly && (
            <>
              <div style={{
                padding: "0.75rem 1rem", marginBottom: "1.5rem", borderRadius: "0.5rem",
                background: "rgba(234, 179, 8, 0.06)", border: "1px solid rgba(234, 179, 8, 0.2)",
                fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem",
              }}>
                <span>&#x1F512;</span>
                <span>This PDF opens without a password but has restrictions (such as printing, copying or editing). You can remove them without a password.</span>
              </div>
              {error && (
                <p style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "1rem", fontWeight: 500 }}>{error}</p>
              )}
              <button
                onClick={unlockPdf}
                disabled={processing}
                className="btn-primary"
                style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}
              >
                {processing ? "Removing restrictions..." : "Remove Restrictions"}
              </button>
            </>
          )}

          {isEncrypted && !ownerOnly && (
            <>
              {/* Password input */}
              <div style={{
                background: "var(--card-bg)", border: "1px solid var(--card-border)",
                borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.5rem",
              }}>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.25rem" }}>Enter PDF Password</div>

                <label style={{ display: "block", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Password</span>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(null); setResultUrl(null); }}
                      placeholder="Enter the PDF password"
                      onKeyDown={(e) => { if (e.key === "Enter" && password) unlockPdf(); }}
                      style={{
                        width: "100%", padding: "0.6rem 2.5rem 0.6rem 0.75rem",
                        border: `1px solid ${error && isEncrypted ? "#ef4444" : "var(--card-border)"}`,
                        borderRadius: "0.5rem", fontSize: "0.9rem", background: "var(--background)",
                        color: "var(--foreground)", boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer", padding: "4px",
                        fontSize: "0.8rem", color: "var(--muted)",
                      }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>

                {error && isEncrypted && (
                  <p style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "0", fontWeight: 500 }}>{error}</p>
                )}
              </div>

              <button
                onClick={unlockPdf}
                disabled={processing || !password}
                className="btn-primary"
                style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}
              >
                {processing ? "Unlocking PDF..." : "Unlock PDF"}
              </button>
            </>
          )}
        </div>
      )}

      {resultUrl && (
        <div style={{ marginTop: "1.5rem", padding: "1.5rem", textAlign: "center", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.75rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#22c55e", fontSize: "1.1rem" }}>&#x2713; PDF unlocked successfully!</p>
          <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "1rem" }}>
            Your PDF is now unlocked and password-free. {pageCount > 0 ? `${pageCount} page${pageCount !== 1 ? "s" : ""} processed.` : ""}
          </p>
          <a href={resultUrl} download={downloadName} className="btn-primary"
            style={{ padding: "0.75rem 2rem", fontSize: "1rem", textDecoration: "none", display: "inline-block", background: "#22c55e", borderColor: "#22c55e" }}>
            Download Unlocked PDF
          </a>
          <p style={{ color: "var(--muted)", fontSize: "0.75rem", marginTop: "0.75rem" }}>
            {rasterised
              ? "Note: this file couldn't be unlocked directly, so each page was redrawn as an image. It looks the same, but the text can't be selected."
              : "The password and restrictions are removed. Text stays selectable and the quality is unchanged."}
          </p>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Remove Password from a PDF Online
        </h2>
        <p>
          Upload your password-protected PDF and enter the password you already know. This tool will decrypt
          the file and let you download an unlocked copy that opens without a password. This is not a
          password cracker &mdash; you must know the password to use this tool. All processing happens
          locally in your browser. Your files and passwords are never sent to any server.
        </p>
      </section>
    </ToolLayout>
  );
}

export default function PdfUnlockPage() {
  return (
    <ErrorBoundary fallbackMessage="Something went wrong with the PDF unlocker. Please refresh and try again.">
      <PdfUnlockTool />
    </ErrorBoundary>
  );
}
