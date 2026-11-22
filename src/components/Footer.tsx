import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--card-bg)",
        borderTop: "1px solid var(--card-border)",
        padding: "2rem 1.5rem",
        textAlign: "center",
        fontSize: "0.8rem",
        color: "var(--muted)",
        marginTop: "4rem",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <p>&copy; 2026 ConvertNest. Free online file converter and PDF tools.</p>
        <p style={{ marginTop: "0.5rem" }}>
          All processing happens in your browser. Your data never leaves your device.
        </p>
        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center", gap: "1.5rem" }}>
          <Link href="/about" style={{ color: "var(--muted)", textDecoration: "none" }}>About</Link>
          <Link href="/privacy" style={{ color: "var(--muted)", textDecoration: "none" }}>Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
