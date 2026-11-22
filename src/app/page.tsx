import Link from "next/link";
import { tools, categories } from "@/lib/tools";
import AdBanner from "@/components/AdBanner";

export default function Home() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Hero Section */}
      <section style={{ textAlign: "center", padding: "3rem 0 2rem" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            marginBottom: "1rem",
            letterSpacing: "-0.025em",
          }}
        >
          Free Online PDF Tools &amp; File Converter
        </h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "1.125rem",
            maxWidth: "640px",
            margin: "0 auto",
          }}
        >
          Compress, merge, split, and convert PDFs and images — all for free.
          No signup, no watermarks. Your files stay private in your browser.
        </p>
      </section>

      <AdBanner format="horizontal" slot="home-top" />

      {/* Tools by Category */}
      <section id="tools" style={{ marginTop: "2.5rem" }}>
        {categories.map((category) => (
          <div
            key={category}
            id={`${category.toLowerCase()}-tools`}
            style={{ marginBottom: "2.5rem" }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                marginBottom: "1rem",
                color: "var(--primary)",
              }}
            >
              {category} Tools
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1rem",
              }}
            >
              {tools
                .filter((t) => t.category === category)
                .map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/${tool.slug}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div className="tool-card">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            background: "var(--accent)",
                            borderRadius: "0.5rem",
                            width: "2.5rem",
                            height: "2.5rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {tool.icon}
                        </span>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
                          {tool.name}
                        </h3>
                      </div>
                      <p
                        style={{
                          color: "var(--muted)",
                          fontSize: "0.85rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {tool.description}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </section>

      <AdBanner format="rectangle" slot="home-bottom" />

      {/* SEO content */}
      <section style={{ marginTop: "3rem", padding: "2rem 0" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}
        >
          Why Choose ConvertNest?
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[
            {
              title: "100% Free — No Hidden Fees",
              text: "Every tool is completely free. No signup, no daily limits, no premium upsells. Convert as many files as you need.",
            },
            {
              title: "Your Files Stay Private",
              text: "All processing happens right in your browser. Your files are never uploaded to any server. Total privacy, guaranteed.",
            },
            {
              title: "Fast & Easy to Use",
              text: "Drop your file, click convert, download the result. No waiting in queues or creating accounts. It just works.",
            },
          ].map((item) => (
            <div key={item.title} className="tool-card">
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                }}
              >
                {item.title}
              </h3>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Additional SEO text */}
      <section style={{ marginTop: "2rem", padding: "1.5rem 0", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--foreground)" }}>
          Online PDF Converter & Image Tools
        </h2>
        <p>
          ConvertNest is your go-to platform for free online file conversion. Whether you need to
          compress a PDF to reduce its file size, merge multiple PDFs into one document, split pages
          from a PDF, or convert between image formats like JPG, PNG, and WebP — we have you covered.
          All tools work directly in your browser for maximum speed and privacy.
        </p>
        <p style={{ marginTop: "0.75rem" }}>
          Popular tools include our PDF compressor for reducing file sizes before email, the PDF merger
          for combining documents, JPG to PDF converter for creating documents from photos, and our
          image compressor for optimizing website images. Every tool is free to use with no daily limits.
        </p>
      </section>
    </div>
  );
}
