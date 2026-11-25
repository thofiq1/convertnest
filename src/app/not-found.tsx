import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "This page doesn't exist. Browse FitTheFile's free PDF and image tools instead.",
};

const popular = [
  { href: "/compress-pdf", label: "Compress PDF" },
  { href: "/compress-pdf-to-100kb", label: "Compress PDF to 100KB" },
  { href: "/compress-image-to-50kb", label: "Compress Image to 50KB" },
  { href: "/merge-pdf", label: "Merge PDF" },
  { href: "/jpg-to-pdf", label: "JPG to PDF" },
  { href: "/image-resizer", label: "Image Resizer" },
];

export default function NotFound() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem" }}>Page not found</h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        The page you were looking for doesn&apos;t exist or has moved. Try one of these tools:
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginBottom: "2rem" }}>
        {popular.map((l) => (
          <Link key={l.href} href={l.href} className="category-pill" style={{ textDecoration: "none" }}>
            {l.label}
          </Link>
        ))}
      </div>
      <Link href="/" className="btn-primary" style={{ textDecoration: "none" }}>
        See all tools
      </Link>
    </div>
  );
}
