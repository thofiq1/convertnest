import Link from "next/link";
import AdBanner from "./AdBanner";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "2rem 1.5rem" }}>
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

      <AdBanner format="horizontal" slot="tool-top" />

      <div style={{ marginTop: "1.5rem" }}>{children}</div>

      {/* How it works mini-steps */}
      <div
        className="steps-row"
        style={{
          display: "flex",
          gap: "1.5rem",
          marginTop: "3rem",
          padding: "1.75rem",
          background: "var(--accent)",
          borderRadius: "1rem",
        }}
      >
        {[
          { num: "1", label: "Upload", desc: "Drop your file here" },
          { num: "2", label: "Configure", desc: "Pick your settings" },
          { num: "3", label: "Download", desc: "Get your result instantly" },
        ].map((step, i) => (
          <div key={step.num} style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: i === 0 ? "var(--primary)" : "var(--card-border)",
                color: i === 0 ? "white" : "var(--muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {step.num}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{step.label}</div>
              <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2rem" }}>
        <AdBanner format="rectangle" slot="tool-bottom" />
      </div>
    </div>
  );
}
