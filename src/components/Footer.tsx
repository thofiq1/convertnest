"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--card-bg)",
        borderTop: "1px solid var(--card-border)",
        marginTop: "4rem",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "2.5rem 1.5rem 2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2rem",
          fontSize: "0.85rem",
        }}
      >
        {/* Brand column */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: "linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--foreground)" }}>
              Convert<span style={{ color: "var(--primary)" }}>Nest</span>
            </span>
          </div>
          <p style={{ color: "var(--muted)", lineHeight: 1.6, fontSize: "0.8rem" }}>
            Free online file converter and PDF tools.
            All processing happens in your browser — your data never leaves your device.
          </p>
        </div>

        {/* PDF Tools */}
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.85rem" }}>PDF Tools</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {[
              { href: "/compress-pdf", label: "Compress PDF" },
              { href: "/merge-pdf", label: "Merge PDF" },
              { href: "/split-pdf", label: "Split PDF" },
              { href: "/rotate-pdf", label: "Rotate PDF" },
              { href: "/pdf-to-jpg", label: "PDF to JPG" },
              { href: "/jpg-to-pdf", label: "JPG to PDF" },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{ color: "var(--muted)", textDecoration: "none", fontSize: "0.8rem", transition: "color 0.2s" }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Image & Doc Tools */}
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.85rem" }}>Image & Doc Tools</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {[
              { href: "/image-compressor", label: "Image Compressor" },
              { href: "/image-converter", label: "Image Converter" },
              { href: "/image-resizer", label: "Image Resizer" },
              { href: "/word-to-pdf", label: "Word to PDF" },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{ color: "var(--muted)", textDecoration: "none", fontSize: "0.8rem", transition: "color 0.2s" }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 style={{ fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.85rem" }}>Company</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <Link href="/about" style={{ color: "var(--muted)", textDecoration: "none", fontSize: "0.8rem" }}>About</Link>
            <Link href="/contact" style={{ color: "var(--muted)", textDecoration: "none", fontSize: "0.8rem" }}>Contact</Link>
            <Link href="/privacy" style={{ color: "var(--muted)", textDecoration: "none", fontSize: "0.8rem" }}>Privacy Policy</Link>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div
        style={{
          borderTop: "1px solid var(--card-border)",
          padding: "1rem 1.5rem",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "var(--muted)",
        }}
      >
        &copy; 2026 ConvertNest. All rights reserved. Free online file converter and PDF tools.
      </div>
    </footer>
  );
}
