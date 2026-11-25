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

const post = getBlogPost("pan-card-photo-signature-size")!;

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
  { q: "What is the PAN card photo size for the online application?", a: "Protean's scanning specification asks for a colour JPEG at 200 DPI, 3.5 × 2.5 cm, with a maximum file size of 20 KB." },
  { q: "What is the PAN card signature size?", a: "A colour JPEG at 200 DPI, 2 × 4.5 cm, with a maximum file size of 10 KB, according to Protean's scanning specification." },
  { q: "What is 3.5 × 2.5 cm in pixels?", a: "At 200 DPI it is about 276 × 197 pixels. The 2 × 4.5 cm signature is about 157 × 354 pixels." },
  { q: "Is the UTIITSL size the same?", a: "No. UTIITSL publishes its own photo and signature sizes, so check the instructions on the UTIITSL form if you apply there." },
  { q: "Is my photo uploaded to a server?", a: "No. FitTheFile resizes the image in your browser, so it never leaves your device." },
];

export default function PanCardSizePost() {
  return (
    <ArticleWrapper>
      <Breadcrumb postTitle={post.title} />
      <article>
        <ArticleHeader title={post.title} date={post.date} readTime={post.readTime} />
        <ArticleBody>
          <P>
            The online PAN application on the Protean (formerly NSDL) portal asks you to upload a scanned photo and signature, and it rejects files that are the wrong size. This guide gives the official numbers, what they mean in pixels, and a quick way to produce both files with the free <Link href="/pan-card-photo-signature-resizer" style={linkStyle}>PAN card photo and signature resizer</Link>.
          </P>
          <H2>The Official Sizes</H2>
          <P>
            Protean's guidelines for online PAN applications list these scanning specifications: the photograph is a colour JPEG at 200 DPI, 3.5 × 2.5 cm, maximum 20 KB. The signature is a colour JPEG at 200 DPI, 2 × 4.5 cm, maximum 10 KB. Supporting documents are black and white PDF/A or JPEG at 200 DPI, maximum 300 KB per page. You can read the table on <a href="https://tin.tin.proteantech.in/pan/InstructionDSC.html" target="_blank" rel="noopener noreferrer" style={linkStyle}>Protean's instruction page</a>.
          </P>
          <H2>What That Means in Pixels</H2>
          <P>
            Forms give centimetres, but image tools work in pixels. At 200 dots per inch, one centimetre is about 79 pixels. So the 3.5 × 2.5 cm photo is about 276 × 197 pixels, and the 2 × 4.5 cm signature is about 157 × 354 pixels. The photo is taller than it is wide; the signature is wider than it is tall.
          </P>
          <H2>Make Both Files in a Minute</H2>
          <P>
            Open the <Link href="/pan-card-photo-signature-resizer" style={linkStyle}>PAN card photo and signature resizer</Link>, choose Photo or Signature, and drop in your image. The photo is centred and cropped to fit. The signature is fitted on a white background so no part of it is cut off. Each file is saved as a JPEG at the right pixel size, marked as 200 DPI, and kept under the size limit.
          </P>
          <CtaBox toolSlug="pan-card-photo-signature-resizer" toolName="PAN Card Photo & Signature Resizer" />
          <H2>Tips for a Clean Result</H2>
          <P>
            For the signature, sign with a black pen on plain white paper and crop close to the writing with <Link href="/image-crop" style={linkStyle}>Image Crop</Link> first. 10 KB is a very small file, so empty paper around the signature wastes the limit. For the photo, use a recent passport-style picture with a plain light background. If your iPhone saves HEIC photos, convert them first with <Link href="/heic-to-jpg" style={linkStyle}>HEIC to JPG</Link>.
          </P>
          <H2>If the Portal Shows a Different Limit</H2>
          <P>
            Some Protean upload screens show a higher maximum than the figures above. A file made to the smaller limits fits either way. UTIITSL, the other PAN service provider, uses different sizes, so follow the instructions on the form you are actually filling in.
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
