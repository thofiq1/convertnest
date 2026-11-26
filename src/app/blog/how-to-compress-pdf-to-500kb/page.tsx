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

const post = getBlogPost("how-to-compress-pdf-to-500kb")!;

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
  { q: "Will the text in my PDF still be selectable?", a: "No, not if the tool has to shrink the file. It saves each page as an image to reach the limit, so text can no longer be selected or searched. A PDF that is already under 500KB is returned unchanged." },
  { q: "How many pages can fit in 500KB?", a: "It depends on the pages. In our tests a 3-page scan fitted at 100 DPI and a 5-page scan at 72 DPI, both easy to read. A 17-page scan only fitted at 40 DPI, where small text is hard to read." },
  { q: "What if my PDF is password protected?", a: "Make an unlocked copy first with PDF Unlock, using the password you know, then compress that copy." },
  { q: "What does the tool do if it can't make the file smaller?", a: "If the result would be larger than your original, it gives you the original back and tells you so." },
  { q: "Is my PDF uploaded to a server?", a: "No. The PDF is processed in your browser and never leaves your device." },
];

export default function CompressPdfTo500kbPost() {
  return (
    <ArticleWrapper>
      <Breadcrumb postTitle={post.title} />
      <article>
        <ArticleHeader title={post.title} date={post.date} readTime={post.readTime} />
        <ArticleBody>
          <P>
            Email systems, job portals and university forms often cap a PDF at 500KB. To get under it, open the free <Link href="/compress-pdf-to-500kb" style={linkStyle}>Compress PDF to 500KB</Link> tool and drop in your file. The tool shows the final size, the page count and the resolution it used before you download.
          </P>
          <H2>Step by Step</H2>
          <P>
            The target box is already set to 500 KB. Drop your PDF on the page or tap to choose it. Wait while the pages are processed; a long document takes a few seconds. Check the size and resolution shown, then press Download. A PDF that is already under 500KB is returned as it is.
          </P>
          <H2>What to Expect</H2>
          <P>
            We ran the tool on four test files (November 2026). A 3-page scan of 2.0MB came out at 483.7 KB at 100 DPI. A 5-page scan of 3.2MB came out at 481.0 KB at 72 DPI. A 17-page scan of 8.7MB came out at 483.5 KB, but only at 40 DPI, where small text is hard to read. A 13-page text PDF of 63.5 KB was already under the limit and was returned unchanged. As a rough guide, 500KB suits scans of up to about five pages.
          </P>
          <CtaBox toolSlug="compress-pdf-to-500kb" toolName="Compress PDF to 500KB" />
          <H2>How It Works, and the Trade-off</H2>
          <P>
            The tool draws each page as an image and rebuilds the PDF from those images. It starts at a sharp resolution and steps down only as far as it must to fit. The cost is that text becomes part of the picture, so it can't be selected, searched or read by a screen reader. For a form upload that is usually fine. Keep your original for anything else.
          </P>
          <H2>If It Won't Fit Well</H2>
          <P>
            Send fewer pages. <Link href="/split-pdf" style={linkStyle}>Split PDF</Link> lets you keep only the pages the form asks for. If the limit applies to each file, split a long document into parts and upload them separately. If you only need a smaller file and not an exact limit, <Link href="/compress-pdf" style={linkStyle}>Compress PDF</Link> gives you a quality choice. For tighter limits there are tools for <Link href="/compress-pdf-to-200kb" style={linkStyle}>200KB</Link> and <Link href="/compress-pdf-to-100kb" style={linkStyle}>100KB</Link>.
          </P>
          <H2>Locked or Scanned-From-Phone Files</H2>
          <P>
            A password-protected PDF has to be unlocked first with <Link href="/pdf-unlock" style={linkStyle}>PDF Unlock</Link>. If your pages are phone photos and not a PDF yet, combine them with <Link href="/jpg-to-pdf" style={linkStyle}>JPG to PDF</Link> and then compress the result.
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
