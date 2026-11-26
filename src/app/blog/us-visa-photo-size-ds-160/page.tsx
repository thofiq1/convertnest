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

const post = getBlogPost("us-visa-photo-size-ds-160")!;

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
  { q: "What size is the US visa photo for the DS-160?", a: "The State Department's digital image requirements ask for a square JPEG between 600 × 600 and 1200 × 1200 pixels, with a file size of 240 kB or less." },
  { q: "Is 600 × 600 pixels accepted?", a: "600 × 600 is the minimum size on the official page, so it meets the dimension rule. It also leaves plenty of room under 240 kB." },
  { q: "Can I upload a PNG or HEIC photo?", a: "The official page asks for JPEG. FitTheFile's resizer reads JPG, PNG and WebP and always saves a JPEG. Convert an iPhone HEIC photo with HEIC to JPG first." },
  { q: "Does the resizer check my pose and background?", a: "No. It only handles size, shape and file size. Pose, background, lighting and how recent the photo is are covered on the State Department's photo requirements page, and you need to check those yourself." },
  { q: "Is my photo uploaded to a server?", a: "No. FitTheFile resizes the image in your browser, so it never leaves your device." },
];

export default function UsVisaPhotoSizePost() {
  return (
    <ArticleWrapper>
      <Breadcrumb postTitle={post.title} />
      <article>
        <ArticleHeader title={post.title} date={post.date} readTime={post.readTime} />
        <ArticleBody>
          <P>
            The online US visa application (DS-160) asks you to upload a digital photo, and the file has to match a short list of technical rules. This guide gives the official numbers, the file problems that get an upload rejected, and a quick way to fix them with the free <Link href="/us-visa-photo-resizer" style={linkStyle}>US visa photo resizer</Link>.
          </P>
          <H2>The Official Numbers</H2>
          <P>
            The U.S. Department of State lists these on its <a href="https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos/digital-image-requirements.html" target="_blank" rel="noopener noreferrer" style={linkStyle}>digital image requirements page</a>. The photo must be square, so the height equals the width. The dimensions must be at least 600 × 600 pixels and at most 1200 × 1200 pixels. The file size must be 240 kB or less. The format is JPEG. The colour is 24 bits per pixel in sRGB.
          </P>
          <H2>Rejection 1: The Photo Is Not Square</H2>
          <P>
            A phone photo is a rectangle. The rule is height equal to width, and cropping by eye rarely lands on an exact square. The resizer centres your photo and crops it to an exact square for you.
          </P>
          <H2>Rejection 2: The File Is Over 240 kB</H2>
          <P>
            A photo straight from a phone camera is usually far bigger than 240 kB. The resizer scales it to 600 × 600 or 1200 × 1200 pixels and saves it at the best quality that fits under 240KB.
          </P>
          <H2>Rejection 3: Too Few or Too Many Pixels</H2>
          <P>
            The allowed range is 600 to 1200 pixels a side. An original camera photo is well above that, and a heavily cropped one can fall below it. In the resizer, 600 × 600 is the minimum and the safest choice. 1200 × 1200 is the largest size allowed.
          </P>
          <H2>Rejection 4: The Wrong Format</H2>
          <P>
            The requirement is JPEG. Screenshots are usually PNG, and iPhones often save HEIC. The resizer accepts JPG, PNG and WebP and always saves a JPEG. For an iPhone HEIC photo, convert it first with <Link href="/heic-to-jpg" style={linkStyle}>HEIC to JPG</Link>.
          </P>
          <CtaBox toolSlug="us-visa-photo-resizer" toolName="US Visa Photo Resizer" />
          <H2>How to Make the File</H2>
          <P>
            Start with a straight-on photo against a plain white or off-white background, with your head centred. Open the resizer, choose 600 × 600 or 1200 × 1200, and drop the photo in. Check the preview, especially that your full head and the top of your shoulders are in frame, then download. Leave space around your head in the original, because the square crop removes the sides of a tall photo. If the framing is off, trim it with <Link href="/image-crop" style={linkStyle}>Image Crop</Link> and try again.
          </P>
          <H2>What the Tool Does Not Check</H2>
          <P>
            The resizer handles size, shape and file size only. Your photo also has to meet the State Department's rules on pose, background, lighting and how recent it is, and it must not be digitally altered to change your appearance. Check those on the official photo requirements page before you submit.
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
