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

const post = getBlogPost("how-to-compress-image-to-20kb")!;

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
  { q: "Is 20KB enough for a signature?", a: "Yes, in most cases. A signature photographed on white paper and cropped close to the ink is mostly flat white space, which compresses well." },
  { q: "Will my photo get smaller in pixels?", a: "It can. The tool keeps the original dimensions when the image fits at a sensible quality. If it doesn't, the tool reduces the dimensions step by step until it does." },
  { q: "Can I use a PNG, WebP or HEIC image?", a: "JPG, PNG and WebP work directly, and the result is always a JPG. HEIC photos from an iPhone can't be read by this tool, so convert them with HEIC to JPG first." },
  { q: "My form says 10KB to 20KB. What should I check?", a: "Look at the size shown before you download. The tool aims for the highest quality under 20KB, so the result is normally close to the limit. If it is under your form's minimum, try an image that is cropped less tightly." },
  { q: "Is my image uploaded to a server?", a: "No. The compression runs in your browser, so the image never leaves your device." },
];

export default function CompressImageTo20kbPost() {
  return (
    <ArticleWrapper>
      <Breadcrumb postTitle={post.title} />
      <article>
        <ArticleHeader title={post.title} date={post.date} readTime={post.readTime} />
        <ArticleBody>
          <P>
            20KB is a common upload limit for signatures and small photos on exam, recruitment and government forms. To get an image under it, open the free <Link href="/compress-image-to-20kb" style={linkStyle}>Compress Image to 20KB</Link> tool and drop in your file. You get a JPG under 20KB at the highest quality that fits, with the final size shown before you download.
          </P>
          <H2>Step by Step</H2>
          <P>
            The target size box is already set to 20 KB. Drop your image on the page or tap to choose it. The tool shows a preview with the final file size, the pixel dimensions and the JPG quality it used. Press Download JPG. If your form also gives pixel dimensions, type the width and height in the optional Exact size boxes and apply the new settings. The image is then cropped to that shape and saved under the limit.
          </P>
          <H2>How It Works</H2>
          <P>
            The tool looks for the highest JPG quality that fits under your limit. If the quality would have to drop so low that the picture turns blocky, it makes the image a little smaller in pixels instead and tries again. A JPG that is already under the limit is left as it is. Everything runs in your browser, so nothing is uploaded.
          </P>
          <H2>What Fits in 20KB</H2>
          <P>
            We ran the tool on three images (tested November 2026). A 512 × 600 portrait photo of 109KB came out at 19.5 KB and 328 × 384 pixels. A 1600 × 700 phone photo of a signature, 186KB, came out at 18.7 KB and 1280 × 560 pixels. A scanned A4 text page of 815KB came out at 19.3 KB and 260 × 367 pixels, which is too small to read a full page of text. 20KB suits signatures and small photos, not whole documents.
          </P>
          <CtaBox toolSlug="compress-image-to-20kb" toolName="Compress Image to 20KB" />
          <H2>Get a Sharper Result</H2>
          <P>
            Empty background wastes the limit. Crop close to the signature or face with <Link href="/image-crop" style={linkStyle}>Image Crop</Link> before you compress. For a signature, use a dark pen on plain white paper in even light. Always start from the original picture and not from a copy that has already been compressed.
          </P>
          <H2>File Types</H2>
          <P>
            The tool accepts JPG, PNG and WebP, and the output is always a JPG. It can't read HEIC photos from an iPhone, so convert those first with <Link href="/heic-to-jpg" style={linkStyle}>HEIC to JPG</Link>, then compress the JPG.
          </P>
          <H2>Check the Form's Other Rules</H2>
          <P>
            Some forms set a minimum size as well as a maximum, for example 10KB to 20KB, so compare the size shown with both ends of the range. If a form asks for 10KB or less, use <Link href="/compress-image-to-10kb" style={linkStyle}>Compress Image to 10KB</Link> instead. The tool only handles file size and pixel size. What the picture has to show is up to the form you are filling in.
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
