import type { Metadata } from "next";
import ToolLayout from "@/components/ToolLayout";
import PdfTargetSizeCompressor from "@/components/PdfTargetSizeCompressor";
import { getPdfSizePage } from "@/lib/sizePages";

export function pdfSizeMetadata(kb: number): Metadata {
  const page = getPdfSizePage(kb)!;
  const title = `Compress PDF to ${kb}KB Online Free`;
  const description = `Reduce any PDF to under ${kb}KB in seconds, free. Set the target size and download a PDF that fits upload limits for ${page.useCase}. No signup, files stay on your device.`;
  return {
    title,
    description,
    keywords: [
      `compress pdf to ${kb}kb`,
      `reduce pdf size to ${kb}kb`,
      `pdf size reducer ${kb}kb`,
      `compress pdf under ${kb}kb`,
      `pdf ${kb}kb converter`,
      `shrink pdf to ${kb}kb`,
    ],
    openGraph: { title, description, url: `/${page.slug}`, siteName: "FitTheFile", type: "website" },
    alternates: { canonical: `/${page.slug}` },
  };
}

export default function PdfSizeLandingPage({ kb }: { kb: number }) {
  const page = getPdfSizePage(kb)!;
  const faqs = [
    {
      question: `How do I compress a PDF to ${kb}KB?`,
      answer: `Upload your PDF to FitTheFile's ${kb}KB compressor. It tries the sharpest settings first and lowers resolution and quality only as far as needed to get under ${kb}KB, then gives you the file to download.`,
    },
    {
      question: `Can every PDF be compressed to ${kb}KB?`,
      answer: `Most short documents can. Very long PDFs may not fit, because each page needs some minimum space to stay readable. If the limit can't be reached, the tool tells you and shows the smallest size it managed, so you can split the file or use a larger target.`,
    },
    {
      question: "Will I still be able to select text in the PDF?",
      answer: "No. To fit under a size limit, each page is saved as an image. That's fine for most upload portals and scanned documents, but if you need searchable text, keep a copy of the original.",
    },
    {
      question: "Is my PDF uploaded to a server?",
      answer: "No. The compression runs entirely in your browser, so your document never leaves your device.",
    },
  ];

  return (
    <ToolLayout
      title={`Compress PDF to ${kb}KB`}
      description={`Shrink any PDF to under ${kb}KB — ideal for ${page.useCase}. Free, no signup, runs in your browser.`}
      slug={page.slug}
      faqs={faqs}
    >
      <PdfTargetSizeCompressor defaultKb={kb} />

      <section style={{ marginTop: "2.5rem", lineHeight: 1.75, color: "var(--muted)", fontSize: "0.95rem" }}>
        <h2 style={{ color: "var(--foreground)", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          How to compress a PDF to {kb}KB
        </h2>
        <ol style={{ paddingLeft: "1.25rem", marginBottom: "1.25rem" }}>
          <li>Drop your PDF into the box above.</li>
          <li>The tool tries the highest resolution and quality first, stepping down only until the file fits under {kb}KB.</li>
          <li>Check the result, then click <strong>Download PDF</strong>.</li>
        </ol>
        <p>
          A {kb}KB limit is common for {page.useCase}. Scanned documents and phone photos of paperwork are often
          several megabytes, far over that. This tool does the trial and error for you, and tells you honestly if a
          file is too long to fit. You can type any other target size in the box above the upload area.
        </p>
      </section>
    </ToolLayout>
  );
}
