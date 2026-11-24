"use client";

import Link from "next/link";
import { tools, categories } from "@/lib/tools";
import AdBanner from "@/components/AdBanner";
import { useState } from "react";

/* ── Category color system ── */
const categoryColors: Record<string, { color: string; glow: string; bg: string }> = {
  PDF: { color: "#ef4444", glow: "rgba(239, 68, 68, 0.12)", bg: "rgba(239, 68, 68, 0.08)" },
  Image: { color: "#10b981", glow: "rgba(16, 185, 129, 0.12)", bg: "rgba(16, 185, 129, 0.08)" },
  Document: { color: "#8b5cf6", glow: "rgba(139, 92, 246, 0.12)", bg: "rgba(139, 92, 246, 0.08)" },
};

/* ── SVG icon components for tool cards ── */
const ToolIcon = ({ slug, category }: { slug: string; category?: string }) => {
  const iconMap: Record<string, React.ReactNode> = {
    "compress-pdf": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <polyline points="9 15 12 12 15 15" />
      </svg>
    ),
    "merge-pdf": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="8" height="18" rx="1" />
        <rect x="14" y="3" width="8" height="18" rx="1" />
        <path d="M10 12h4" />
        <polyline points="12 10 14 12 12 14" />
      </svg>
    ),
    "split-pdf": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="3 3" />
        <rect x="2" y="4" width="8" height="16" rx="1" />
        <rect x="14" y="4" width="8" height="16" rx="1" />
      </svg>
    ),
    "jpg-to-pdf": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    "pdf-to-jpg": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <circle cx="10" cy="13" r="2" />
        <path d="M20 17l-3-3-7 7" />
      </svg>
    ),
    "rotate-pdf": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
    "word-to-pdf": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="12" y2="17" />
      </svg>
    ),
    "image-compressor": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 12h8" />
        <path d="M12 3v18" />
        <path d="M3 8h18" />
        <path d="M3 16h18" />
      </svg>
    ),
    "image-converter": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
    ),
    "image-resizer": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    ),
    "pdf-watermark": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
    "pdf-page-numbers": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="4" y1="15" x2="20" y2="15" />
        <line x1="10" y1="3" x2="8" y2="21" />
        <line x1="16" y1="3" x2="14" y2="21" />
      </svg>
    ),
    "pdf-protect": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    ),
    "heic-to-jpg": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12" y2="18.01" />
        <polyline points="9 10 12 7 15 10" />
        <line x1="12" y1="7" x2="12" y2="14" />
      </svg>
    ),
    "image-crop": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
        <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
      </svg>
    ),
    "svg-to-png": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    "html-to-pdf": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    "pdf-unlock": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
      </svg>
    ),
  };

  const catColor = category ? categoryColors[category] : null;

  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: catColor
          ? `linear-gradient(135deg, ${catColor.glow} 0%, transparent 100%)`
          : "linear-gradient(135deg, var(--primary-glow) 0%, transparent 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: catColor ? catColor.color : "var(--primary)",
        flexShrink: 0,
      }}
    >
      {iconMap[slug] || (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )}
    </div>
  );
};

