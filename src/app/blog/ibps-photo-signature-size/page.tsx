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

const post = getBlogPost("ibps-photo-signature-size")!;

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
  { q: "What is the IBPS photo size in pixels and KB?", a: "In the standard bank recruitment specification the photograph is 200 × 230 pixels (preferred) and 20 to 50 KB. Check your own notification, because details can differ." },
  { q: "What is the IBPS signature size?", a: "140 × 60 pixels (preferred) and 10 to 20 KB in the standard specification." },
  { q: "What size are the left thumb impression and the hand-written declaration?", a: "The thumb impression is 240 × 240 pixels at 200 DPI (preferred), 20 to 50 KB. The declaration is 800 × 400 pixels at 200 DPI (preferred), 50 to 100 KB. Both are JPG/JPEG." },
  { q: "My signature is under 10 KB. What should I do?", a: "A 140 × 60 image can be under 10 KB even at top quality. FitTheFile's resizer then adds empty metadata to the file so it reaches the minimum. The picture itself is not changed, and the tool tells you when it has done this." },
  { q: "Are my photo and signature uploaded to a server?", a: "No. Everything runs in your browser, so your images never leave your device." },
];

export default function IbpsPhotoSignatureSizePost() {
  return (
    <ArticleWrapper>
      <Breadcrumb postTitle={post.title} />
      <article>
        <ArticleHeader title={post.title} date={post.date} readTime={post.readTime} />
        <ArticleBody>
          <P>
            IBPS and many bank recruitment forms ask for four images: a photograph, a signature, a left thumb impression and a hand-written declaration. Each has its own pixel size and its own file size range, with a minimum as well as a maximum. This guide lists the standard figures and shows how to make each file with the free <Link href="/ibps-photo-signature-resizer" style={linkStyle}>IBPS photo and signature resizer</Link>.
          </P>
          <H2>The Four Sizes</H2>
          <P>
            These are the standard specifications used in IBPS-style bank recruitment notices. The photograph is 200 × 230 pixels (preferred), 20 to 50 KB. The signature is 140 × 60 pixels (preferred), 10 to 20 KB. The left thumb impression is 240 × 240 pixels at 200 DPI (preferred), 20 to 50 KB, as a JPG/JPEG. The hand-written declaration is 800 × 400 pixels at 200 DPI (preferred), 50 to 100 KB, as a JPG/JPEG.
          </P>
          <P>
            You can see the same table in the scanning guidelines of an official notice, such as this <a href="https://punjabandsind.bank.in/system/uploads/document/2150_2024101518104187881.pdf" target="_blank" rel="noopener noreferrer" style={linkStyle}>Punjab &amp; Sind Bank recruitment notice</a>.
          </P>
          <H2>Check Your Own Notification</H2>
          <P>
            Each notice can differ. Always compare these figures with the annexure of the exact notification you are applying to, and use its numbers if they are different. The resizer handles pixel size, shape and file size only, so you also need to follow the notification's rules on background, ink colour and handwriting.
          </P>
          <H2>Why Files Get Rejected</H2>
          <P>
            These forms use a range, not just a maximum. A photo over 50 KB fails, and so can a signature under 10 KB. That second case is common, because 140 × 60 pixels is a tiny image and can come out under 10 KB even at top quality. When that happens the resizer adds empty metadata to bring the file up to the minimum, leaves the picture unchanged, and tells you.
          </P>
          <H2>Make Each File</H2>
          <P>
            Open the <Link href="/ibps-photo-signature-resizer" style={linkStyle}>resizer</Link> and choose what you are uploading: photo, signature, left thumb or declaration. Drop in a clear photo or scan. The photo is centred and cropped to fit. The signature, thumb impression and declaration are fitted on a white background, so nothing is cut off. You get a JPEG at the exact pixel size and inside the KB range, with the final size shown. Download it, then repeat for the next item.
          </P>
          <CtaBox toolSlug="ibps-photo-signature-resizer" toolName="IBPS Photo & Signature Resizer" />
          <H2>Tips for a Clean Result</H2>
          <P>
            For the signature and the declaration, write with a black pen on plain white paper, then crop close to the writing with <Link href="/image-crop" style={linkStyle}>Image Crop</Link> before you start. For the photo, use a light, plain background with your face clearly visible. The resizer reads JPG, PNG and WebP files. If your iPhone saves HEIC photos, convert them first with <Link href="/heic-to-jpg" style={linkStyle}>HEIC to JPG</Link>.
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
