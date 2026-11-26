import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPost } from "@/lib/blog";
import {
  ArticleWrapper,
  Breadcrumb,
  ArticleHeader,
  ArticleBody,
  H2,
  P,
  CtaBox,
  RelatedPosts,
} from "@/components/BlogArticle";
import FaqSchema from "@/components/FaqSchema";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

const post = getBlogPost("how-to-compress-image-to-100kb")!;

export const metadata: Metadata = {
  title: post.title,
  alternates: { canonical: `/blog/${post.slug}` },
  description: post.description,
  keywords: post.keywords,
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: post.title,
    description: post.description,
    siteName: "FitTheFile",
    type: "article",
    publishedTime: post.date,
  },
};

const linkStyle = { color: "var(--primary)" };

const faqs = [
  { q: "Will a photo still look good at 100KB?", a: "Usually yes. In our test a 6000 \u00d7 4000 camera photo came out at 2458 \u00d7 1638 pixels under 100KB, which is still larger than most screens show it." },
  { q: "Does the tool change the pixel size?", a: "Only when it has to. If the image fits under 100KB at a sensible quality, the dimensions stay the same. Otherwise the tool reduces them step by step." },
  { q: "Can I set exact pixel dimensions as well?", a: "Yes. Type the width and height in the optional Exact size boxes. The image is cropped to that shape and saved under the limit." },
  { q: "Which file types work?", a: "JPG, PNG and WebP. The result is always a JPG. HEIC photos from an iPhone need converting with HEIC to JPG first." },
  { q: "Is my image uploaded to a server?", a: "No. The compression runs in your browser, so the image never leaves your device." },
];

export default function CompressImageTo100kbPost() {
  return (
    <ArticleWrapper>
      <Breadcrumb postTitle={post.title} />
      <article>
        <ArticleHeader title={post.title} date={post.date} readTime={post.readTime} />
        <ArticleBody>
          <P>
            100KB is one of the most common upload limits for photos on job applications, visa forms and profile pages. To get under it, open the free <Link href="/compress-image-to-100kb" style={linkStyle}>Compress Image to 100KB</Link> tool and drop in your picture. You get a JPG under 100KB at the highest quality that fits, and the final size is shown before you download.
          </P>
          <H2>Step by Step</H2>
          <P>
            The target box is already set to 100 KB. Drop your image on the page or tap to choose it. The tool shows a preview with the final file size, the pixel dimensions and the JPG quality it used. Press Download JPG. If your form also asks for a set width and height, type them in the optional Exact size boxes and apply the new settings.
          </P>
          <H2>What Fits in 100KB</H2>
          <P>
            We ran the tool on three test images (November 2026). A 6000 × 4000 camera photo of 6.8MB came out at 91.2 KB and 2458 × 1638 pixels. A 1373 × 1643 photo of a signature, 355KB, came out at 97.4 KB with its pixel size unchanged. A detailed 4000 × 6000 scan of a full text page, 8.4MB, came out at 96.5 KB and 536 × 805 pixels, which is small for reading fine print. 100KB is comfortable for portraits, ID photos and signatures. For a full page of text, a PDF is the better format.
          </P>
          <CtaBox toolSlug="compress-image-to-100kb" toolName="Compress Image to 100KB" />
          <H2>How the Tool Decides</H2>
          <P>
            It searches for the highest JPG quality that fits under the limit. If that quality would be low enough to make the picture blocky, it makes the image a little smaller in pixels and searches again. A smaller picture at good quality looks better than a large one at very low quality. A JPG that is already under 100KB is left alone.
          </P>
          <H2>Get a Better Result</H2>
          <P>
            Crop away background you don't need with <Link href="/image-crop" style={linkStyle}>Image Crop</Link> before you compress, so the limit is spent on the part that matters. Start from the original photo and not from a copy that a chat app has already shrunk. If the picture is a scanned document, <Link href="/compress-pdf-to-100kb" style={linkStyle}>Compress PDF to 100KB</Link> or a higher PDF limit will usually keep text easier to read.
          </P>
          <H2>File Types and Other Limits</H2>
          <P>
            The tool accepts JPG, PNG and WebP and always saves a JPG. Convert iPhone HEIC photos with <Link href="/heic-to-jpg" style={linkStyle}>HEIC to JPG</Link> first. If your form's limit is different, there are matching tools for <Link href="/compress-image-to-50kb" style={linkStyle}>50KB</Link> and <Link href="/compress-image-to-200kb" style={linkStyle}>200KB</Link>. Some forms also set a minimum size, so compare the size shown with both ends of the range.
          </P>
        </ArticleBody>
      </article>

      <FaqSchema faqs={faqs.map((f) => ({ question: f.q, answer: f.a }))} />
      <section style={{ marginTop: "2.5rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "1rem" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {faqs.map((faq, i) => (
            <details key={i} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "0.75rem", overflow: "hidden" }}>
              <summary style={{ padding: "1rem 1.25rem", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", listStyle: "none" }}>
                {faq.q}
              </summary>
              <div style={{ padding: "0 1.25rem 1rem", color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      <RelatedPosts currentSlug={post.slug} />
    </ArticleWrapper>
  );
}
