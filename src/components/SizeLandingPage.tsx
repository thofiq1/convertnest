import type { Metadata } from "next";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import TargetSizeCompressor from "@/components/TargetSizeCompressor";
import { getSizePage } from "@/lib/sizePages";
import { imageSizeContent } from "@/lib/sizeContent";
import { imageSizeTests, IMAGE_TEST_INPUTS, SIZE_TESTS_DATE } from "@/lib/sizeTests";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export function sizeMetadata(kb: number): Metadata {
  const page = getSizePage(kb)!;
  const content = imageSizeContent[kb];
  const title = `Compress Image to ${kb}KB Online Free`;
  const description = content.metaDescription;
  return {
    title,
    description,
    keywords: [
      `compress image to ${kb}kb`,
      `reduce image size to ${kb}kb`,
      `compress jpg to ${kb}kb`,
      `photo size ${kb}kb`,
      `resize image to ${kb}kb`,
    ],
    openGraph: { images: DEFAULT_OG_IMAGES, title, description, url: `/${page.slug}`, siteName: "FitTheFile", type: "website" },
    alternates: { canonical: `/${page.slug}` },
  };
}

const h2 = { color: "var(--foreground)", fontSize: "1.25rem", fontWeight: 700, margin: "2rem 0 0.75rem" } as const;
const cell = { padding: "0.5rem 0.6rem", borderBottom: "1px solid var(--card-border)", textAlign: "left" as const };

export default function SizeLandingPage({ kb }: { kb: number }) {
  const page = getSizePage(kb)!;
  const content = imageSizeContent[kb];
  const tests = imageSizeTests[kb];
  const faqs = [
    ...content.faqs,
    {
      question: "Are my photos uploaded to a server?",
      answer: "No. Compression runs entirely in your browser, so your photo never leaves your device.",
    },
  ];
  const guides = kb <= 30 ? ["how-to-resize-signature-for-online-form", "how-to-compress-image-to-50kb"] : ["how-to-compress-image-to-50kb", "file-size-too-large-upload-fix"];

  return (
    <ToolLayout
      title={`Compress Image to ${kb}KB`}
      description={`Shrink any photo to under ${kb}KB. ${content.bestFor} Free, no signup.`}
      slug={page.slug}
      faqs={faqs}
      related={["image-resizer", "image-crop", "image-compressor"]}
      guides={guides}
    >
      <TargetSizeCompressor defaultKb={kb} />

      <section style={{ marginTop: "2rem", lineHeight: 1.75, color: "var(--muted)", fontSize: "0.95rem" }}>
        <h2 style={h2}>What to expect at {kb}KB</h2>
        <p>{content.expect}</p>

        {tests && (
          <>
            <h2 style={h2}>Our test results at {kb}KB</h2>
            <p>
              We ran three sample images through this exact tool ({SIZE_TESTS_DATE}). Your results will vary with the
              photo, but this shows the trade-off the tool makes at {kb}KB:
            </p>
            <div style={{ overflowX: "auto", margin: "0.75rem 0 0.5rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ color: "var(--foreground)" }}>
                    <th style={cell}>Test image</th>
                    <th style={cell}>Result</th>
                    <th style={cell}>Dimensions</th>
                    <th style={cell}>JPG quality</th>
                  </tr>
                </thead>
                <tbody>
                  {IMAGE_TEST_INPUTS.map((input) => {
                    const r = tests[input.key];
                    return (
                      <tr key={input.key}>
                        <td style={cell}>{input.label}</td>
                        <td style={cell}>{r.size}</td>
                        <td style={cell}>{r.w} × {r.h}px</td>
                        <td style={cell}>{r.q}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: "0.8rem" }}>
              When the original already fits at top quality, the tool keeps its full size, so the result can be well
              under {kb}KB.
            </p>
          </>
        )}

        <h2 style={h2}>Tips for {kb}KB</h2>
        <ul style={{ paddingLeft: "1.25rem", listStyle: "disc" }}>
          {content.tips.map((t) => (
            <li key={t} style={{ marginBottom: "0.35rem" }}>{t}</li>
          ))}
        </ul>
        <p style={{ marginTop: "0.75rem" }}>
          Need exact pixel dimensions? Set them first with <Link href="/image-resizer" style={{ color: "var(--primary)", textDecoration: "underline" }}>Image Resizer</Link>,
          or cut away background with <Link href="/image-crop" style={{ color: "var(--primary)", textDecoration: "underline" }}>Image Crop</Link>, then compress here.
        </p>
      </section>
    </ToolLayout>
  );
}
