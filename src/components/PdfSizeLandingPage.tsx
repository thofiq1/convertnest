import type { Metadata } from "next";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import PdfTargetSizeCompressor from "@/components/PdfTargetSizeCompressor";
import { getPdfSizePage } from "@/lib/sizePages";
import { pdfSizeContent } from "@/lib/sizeContent";
import { pdfSizeTests, PDF_TEST_INPUTS, SIZE_TESTS_DATE } from "@/lib/sizeTests";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export function pdfSizeMetadata(kb: number): Metadata {
  const page = getPdfSizePage(kb)!;
  const content = pdfSizeContent[kb];
  const title = `Compress PDF to ${kb}KB Online Free`;
  const description = content.metaDescription;
  return {
    title,
    description,
    keywords: [
      `compress pdf to ${kb}kb`,
      `reduce pdf size to ${kb}kb`,
      `pdf size reducer ${kb}kb`,
      `compress pdf under ${kb}kb`,
      `shrink pdf to ${kb}kb`,
    ],
    openGraph: { images: DEFAULT_OG_IMAGES, title, description, url: `/${page.slug}`, siteName: "FitTheFile", type: "website" },
    alternates: { canonical: `/${page.slug}` },
  };
}

const h2 = { color: "var(--foreground)", fontSize: "1.25rem", fontWeight: 700, margin: "2rem 0 0.75rem" } as const;
const cell = { padding: "0.5rem 0.6rem", borderBottom: "1px solid var(--card-border)", textAlign: "left" as const };

export default function PdfSizeLandingPage({ kb }: { kb: number }) {
  const page = getPdfSizePage(kb)!;
  const content = pdfSizeContent[kb];
  const tests = pdfSizeTests[kb];
  const faqs = [
    ...content.faqs,
    {
      question: "Will I still be able to select text in the PDF?",
      answer: "No. To fit under a size limit, each page is saved as an image. That's fine for most upload portals, but keep your original if you need searchable text.",
    },
    {
      question: "Is my PDF uploaded to a server?",
      answer: "No. The compression runs entirely in your browser, so your document never leaves your device.",
    },
  ];

  return (
    <ToolLayout
      title={`Compress PDF to ${kb}KB`}
      description={`Shrink any PDF to under ${kb}KB. ${content.bestFor} Free, no signup, runs in your browser.`}
      slug={page.slug}
      faqs={faqs}
      related={["split-pdf", "merge-pdf", "compress-pdf"]}
      guides={["how-to-compress-pdf-to-100kb", "file-size-too-large-upload-fix"]}
    >
      <PdfTargetSizeCompressor defaultKb={kb} />

      <section style={{ marginTop: "2rem", lineHeight: 1.75, color: "var(--muted)", fontSize: "0.95rem" }}>
        <h2 style={h2}>What to expect at {kb}KB</h2>
        <p>{content.expect}</p>

        {tests && (
          <>
            <h2 style={h2}>Our test results at {kb}KB</h2>
            <p>
              We ran two scanned test documents through this exact tool ({SIZE_TESTS_DATE}). Higher DPI means sharper
              text; 72 DPI and above is comfortable to read on screen.
            </p>
            <div style={{ overflowX: "auto", margin: "0.75rem 0 0.5rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ color: "var(--foreground)" }}>
                    <th style={cell}>Test document</th>
                    <th style={cell}>Result</th>
                    <th style={cell}>Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  {PDF_TEST_INPUTS.map((input) => {
                    const r = tests[input.key];
                    return (
                      <tr key={input.key}>
                        <td style={cell}>{input.label}</td>
                        <td style={cell}>{r.kept ? `${r.size} (already fit, unchanged)` : r.size}</td>
                        <td style={cell}>{r.kept ? "Original" : `${r.dpi} DPI, quality ${r.q}%`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <h2 style={h2}>Tips for {kb}KB</h2>
        <ul style={{ paddingLeft: "1.25rem", listStyle: "disc" }}>
          {content.tips.map((t) => (
            <li key={t} style={{ marginBottom: "0.35rem" }}>{t}</li>
          ))}
        </ul>
        <p style={{ marginTop: "0.75rem" }}>
          Only need some pages? Extract them with <Link href="/split-pdf" style={{ color: "var(--primary)", textDecoration: "underline" }}>Split PDF</Link> first:
          fewer pages means sharper results at {kb}KB.
        </p>
      </section>
    </ToolLayout>
  );
}
