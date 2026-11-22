import Link from "next/link";
import AdBanner from "./AdBanner";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <Link
        href="/"
        style={{
          color: "var(--primary)",
          textDecoration: "none",
          fontSize: "0.875rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          marginBottom: "1.5rem",
        }}
      >
        ← All Tools
      </Link>

      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
        {title}
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "1rem" }}>
        {description}
      </p>

      <AdBanner format="horizontal" slot="tool-top" />

      <div style={{ marginTop: "1.5rem" }}>{children}</div>

      <div style={{ marginTop: "2rem" }}>
        <AdBanner format="rectangle" slot="tool-bottom" />
      </div>
    </div>
  );
}
