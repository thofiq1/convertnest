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

const post = getBlogPost("how-to-resize-signature-for-online-form")!;

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
  { q: "What size should a signature be for an online form?", a: "It depends on the form. Many portals ask for a JPG between 10KB and 20KB, sometimes with set pixel dimensions. Always follow the limits printed on the form you\u2019re filling in." },
  { q: "How do I get a signature under 10KB?", a: "Crop tightly around the ink, resize to the dimensions the form asks for, then use the Compress Image to 10KB tool. Removing empty background is what makes 10KB easy." },
  { q: "Can I use a PNG signature?", a: "Most forms want a JPG. The FitTheFile size tools accept JPG, PNG or WebP and always output a JPG." },
  { q: "Is my signature uploaded anywhere?", a: "No. FitTheFile processes the image in your browser, so it never leaves your device." },
];

export default function SignatureResizePost() {
  return (
    <ArticleWrapper>
      <Breadcrumb postTitle={post.title} />
      <article>
        <ArticleHeader title={post.title} date={post.date} readTime={post.readTime} />
        <ArticleBody>
          <P>
            Most online application forms (exam, job, university and government portals) ask for a scanned signature as a JPG, usually under a strict size such as 10KB to 20KB, and often with set pixel dimensions. Here’s how to make one from a phone photo in a few minutes, for free, using <Link href="/image-crop" style={linkStyle}>Image Crop</Link>, <Link href="/image-resizer" style={linkStyle}>Image Resizer</Link> and the <Link href="/compress-image-to-20kb" style={linkStyle}>Compress Image to 20KB</Link> tool.
          </P>
          <P>
            Always check the form’s own instructions first. The size limit, dimensions, file type and ink colour differ from portal to portal, and the form’s rules are the ones that count.
          </P>
          <H2>1. Sign on Plain White Paper</H2>
          <P>
            Use a black or dark blue pen on clean white paper, and sign a little larger than usual so the strokes stay clear after shrinking. Avoid lined or textured paper: lines and shadows add detail that wastes file size.
          </P>
          <H2>2. Take a Clear Photo</H2>
          <P>
            Photograph the signature straight-on in good, even light, with no shadow from your phone. If your iPhone saves photos as HEIC, convert the photo with <Link href="/heic-to-jpg" style={linkStyle}>HEIC to JPG</Link> first, since most forms only accept JPG.
          </P>
          <H2>3. Crop Tight Around the Signature</H2>
          <P>
            Open <Link href="/image-crop" style={linkStyle}>Image Crop</Link> and cut away everything except the signature, leaving only a small white margin. This is the single biggest help: less empty space means more of the size budget goes to the ink.
          </P>
          <H2>4. Resize to the Required Dimensions</H2>
          <P>
            If the form asks for specific pixel dimensions, set them in <Link href="/image-resizer" style={linkStyle}>Image Resizer</Link>. A signature at a few hundred pixels wide compresses to 10&ndash;20KB easily while staying sharp.
          </P>
          <H2>5. Compress Under the Limit</H2>
          <P>
            Drop the cropped image into the <Link href="/compress-image-to-20kb" style={linkStyle}>20KB tool</Link> (or the <Link href="/compress-image-to-10kb" style={linkStyle}>10KB tool</Link> for stricter forms). It picks the highest JPG quality that fits and only reduces dimensions if it has to. Check the preview, then download. If your form gives exact pixels as well as a KB range (bank exams often ask for 140 × 60 px at 10&ndash;20KB), the <Link href="/ibps-photo-signature-resizer" style={linkStyle}>IBPS photo and signature resizer</Link> does both in one step, including the minimum size.
          </P>
          <CtaBox toolSlug="compress-image-to-20kb" toolName="Compress Image to 20KB" />
          <H2>If the Result Looks Blurry</H2>
          <P>
            Crop tighter, resize to the smallest dimensions the form allows, and compress from the original photo rather than an already-compressed copy. Signatures are simple images, so they usually stay crisp even at 10KB once the empty background is gone.
          </P>
          <H2>Your Signature Stays Private</H2>
          <P>
            A signature is sensitive. All of these tools run in your browser, so the image is never uploaded to a server.
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
