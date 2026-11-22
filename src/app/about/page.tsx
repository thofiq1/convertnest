import { Metadata } from "next";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "About ConvertNest — Free Online PDF Tools & File Converter",
  description: "ConvertNest provides free PDF tools and file converters. Compress, merge, split PDFs and convert images — all in your browser.",
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>About ConvertNest</h1>

      <div style={{ lineHeight: 1.8 }}>
        <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
          ConvertNest is a collection of <strong>{tools.length} free online tools</strong> for
          PDF conversion, image processing, and file management. Compress PDFs, merge documents,
          convert images — everything you need, right in your browser.
        </p>

        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "2rem", marginBottom: "0.5rem" }}>
          Our Mission
        </h2>
        <p>
          We believe essential file tools should be free, fast, and private. That&apos;s why every tool on
          ConvertNest runs entirely in your browser. No sign-ups, no file uploads to servers, no limits.
        </p>

        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "2rem", marginBottom: "0.5rem" }}>
          Privacy First
        </h2>
        <p>
          All processing happens client-side using JavaScript. When you compress a PDF, merge files, or convert
          images, the work is done right in your browser. Your files never leave your device — they are never
          uploaded to any server.
        </p>

        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "2rem", marginBottom: "0.5rem" }}>
          Available Tools
        </h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.5rem" }}>
          {tools.map((tool) => (
            <li key={tool.slug} style={{ padding: "0.5rem 0.75rem", background: "var(--accent)", borderRadius: "0.5rem", fontSize: "0.875rem" }}>
              {tool.icon} {tool.name}
            </li>
          ))}
        </ul>

        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "2rem", marginBottom: "0.5rem" }}>
          Contact
        </h2>
        <p>
          Have a suggestion for a new tool? Found a bug? We&apos;d love to hear from you at{" "}
          <a href="mailto:thofiq57@gmail.com" style={{ color: "var(--primary)" }}>
            thofiq57@gmail.com
          </a>{" "}
          or visit our{" "}
          <a href="/contact" style={{ color: "var(--primary)" }}>
            Contact page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
