import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { getRelatedPosts, blogPosts } from "@/lib/blog";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import BreadcrumbSchema from "./BreadcrumbSchema";

export function Breadcrumb({ postTitle }: { postTitle: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        fontSize: "0.82rem",
        color: "var(--muted)",
        marginBottom: "1.5rem",
      }}
    >
      <Link
        href="/"
        style={{ color: "var(--muted)", textDecoration: "none" }}
      >
        Home
      </Link>
      <span style={{ margin: "0 0.4rem" }}>&rsaquo;</span>
      <Link
        href="/blog"
        style={{ color: "var(--muted)", textDecoration: "none" }}
      >
        Blog
      </Link>
      <span style={{ margin: "0 0.4rem" }}>&rsaquo;</span>
      <span style={{ color: "var(--foreground)" }}>{postTitle}</span>
    </nav>
  );
}

export function ArticleHeader({
  title,
  date,
  readTime,
}: {
  title: string;
  date: string;
  readTime: string;
}) {
  // Article JSON-LD is emitted here so every post gets it without editing
  // each post file. The post is looked up by title (all posts pass post.title).
  const post = blogPosts.find((p) => p.title === title);
  const postUrl = post ? `${SITE_URL}/blog/${post.slug}` : undefined;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    ...(post ? { description: post.description } : {}),
    datePublished: date,
    dateModified: date,
    ...(postUrl ? { url: postUrl, mainEntityOfPage: { "@type": "WebPage", "@id": postUrl } } : {}),
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    image: `${SITE_URL}/opengraph-image`,
    inLanguage: "en",
  };
  return (
    <header style={{ marginBottom: "2rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {postUrl && (
        <BreadcrumbSchema
          items={[
            { name: "Home", url: `${SITE_URL}/` },
            { name: "Blog", url: `${SITE_URL}/blog` },
            { name: title, url: postUrl },
          ]}
        />
      )}
      <h1
        style={{
          fontSize: "1.85rem",
          fontWeight: 800,
          color: "var(--foreground)",
          lineHeight: 1.3,
          letterSpacing: "-0.025em",
          marginBottom: "0.75rem",
        }}
      >
        {title}
      </h1>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          fontSize: "0.85rem",
          color: "var(--muted)",
        }}
      >
        <time dateTime={date}>
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <span>{readTime}</span>
      </div>
    </header>
  );
}

export function CtaBox({
  toolSlug,
  toolName,
}: {
  toolSlug: string;
  toolName: string;
}) {
  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "2px solid var(--primary)",
        borderRadius: 12,
        padding: "1.75rem",
        textAlign: "center",
        margin: "2.5rem 0",
      }}
    >
      <p
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "var(--foreground)",
          marginBottom: "0.75rem",
        }}
      >
        Try {toolName} Now — Free, No Signup
      </p>
      <p
        style={{
          color: "var(--muted)",
          fontSize: "0.9rem",
          marginBottom: "1.25rem",
          lineHeight: 1.6,
        }}
      >
        All processing happens in your browser. Your files never leave your
        device.
      </p>
      <Link
        href={`/${toolSlug}`}
        style={{
          display: "inline-block",
          background: "var(--primary)",
          color: "#fff",
          padding: "0.7rem 2rem",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: "0.95rem",
          textDecoration: "none",
          transition: "opacity 0.2s",
        }}
      >
        Open {toolName}
      </Link>
    </div>
  );
}

export function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const related = getRelatedPosts(currentSlug, 3);
  if (related.length === 0) return null;

  return (
    <section style={{ marginTop: "3rem" }}>
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "var(--foreground)",
          marginBottom: "1rem",
        }}
      >
        Related Articles
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        {related.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: 10,
                padding: "1.25rem",
                transition: "border-color 0.2s",
              }}
            >
              <h3
                style={{
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  color: "var(--foreground)",
                  marginBottom: "0.4rem",
                  lineHeight: 1.4,
                }}
              >
                {post.title}
              </h3>
              <span
                style={{
                  fontSize: "0.78rem",
                  color: "var(--muted)",
                }}
              >
                {post.readTime}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ArticleWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "2rem 1.5rem 4rem",
      }}
    >
      {children}
    </main>
  );
}

export function ArticleBody({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        color: "var(--foreground)",
        fontSize: "1rem",
        lineHeight: 1.7,
      }}
    >
      {children}
    </div>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: "1.35rem",
        fontWeight: 700,
        color: "var(--foreground)",
        marginTop: "2rem",
        marginBottom: "0.75rem",
      }}
    >
      {children}
    </h2>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ marginBottom: "1rem", color: "var(--foreground)", lineHeight: 1.7 }}>
      {children}
    </p>
  );
}
