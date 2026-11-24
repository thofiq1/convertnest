import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  alternates: { canonical: "/contact" },
  description:
    "Get in touch with the ConvertNest team. Questions, feedback, or feature requests — we'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
        Contact Us
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem", lineHeight: 1.6 }}>
        Have a question, found a bug, or want to suggest a new tool? We&apos;d love to hear from you.
      </p>

      <div style={{ lineHeight: 1.8 }}>
        {/* Email contact card */}
        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "1rem",
            padding: "2rem",
            marginBottom: "2rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span role="img" aria-label="email">
              ✉️
            </span>{" "}
            Email Us
          </h2>
          <p style={{ marginBottom: "1rem" }}>
            The fastest way to reach us is by email. We typically respond within 24–48 hours.
          </p>
          <a
            href="mailto:thofiq57@gmail.com"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              transition: "opacity 0.2s",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 7l-10 7L2 7" />
            </svg>
            thofiq57@gmail.com
          </a>
        </div>

        {/* What to include */}
        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "1rem",
            padding: "2rem",
            marginBottom: "2rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            What Can We Help With?
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              {
                icon: "🐛",
                title: "Bug Reports",
                desc: "Found something that isn't working? Let us know the tool name, browser, and what happened.",
              },
              {
                icon: "💡",
                title: "Feature Requests",
                desc: "Have an idea for a new tool or improvement? We're always looking to add useful features.",
              },
              {
                icon: "🤝",
                title: "Partnership",
                desc: "Interested in collaborating or integrating ConvertNest? Reach out and let's talk.",
              },
              {
                icon: "❓",
                title: "General Questions",
                desc: "Questions about how our tools work, privacy, or anything else? We're happy to help.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  padding: "1rem",
                  background: "var(--accent)",
                  borderRadius: "0.75rem",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                  {item.icon}
                </div>
                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    marginBottom: "0.25rem",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Response time note */}
        <div
          style={{
            background: "var(--accent)",
            borderRadius: "0.75rem",
            padding: "1.25rem 1.5rem",
            fontSize: "0.85rem",
            color: "var(--muted)",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "var(--foreground)" }}>Response Time:</strong>{" "}
          We aim to respond to all inquiries within 24–48 hours during business days.
          For urgent issues, please include &quot;URGENT&quot; in your email subject line.
        </div>
      </div>
    </div>
  );
}
