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

const post = getBlogPost("how-to-compress-pdf-to-200kb")!;

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
  { q: "Can any PDF be compressed to 200KB?", a: "No. Every page needs some space to stay readable, so a long or photo-heavy PDF may not fit. If the target can't be reached, the tool says so and shows the smallest size it managed. Try a larger target, or split the PDF and compress the parts." },
  { q: "Can I still select or search the text afterwards?", a: "No. To fit under a size limit each page is saved as an image, so text in the compressed PDF can't be selected or searched. Keep your original file." },
  { q: "How many pages can the PDF have?", a: "Up to 60 pages. For a longer PDF, split it first." },
  { q: "What if my PDF is already under 200KB?", a: "The tool tells you it is already under the limit and makes no changes." },
  { q: "Is my PDF uploaded to a server?", a: "No. The compression runs in your browser, so the file never leaves your device." },
];

export default function CompressPdfTo200kbPost() {
  return (
    <ArticleWrapper>
      <Breadcrumb postTitle={post.title} />
      <article>
        <ArticleHeader title={post.title} date={post.date} readTime={post.readTime} />
        <ArticleBody>
          <P>
            Many government, visa and certificate upload forms cap a PDF at 200KB. To get under that limit, open the free <Link href="/compress-pdf-to-200kb" style={linkStyle}>Compress PDF to 200KB</Link> tool and drop in your file. It finds the best quality that fits under 200KB and shows you the final size before you download.
          </P>
          <H2>Step by Step</H2>
          <P>
            The target size box is already set to 200 KB. Drop your PDF on the page or tap to choose it. The tool works through the pages, then shows the result: the new size, the page count, and the resolution and quality it used. Press Download PDF. If you need a different limit, type another number in the box and press the button next to it to compress again.
          </P>
          <H2>How It Works</H2>
          <P>
            The tool rebuilds every page as an image. It starts at a sharp resolution and looks for the highest quality that fits under your limit. Only if that is not enough does it step down to a lower resolution and try again. Everything happens in your browser, so the file is not uploaded anywhere.
          </P>
          <H2>What to Expect at 200KB</H2>
          <P>
            We ran the tool on two files (tested November 2026). A 1-page scanned certificate of 419KB came out at 191.2 KB, rendered at 120 DPI. A 3-page scanned document of 1.2MB came out at 193.2 KB, at 72 DPI. More pages means less space for each page, so each one is saved at a lower resolution. Your own results depend on what is in your file.
          </P>
          <CtaBox toolSlug="compress-pdf-to-200kb" toolName="Compress PDF to 200KB" />
          <H2>The Limits You Should Know</H2>
          <P>
            Text in the compressed PDF is not selectable or searchable, because each page is now an image. That is fine for an upload form, but keep your original. The tool handles up to 60 pages. If the PDF is password-protected, it asks you to unlock it first, which you can do with <Link href="/pdf-unlock" style={linkStyle}>PDF Unlock</Link>.
          </P>
          <P>
            A PDF that is mostly text is already compact, and turning its pages into images can make it bigger. If the tool can't get such a file under the limit, it gives you back your original and says so, instead of handing you a larger file.
          </P>
          <H2>If It Won't Fit</H2>
          <P>
            When a PDF has too many pages for 200KB, the tool shows the smallest size it reached. You then have two choices: type a larger target if your form allows one, or use <Link href="/split-pdf" style={linkStyle}>Split PDF</Link> to pull out only the pages the form needs and compress those. Before you upload, open the result and check that stamps, seals, signatures and small print are still readable.
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
