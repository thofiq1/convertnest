import type { Metadata } from "next";
import ToolLayout from "@/components/ToolLayout";
import TargetSizeCompressor from "@/components/TargetSizeCompressor";
import { getSizePage } from "@/lib/sizePages";

export function sizeMetadata(kb: number): Metadata {
  const page = getSizePage(kb)!;
  const title = `Compress Image to ${kb}KB Online Free`;
  const description = `Compress any photo to under ${kb}KB in seconds, free. Set the target size and download a JPG that fits upload limits for ${page.useCase}. No signup, files never leave your device.`;
  return {
    title,
    description,
    keywords: [
      `compress image to ${kb}kb`,
      `reduce image size to ${kb}kb`,
      `compress jpg to ${kb}kb`,
      `photo size ${kb}kb`,
      `resize image to ${kb}kb`,
      `image ${kb}kb converter`,
    ],
    openGraph: { title, description, url: `/${page.slug}`, siteName: "ConvertNest", type: "website" },
    alternates: { canonical: `/${page.slug}` },
  };
}

export default function SizeLandingPage({ kb }: { kb: number }) {
  const page = getSizePage(kb)!;
  const faqs = [
    {
      question: `How do I compress an image to ${kb}KB?`,
      answer: `Upload your photo to ConvertNest's ${kb}KB compressor. It automatically finds the highest JPG quality that fits under ${kb}KB, shrinking the dimensions only if needed, and gives you a file to download.`,
    },
    {
      question: `Will my photo lose quality at ${kb}KB?`,
      answer: `Some quality is always traded for size, but the tool keeps as much as possible by trying the highest quality first. For ${kb}KB, most ID and profile photos still look sharp. Cropping away empty background first helps a lot.`,
    },
    {
      question: "Are my photos uploaded to a server?",
      answer: "No. Compression runs entirely in your browser, so your photo never leaves your device.",
    },
  ];

  return (
    <ToolLayout
      title={`Compress Image to ${kb}KB`}
      description={`Shrink any photo to under ${kb}KB in seconds — ideal for ${page.useCase}. Free, no signup.`}
      slug={page.slug}
      faqs={faqs}
    >
      <TargetSizeCompressor defaultKb={kb} />

      <section style={{ marginTop: "2.5rem", lineHeight: 1.75, color: "var(--muted)", fontSize: "0.95rem" }}>
        <h2 style={{ color: "var(--foreground)", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          How to compress an image to {kb}KB
        </h2>
        <ol style={{ paddingLeft: "1.25rem", marginBottom: "1.25rem" }}>
          <li>Drop your photo (JPG, PNG or WebP) into the box above.</li>
          <li>The tool tests quality levels and picks the best one that fits under {kb}KB.</li>
          <li>Check the preview, then click <strong>Download JPG</strong>.</li>
        </ol>
        <p>
          Many websites set a {kb}KB upload limit, especially for {page.useCase}. A phone photo is usually
          2–5MB, far over that limit. This tool does the trial and error for you. You can also type any other
          target size in the box above the upload area.
        </p>
      </section>
    </ToolLayout>
  );
}
