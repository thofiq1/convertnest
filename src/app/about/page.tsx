import { Metadata } from "next";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "About FitTheFile and Its Founder, Thofiq Imamsab",
  alternates: { canonical: "/about" },
  description: "Who builds FitTheFile and why: free PDF and image tools that fit files under upload limits, built by developer Thofiq Imamsab. Files never leave your browser.",
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>About FitTheFile</h1>

      <div style={{ lineHeight: 1.8 }}>
        <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
          FitTheFile is a collection of <strong>{tools.length} free online tools</strong> for
          PDF conversion, image processing, and file management. Compress PDFs, merge documents,
          convert images — everything you need, right in your browser.
        </p>

        <h2 id="founder" style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "2rem", marginBottom: "0.5rem" }}>
          Who Builds FitTheFile
        </h2>
        <p style={{ marginBottom: "1rem" }}>
          FitTheFile is built and maintained by <strong>Thofiq Imamsab</strong>, a full-stack developer with more
          than five years of experience building web applications.
        </p>
        <p style={{ marginBottom: "1rem" }}>
          It started with a boring, recurring problem: application portals rejecting files with messages like
          &ldquo;maximum 100 KB&rdquo; or &ldquo;signature must be 10&ndash;20 KB&rdquo;. Most compressors offered
          a vague high/medium/low setting, or wanted documents like passport scans uploaded to their servers.
          FitTheFile does it differently: you type the limit, it finds the best quality that fits, and the file
          never leaves your device.
        </p>
        <p>
          Every tool is tested with real files before it goes live, and the size pages publish the actual results
          of those tests. If something doesn&apos;t work the way it should, please email me. I read every message.
        </p>

        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "2rem", marginBottom: "0.5rem" }}>
          Our Mission
        </h2>
        <p>
          We believe essential file tools should be free, fast, and private. That&apos;s why every tool on
          FitTheFile runs entirely in your browser. No sign-ups, no file uploads to servers, no limits.
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
