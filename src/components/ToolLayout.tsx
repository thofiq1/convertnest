import Link from "next/link";
import AdBanner from "./AdBanner";
import ToolJsonLd from "./ToolJsonLd";
import BreadcrumbSchema from "./BreadcrumbSchema";
import FaqSchema from "./FaqSchema";
import { tools, getToolBySlug } from "@/lib/tools";
import { blogPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

interface FaqItem {
  question: string;
  answer: string;
}

interface ToolLayoutProps {
  title: string;
  description: string;
  slug: string;
  children: React.ReactNode;
  faqs?: FaqItem[];
  /** Explicit related tool slugs (used by pages that aren't in the tools list). */
  related?: string[];
  /** Extra guide slugs to link, in addition to posts whose relatedTool is this page. */
  guides?: string[];
}

function getRelatedTools(currentSlug: string, related?: string[]) {
  if (related && related.length) {
    return related.map((s) => getToolBySlug(s)).filter((t): t is NonNullable<typeof t> => Boolean(t));
  }
  const currentTool = getToolBySlug(currentSlug);
  if (!currentTool) return tools.filter((t) => t.slug !== currentSlug).slice(0, 3);

  const sameCategory = tools.filter(
    (t) => t.category === currentTool.category && t.slug !== currentSlug
  );

  if (sameCategory.length >= 3) return sameCategory.slice(0, 3);

  const others = tools.filter(
    (t) => t.category !== currentTool.category && t.slug !== currentSlug
  );
  return [...sameCategory, ...others].slice(0, 3);
}

export default function ToolLayout({ title, description, slug, children, faqs, related, guides }: ToolLayoutProps) {
  const relatedTools = getRelatedTools(slug, related);
  const guidePosts = blogPosts.filter(
    (p) => p.relatedTool === slug || (guides ?? []).includes(p.slug)
  );

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <ToolJsonLd
        name={title}
        description={description}
        url={`${SITE_URL}/${slug}`}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${SITE_URL}/` },
          { name: title, url: `${SITE_URL}/${slug}` },
        ]}
      />
      {faqs && faqs.length > 0 && <FaqSchema faqs={faqs} />}

      {/* Breadcrumb */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.8rem",
          color: "var(--muted)",
          marginBottom: "1.75rem",
        }}
      >
        <Link href="/" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
          Home
        </Link>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span style={{ color: "var(--foreground)" }}>{title}</span>
      </nav>

      {/* Title + trust badge */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            marginBottom: "0.5rem",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: "0.75rem", fontSize: "1rem", lineHeight: 1.5 }}>
          {description}
        </p>
        <span className="trust-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          Secure &middot; Files processed in your browser
        </span>
      </div>

      {/* Add a real numeric AdSense slot ID here after approval, e.g. slot="1234567890" */}
      <AdBanner format="horizontal" />

      <div style={{ marginTop: "1.5rem" }}>{children}</div>

      {guidePosts.length > 0 && (
        <div style={{ marginTop: "2.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>Related Guides</h2>
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {guidePosts.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} style={{ color: "var(--primary)", textDecoration: "underline", fontWeight: 500, display: "inline-block", padding: "0.25rem 0" }}>
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Tools section for internal linking */}
      {relatedTools.length > 0 && (
        <div style={{ marginTop: "2.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
            You Might Also Like
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "1rem",
            }}
          >
            {relatedTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${tool.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="tool-card"
                  style={{ height: "100%" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.25rem" }}>{tool.icon}</span>
                    <div>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.3 }}>
                        {tool.name}
                      </h3>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          color: "var(--muted)",
                        }}
                      >
                        {tool.category}
                      </span>
                    </div>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: "0.8rem", lineHeight: 1.5 }}>
                    {tool.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {faqs && faqs.length > 0 && (
        <div style={{ marginTop: "2.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {faqs.map((faq, i) => (
              <details
                key={i}
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                }}
              >
                <summary
                  style={{
                    padding: "1rem 1.25rem",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    listStyle: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {faq.question}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0, marginLeft: "0.75rem", color: "var(--muted)" }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div
                  style={{
                    padding: "0 1.25rem 1rem",
                    color: "var(--muted)",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                  }}
                >
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        {/* Add a real numeric AdSense slot ID here after approval */}
        <AdBanner format="rectangle" />
      </div>
    </div>
  );
}
