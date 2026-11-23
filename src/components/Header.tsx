"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const html = document.documentElement;
    if (saved === "dark") {
      html.classList.add("dark-mode");
      html.classList.remove("light-mode");
      setIsDark(true);
    } else if (saved === "light") {
      html.classList.add("light-mode");
      html.classList.remove("dark-mode");
      setIsDark(false);
    } else {
      // No saved preference — detect system
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const goingDark = !isDark;
    setIsDark(goingDark);
    if (goingDark) {
      html.classList.add("dark-mode");
      html.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.add("light-mode");
      html.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header
      className="glass-header"
      style={{
        borderBottom: "1px solid var(--card-border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0.75rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "var(--foreground)",
            }}
          >
            Convert<span style={{ color: "var(--primary)" }}>Nest</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          style={{
            display: "flex",
            gap: "1.75rem",
            fontSize: "0.85rem",
            alignItems: "center",
          }}
          className="desktop-nav"
        >
          <Link href="/#tools" style={{ color: "var(--muted)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}>
            PDF Tools
          </Link>
          <Link href="/#tools" style={{ color: "var(--muted)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}>
            Image Tools
          </Link>
          <Link href="/about" style={{ color: "var(--muted)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}>
            About
          </Link>
          <Link href="/contact" style={{ color: "var(--muted)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}>
            Contact
          </Link>
        </nav>

        {/* Theme toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            onClick={toggleTheme}
            style={{
              background: "var(--accent)",
              border: "1px solid var(--card-border)",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--muted)",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-nav-btn"
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            color: "var(--foreground)",
          }}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="mobile-menu"
          style={{
            display: "none",
            padding: "0.75rem 1.5rem 1rem",
            borderTop: "1px solid var(--card-border)",
          }}
        >
          <Link href="/#tools" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "0.5rem 0", color: "var(--muted)", textDecoration: "none", fontSize: "0.9rem" }}>
            PDF Tools
          </Link>
          <Link href="/#tools" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "0.5rem 0", color: "var(--muted)", textDecoration: "none", fontSize: "0.9rem" }}>
            Image Tools
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "0.5rem 0", color: "var(--muted)", textDecoration: "none", fontSize: "0.9rem" }}>
            About
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "0.5rem 0", color: "var(--muted)", textDecoration: "none", fontSize: "0.9rem" }}>
            Contact
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-btn { display: block !important; }
          .mobile-menu { display: block !important; }
        }
      `}</style>
    </header>
  );
}
