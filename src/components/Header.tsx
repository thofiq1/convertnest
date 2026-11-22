import Link from "next/link";

export default function Header() {
  return (
    <header
      style={{
        background: "var(--card-bg)",
        borderBottom: "1px solid var(--card-border)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "1rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            textDecoration: "none",
            color: "var(--primary)",
            letterSpacing: "-0.025em",
          }}
        >
          ConvertNest
        </Link>
        <nav style={{ display: "flex", gap: "1.5rem", fontSize: "0.875rem" }}>
          <Link
            href="/"
            style={{ color: "var(--muted)", textDecoration: "none" }}
          >
            PDF Tools
          </Link>
          <Link
            href="/#image-tools"
            style={{ color: "var(--muted)", textDecoration: "none" }}
          >
            Image Tools
          </Link>
          <Link
            href="/about"
            style={{ color: "var(--muted)", textDecoration: "none" }}
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
