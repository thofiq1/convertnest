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

const post = getBlogPost("india-visa-photo-size-requirements")!;

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
  { q: "What size is the India visa photo for the online application?", a: "The official upload guide asks for a square JPEG between 350 × 350 and 1000 × 1000 pixels, with a file size from 10 KB to 300 KB." },
  { q: "Why does the Indian visa form keep rejecting my photo?", a: "The form checks format, file size, shape and pixel size. The usual causes are a photo that is not exactly square, a file over 300 KB, or a PNG or HEIC file where a JPEG is required." },
  { q: "Can I use a phone photo?", a: "Yes, as long as it meets the visa's rules on pose, background and lighting. A phone photo is too large and not square, so it needs cropping and compressing first." },
  { q: "Is my photo uploaded to a server?", a: "No. FitTheFile resizes the image in your browser, so it never leaves your device." },
];

export default function IndiaVisaPhotoPost() {
  return (
    <ArticleWrapper>
      <Breadcrumb postTitle={post.title} />
      <article>
        <ArticleHeader title={post.title} date={post.date} readTime={post.readTime} />
        <ArticleBody>
          <P>
            The Indian online visa application is strict about the photo file. If the upload fails, the form does not always say why. This guide lists the four things it checks, according to the official upload guide, and shows how to fix each one with the free <Link href="/india-visa-photo-resizer" style={linkStyle}>India visa photo resizer</Link>.
          </P>
          <H2>The Four Checks</H2>
          <P>
            The <a href="https://indianvisaonline.gov.in/visa/VSS_IMAGE.pdf" target="_blank" rel="noopener noreferrer" style={linkStyle}>official photo upload guide</a> lists these conditions, and all of them are mandatory. The image format must be JPEG. The file size must be at least 10 KB and at most 300 KB. The height and width must be equal. The dimensions must be at least 350 × 350 pixels and at most 1000 × 1000 pixels.
          </P>
          <H2>Problem 1: The Photo Is Not Square</H2>
          <P>
            This is the most common cause. A phone photo is a rectangle, and the form needs equal height and width. Cropping by eye is rarely exact: even a few pixels off counts as not square. The resizer crops to an exact square, centred on the middle of your photo.
          </P>
          <H2>Problem 2: The File Is Too Big</H2>
          <P>
            A phone photo is usually several megabytes, far above the 300 KB limit. Shrinking it to 600 × 600 pixels and saving at a sensible quality brings it well under 300 KB while keeping your face sharp.
          </P>
          <H2>Problem 3: The Wrong Format</H2>
          <P>
            The form only takes JPEG. iPhones often save HEIC, and screenshots are PNG. The resizer accepts JPG, PNG and WebP and always saves a JPEG. For an iPhone HEIC photo, convert it first with <Link href="/heic-to-jpg" style={linkStyle}>HEIC to JPG</Link>.
          </P>
          <H2>Problem 4: Too Few or Too Many Pixels</H2>
          <P>
            A heavily cropped photo can fall below 350 pixels a side, and an original camera photo is far above 1000. Choose 600 × 600 for a safe middle size, or the smallest or largest size the form allows.
          </P>
          <CtaBox toolSlug="india-visa-photo-resizer" toolName="India Visa Photo Resizer" />
          <H2>What the Tool Does Not Check</H2>
          <P>
            File rules are only half of it. Your photo also has to meet the visa's rules on pose, background, lighting and how recent it is, and the e-Visa form states its own limits on its upload page. Read the instructions on the form you are filling in before you submit.
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