/* ── Category icon helper ── */
const CategoryIcon = ({ category }: { category: string }) => {
  if (category === "PDF")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  if (category === "Image")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  );
};

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredTools =
    activeCategory === "All" ? tools : tools.filter((t) => t.category === activeCategory);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ConvertNest",
            url: "https://convertnest-app.vercel.app",
            description: "Free online PDF tools and file converters. Compress, merge, split, and convert PDFs and images.",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://convertnest-app.vercel.app/#tools",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      {/* ── Hero Section ── */}
      <section className="hero-gradient bg-dots" style={{ padding: "5rem 1.5rem 4rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Animated blobs */}
        <div className="hero-blob" style={{
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)",
          top: "-10%", right: "10%",
        }} />
        <div className="hero-blob" style={{
          width: 350, height: 350,
          background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
          bottom: "-5%", left: "5%",
          animationDelay: "-3s",
        }} />

        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Tool count badge */}
          <div className="fade-up" style={{ marginBottom: "0.75rem" }}>
            <span className="tool-count-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              18 Free Tools — No Signup Required
            </span>
          </div>

          {/* Trust badge */}
          <div className="fade-up" style={{ marginBottom: "1.25rem" }}>
            <span className="trust-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              100% Browser-Based &middot; No Upload Required
            </span>
          </div>

          <h1
            className="hero-title fade-up fade-up-delay-1"
            style={{
              fontSize: "3rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: "1rem",
            }}
          >
            Free Online{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              PDF Tools
            </span>{" "}
            &amp; File Converter
          </h1>

          <p
            className="hero-sub fade-up fade-up-delay-2"
            style={{
              color: "var(--muted)",
              fontSize: "1.15rem",
              lineHeight: 1.6,
              maxWidth: 540,
              margin: "0 auto 2rem",
            }}
          >
            Compress, merge, split, and convert PDFs and images — all for free.
            No signup, no watermarks. Your files stay private in your browser.
          </p>

          <div className="fade-up fade-up-delay-3" style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <a href="#tools" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", padding: "0.8rem 2rem", fontSize: "0.95rem" }}>
              Explore Tools
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div
        className="trust-bar"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2.5rem",
          padding: "1.25rem 1.5rem",
          background: "var(--card-bg)",
          borderBottom: "1px solid var(--card-border)",
          fontSize: "0.8rem",
          color: "var(--muted)",
          flexWrap: "wrap",
        }}
      >
        {[
          { icon: "🔒", text: "Files never leave your device" },
          { icon: "⚡", text: "Instant processing" },
          { icon: "♾️", text: "No daily limits" },
          { icon: "✨", text: "No watermarks" },
        ].map((item) => (
          <span key={item.text} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {item.icon} {item.text}
          </span>
        ))}
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* Ad slot placeholder — replace with real AdSense slot ID after approval */}
        {/* <AdBanner format="horizontal" slot="REAL_SLOT_ID" /> */}

        {/* ── Category pills + tools grid ── */}
        <section id="tools" style={{ marginTop: "2rem" }}>
          {/* Category filter pills */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <button
              className={`category-pill ${activeCategory === "All" ? "active" : ""}`}
              onClick={() => setActiveCategory("All")}
            >
              All Tools
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
                style={activeCategory === cat && categoryColors[cat] ? {
                  background: categoryColors[cat].color,
                  boxShadow: `0 2px 10px ${categoryColors[cat].glow}`,
                } : undefined}
              >
                <CategoryIcon category={cat} />
                {cat}
              </button>
            ))}
          </div>

          {/* Tools grid */}
          <div
            className="tools-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
            }}
          >
            {filteredTools.map((tool, i) => (
              <Link
                key={tool.slug}
                href={`/${tool.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
                className={`fade-up fade-up-delay-${(i % 3) + 1}`}
              >
                <div
                  className="tool-card"
                  style={{
                    height: "100%",
                    borderLeft: `3px solid ${(categoryColors[tool.category] || categoryColors.PDF).color}22`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "0.75rem" }}>
                    <ToolIcon slug={tool.slug} category={tool.category} />
                    <div>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.3 }}>
                        {tool.name}
                      </h3>
                      <span style={{ display: "flex", alignItems: "center" }}>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            color: (categoryColors[tool.category] || categoryColors.PDF).color,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {tool.category}
                        </span>
                        {["pdf-watermark", "pdf-page-numbers", "pdf-protect", "heic-to-jpg", "image-crop", "svg-to-png", "html-to-pdf", "pdf-unlock"].includes(tool.slug) && (
                          <span className="new-badge">New</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: "0.83rem", lineHeight: 1.55 }}>
                    {tool.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div style={{ marginTop: "2.5rem" }}>
          {/* Ad slot placeholder — replace with real AdSense slot ID after approval */}
          {/* <AdBanner format="rectangle" slot="REAL_SLOT_ID" /> */}
        </div>

        {/* ── How it works ── */}
        <section style={{ marginTop: "4rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            How It Works
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: "2.5rem", fontSize: "0.95rem" }}>
            Three simple steps to get your files converted
          </p>
          <div
            className="steps-row"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              maxWidth: 800,
              margin: "0 auto",
            }}
          >
            {[
              {
                num: "1",
                title: "Upload Your File",
                desc: "Drag and drop or click to browse. All major formats supported.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                ),
              },
              {
                num: "2",
                title: "Choose Settings",
                desc: "Pick your quality, format, or page range. Smart defaults included.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                ),
              },
              {
                num: "3",
                title: "Download Result",
                desc: "Your processed file is ready instantly. No email or signup needed.",
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                ),
              },
            ].map((step) => (
              <div
                key={step.num}
                style={{
                  flex: 1,
                  padding: "2rem 1.5rem",
                  borderRadius: "1rem",
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "var(--primary-glow)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  {step.icon}
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                  {step.title}
                </h3>
                <p style={{ color: "var(--muted)", fontSize: "0.83rem", lineHeight: 1.5 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why choose us ── */}
        <section style={{ marginTop: "4rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", textAlign: "center" }}>
            Why Choose ConvertNest?
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: "2.5rem", fontSize: "0.95rem", textAlign: "center" }}>
            Trusted by thousands of users worldwide
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {[
              {
                title: "100% Free — No Hidden Fees",
                text: "Every tool is completely free. No signup, no daily limits, no premium upsells. Convert as many files as you need.",
                icon: "💰",
              },
              {
                title: "Your Files Stay Private",
                text: "All processing happens right in your browser. Your files are never uploaded to any server. Total privacy, guaranteed.",
                icon: "🛡️",
              },
              {
                title: "Fast & Easy to Use",
                text: "Drop your file, click convert, download the result. No waiting in queues or creating accounts. It just works.",
                icon: "⚡",
              },
              {
                title: "Professional Quality",
                text: "Advanced compression algorithms, high-resolution exports, and accurate conversions that match premium tools.",
                icon: "✨",
              },
            ].map((item) => (
              <div key={item.title} className="tool-card">
                <span style={{ fontSize: "1.5rem", marginBottom: "0.75rem", display: "block" }}>
                  {item.icon}
                </span>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  {item.title}
                </h3>
                <p style={{ color: "var(--muted)", fontSize: "0.83rem", lineHeight: 1.55 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SEO text ── */}
        <section
          style={{
            marginTop: "3rem",
            padding: "2rem 0",
            color: "var(--muted)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
              color: "var(--foreground)",
            }}
          >
            Online PDF Converter &amp; Image Tools
          </h2>
          <p>
            ConvertNest is your go-to platform for free online file conversion. Whether you need to
            compress a PDF to reduce its file size, merge multiple PDFs into one document, split
            pages from a PDF, or convert between image formats like JPG, PNG, and WebP — we have
            you covered. All tools work directly in your browser for maximum speed and privacy.
          </p>
          <p style={{ marginTop: "0.75rem" }}>
            Popular tools include our PDF compressor for reducing file sizes before email, the PDF
            merger for combining documents, JPG to PDF converter for creating documents from photos,
            and our image compressor for optimizing website images. Every tool is free to use with no
            daily limits.
          </p>
        </section>
      </div>
    </div>
  );
}
