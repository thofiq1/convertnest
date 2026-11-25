"use client";

import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";

// TEMPORARILY DISABLED: pdf-lib 1.17.1 has no encryption support — its save()
// silently ignores userPassword/ownerPassword, so the output was an UNENCRYPTED
// PDF presented to users as protected. Do not re-enable until encryption is done
// with a library that really supports it (e.g. @cantoo/pdf-lib's doc.encrypt())
// and the output is verified to refuse opening without the password.
// Until then the page shows a notice up front instead of an upload form.
export default function PDFProtect() {
  return (
    <ToolLayout
      slug="pdf-protect"
      title="Protect PDF with Password"
      description="PDF password protection is temporarily unavailable on FitTheFile. See the note below for what you can use instead."
    >
      <div
        role="status"
        style={{
          border: "1px solid rgba(234,179,8,0.35)", background: "rgba(234,179,8,0.08)",
          borderRadius: "1rem", padding: "2rem 1.75rem", textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>&#x1F512;</div>
        <p style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Password protection is temporarily unavailable
        </p>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6, maxWidth: "36rem", margin: "0 auto" }}>
          We&apos;re upgrading our encryption engine and won&apos;t give you a file that only looks protected.
          Meanwhile, you can password-protect a PDF for free with Preview on Mac or Microsoft Word &mdash;{" "}
          <Link href="/blog/how-to-password-protect-pdf-free" style={{ color: "var(--primary)", fontWeight: 600 }}>
            see our step-by-step guide
          </Link>.
        </p>
      </div>

      <section style={{ marginTop: "3rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>
          How to Password Protect a PDF
        </h2>
        <p>
          A properly protected PDF asks for its password before it opens in any viewer. While this tool is
          offline, the free apps already on your computer can do it: Preview on a Mac and Microsoft Word on
          Windows can both save a PDF with a password. Our{" "}
          <Link href="/blog/how-to-password-protect-pdf-free" style={{ color: "var(--primary)" }}>
            guide to password-protecting a PDF for free
          </Link>{" "}
          walks through each option.
        </p>
      </section>
    </ToolLayout>
  );
}
