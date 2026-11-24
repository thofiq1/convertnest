"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { validateFileSize, formatFileSize } from "@/utils/fileValidation";

export default function PDFProtect() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  // Password settings
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Permissions
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);

  // Validation
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const loadPageCount = useCallback(async (pdfFile: File) => {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);
    } catch (err: unknown) {
      console.error("Error loading PDF:", err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("encrypt") || msg.toLowerCase().includes("password")) {
        alert("This PDF is already password-protected.");
        setFile(null);
      } else {
        alert("Error loading PDF. Please try another file.");
        setFile(null);
      }
    }
  }, []);

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
    if (f.type !== "application/pdf") return;
    const validation = validateFileSize(f, "pdf");
    if (!validation.valid) { alert(validation.error); return; }
    if (validation.warning) alert(validation.warning);
    setFile(f);
    setResultUrl(null);
    setPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    loadPageCount(f);
  }, [loadPageCount]);

  const validatePasswords = (): boolean => {
    if (!password) {
      setPasswordError("Please enter a password.");
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const protectPdf = async () => {
    if (!file) return;
    if (!validatePasswords()) return;
    // TEMPORARILY DISABLED: pdf-lib 1.17.1 has no encryption support — its save()
    // silently ignores userPassword/ownerPassword, so the output was an UNENCRYPTED
    // PDF presented to users as protected. Do not re-enable until encryption is done
    // with a library that really supports it (e.g. @cantoo/pdf-lib's doc.encrypt())
    // and the output is verified to refuse opening without the password.
    void allowPrinting;
    void allowCopying;
    setResultUrl(null);
    alert(
      "Password protection is temporarily unavailable while we upgrade our encryption engine. " +
      "We won't give you a file that only looks protected. Please check back soon."
    );
  };

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadName = file ? file.name.replace(/\.pdf$/i, "") + "-protected.pdf" : "protected.pdf";
  const canSubmit = password.length > 0 && password === confirmPassword;

  return (
    <ToolLayout
      slug="pdf-protect"
      title="Protect PDF with Password"
      description="Add password protection to your PDF files. Set user and owner passwords with permission controls. Free online tool."
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
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>&#x1F512;</div>
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Drop a PDF file here or click to browse</p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Encrypt your PDF with a password</p>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{file.name}</span>
              <span style={{ color: "var(--muted)", fontSize: "0.85rem", marginLeft: "0.5rem" }}>
                ({pageCount} page{pageCount !== 1 ? "s" : ""} &middot; {formatFileSize(file.size)})
              </span>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setResultUrl(null); setPassword(""); setConfirmPassword(""); setPasswordError(null); }}
              className="btn-secondary" style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
              Change File
            </button>
          </div>

          {/* Password & Settings */}
          <div style={{
            background: "var(--card-bg)", border: "1px solid var(--card-border)",
            borderRadius: "1rem", padding: "1.5rem", marginBottom: "1.5rem",
          }}>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.25rem" }}>Password Protection</div>

            {/* Password input */}
            <label style={{ display: "block", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Password</span>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(null); setResultUrl(null); }}
                  placeholder="Enter password"
                  style={{
                    width: "100%", padding: "0.6rem 2.5rem 0.6rem 0.75rem", border: `1px solid ${passwordError ? "#ef4444" : "var(--card-border)"}`,
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

            {/* Confirm password */}
            <label style={{ display: "block", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Confirm Password</span>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(null); setResultUrl(null); }}
                  placeholder="Confirm password"
                  style={{
                    width: "100%", padding: "0.6rem 2.5rem 0.6rem 0.75rem", border: `1px solid ${passwordError ? "#ef4444" : "var(--card-border)"}`,
                    borderRadius: "0.5rem", fontSize: "0.9rem", background: "var(--background)",
                    color: "var(--foreground)", boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: "4px",
                    fontSize: "0.8rem", color: "var(--muted)",
                  }}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {passwordError && (
              <p style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "0.75rem", fontWeight: 500 }}>{passwordError}</p>
            )}

            {/* Password match indicator */}
            {password && confirmPassword && (
              <p style={{
                fontSize: "0.8rem", marginBottom: "0.75rem", fontWeight: 500,
                color: password === confirmPassword ? "#22c55e" : "#ef4444",
              }}>
                {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
              </p>
            )}

            {/* Permissions */}
            <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "1rem", marginTop: "0.5rem" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.75rem" }}>Permissions</div>

              <label style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                cursor: "pointer", fontSize: "0.85rem", marginBottom: "0.5rem",
              }}>
                <input type="checkbox" checked={allowPrinting}
                  onChange={(e) => { setAllowPrinting(e.target.checked); setResultUrl(null); }}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <span style={{ fontWeight: 500 }}>Allow printing</span>
              </label>

              <label style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                cursor: "pointer", fontSize: "0.85rem",
              }}>
                <input type="checkbox" checked={allowCopying}
                  onChange={(e) => { setAllowCopying(e.target.checked); setResultUrl(null); }}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <span style={{ fontWeight: 500 }}>Allow copying text</span>
              </label>
            </div>
          </div>

          <button onClick={protectPdf} disabled={processing || !canSubmit} className="btn-primary"
            style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700 }}>
            {processing ? "Encrypting PDF..." : "Protect PDF"}
          </button>

          {!canSubmit && password.length > 0 && (
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
              Please confirm your password to proceed
            </p>
          )}
        </div>
      )}

      {resultUrl && (
        <div style={{ marginTop: "1.5rem", padding: "1.5rem", textAlign: "center", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.75rem" }}>
          <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#22c55e", fontSize: "1.1rem" }}>&#x2713; PDF protected successfully!</p>
          <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: "1rem" }}>
            Your PDF is now password-protected. Remember your password &mdash; it cannot be recovered.
          </p>
          <a href={resultUrl} download={downloadName} className="btn-primary"
            style={{ padding: "0.75rem 2rem", fontSize: "1rem", textDecoration: "none", display: "inline-block", background: "#22c55e", borderColor: "#22c55e" }}>
            Download Protected PDF
          </a>
        </div>
      )}

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Password Protect a PDF Online
        </h2>
        <p>
          Upload your PDF and set a password to protect it. You can control permissions like printing
          and text copying. The password will be required to open the PDF in any viewer. All encryption
          happens locally in your browser &mdash; your files and passwords are never sent to any server,
          keeping your documents completely private and secure.
        </p>
      </section>
    </ToolLayout>
  );
}
