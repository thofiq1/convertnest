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

const post = getBlogPost("ilovepdf-alternative-free")!;

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
  { q: "Is there a free iLovePDF alternative that doesn\u2019t upload my files?", a: "Yes. FitTheFile runs every tool in your browser, so your PDFs and photos are never uploaded to a server. It\u2019s free with no account." },
  { q: "Can FitTheFile compress a PDF to an exact size like 100KB?", a: "It compresses to under the size you enter, keeping as much quality as possible. Very large or very long PDFs may not fit under small limits like 50KB; the tool tells you honestly if it can\u2019t reach the target." },
  { q: "Does FitTheFile have OCR or PDF to Word?", a: "No. For OCR and converting PDFs into editable Word or Excel files, iLovePDF Premium or another full PDF suite is the right tool." },
];

export default function IlovepdfAlternativePost() {
  return (
    <ArticleWrapper>
      <Breadcrumb postTitle={post.title} />
      <article>
        <ArticleHeader title={post.title} date={post.date} readTime={post.readTime} />
        <ArticleBody>
          <P>
            iLovePDF is a solid, well-known PDF toolkit with a generous free tier. Its free plan still caps files per task (for example, two files at a time for Compress PDF), shows ads, and keeps OCR conversions and some AI tools for Premium, and your files are processed on its servers. FitTheFile is a lighter, free alternative for the everyday jobs: shrinking files to fit upload limits, merging, splitting and converting, all inside your browser.
          </P>
          <H2>The Short Answer</H2>
          <P>
            <strong>Use FitTheFile</strong> when a portal says “maximum 100KB” or “signature under 20KB” and you want a file that fits on the first try. Type the limit into the <Link href="/compress-pdf-to-100kb" style={linkStyle}>PDF size tool</Link> or <Link href="/compress-image-to-20kb" style={linkStyle}>image size tool</Link> and it finds the best quality under it. Nothing is uploaded and there’s no account.
          </P>
          <P>
            <strong>Use iLovePDF</strong> for PDF to Word or Excel with OCR, editing and signing, PDF/A, repair, desktop and mobile apps, or very large batches. FitTheFile doesn’t offer those.
          </P>
          <H2>How They Compare</H2>
          <P>
            <strong>Privacy:</strong> iLovePDF uploads files to its servers to process them. FitTheFile processes everything locally in your browser, so the file never leaves your device.
          </P>
          <P>
            <strong>Hitting an exact upload limit:</strong> iLovePDF’s compressor offers compression levels. FitTheFile lets you enter the exact maximum size in KB and finds the highest quality that fits. That’s the main reason FitTheFile exists.
          </P>
          <P>
            <strong>Text after compression:</strong> iLovePDF’s standard compression keeps PDF text selectable. FitTheFile’s target-size tools save pages as images to reach strict limits, so text isn’t selectable afterwards. FitTheFile’s regular Compress PDF tool is the gentler option.
          </P>
          <P>
            <strong>Price:</strong> both are free for basic use. According to iLovePDF’s pricing page (checked in November 2026), Premium costs US$9 per month, or US$5 per month billed annually, and removes ads and limits. FitTheFile has no paid plan; it’s ad-supported.
          </P>
          <CtaBox toolSlug="compress-image-to-50kb" toolName="Compress Image to 50KB" />
          <H2>Bottom Line</H2>
          <P>
            iLovePDF is the better all-in-one PDF suite. FitTheFile is the quicker free choice when you need a file under a specific size, or simply don’t want to upload private documents. Many people keep both bookmarked.
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
