import Link from "next/link";
import { blogPosts } from "@/lib/blog";

export default function BlogPage() {
  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "2.5rem 1.5rem 4rem",
      }}
    >
      <div style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "var(--foreground)",
            marginBottom: "0.5rem",
            letterSpacing: "-0.025em",
          }}
        >
          Blog
        </h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "1.05rem",
            lineHeight: 1.6,
          }}
        >
          Tips, tutorials, and guides for working with PDFs and images.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <article
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: 12,
                padding: "1.5rem",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            >
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--foreground)",
                  marginBottom: "0.5rem",
                  lineHeight: 1.4,
                }}
              >
                {post.title}
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: "0.88rem",
                  lineHeight: 1.6,
                  flex: 1,
                  marginBottom: "1rem",
                }}
              >
                {post.description}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.78rem",
                  color: "var(--muted)",
                }}
              >
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <span>{post.readTime}</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </main>
  );
}
