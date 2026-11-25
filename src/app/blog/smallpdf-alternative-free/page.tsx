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

const post = getBlogPost("smallpdf-alternative-free")!;

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
  { q: "Is FitTheFile really free?", a: "Yes. Every tool is free with no account and no daily limit. The site is supported by ads." },
  { q: "Is FitTheFile safer than Smallpdf for private documents?", a: "FitTheFile never uploads your file: all processing happens in your browser. Smallpdf uploads files to its servers and says it deletes them afterwards. If you prefer documents never to leave your device, FitTheFile avoids the upload entirely." },
  { q: "Can FitTheFile edit the text in a PDF?", a: "No. FitTheFile focuses on compressing, merging, splitting, converting and fitting files under upload limits. For editing existing PDF text, a full editor like Smallpdf Pro or Adobe Acrobat is the better choice." },
  { q: "Why can\u2019t I select text after compressing to 100KB?", a: "To guarantee a small size, the target-size tools save each page as an image. That works well for uploads, but the text is no longer selectable. If you need selectable text, use the regular Compress PDF tool or keep the original." },
];

export default function SmallpdfAlternativePost() {
  return (
    <ArticleWrapper>
      <Breadcrumb postTitle={post.title} />
      <article>
        <ArticleHeader title={post.title} date={post.date} readTime={post.readTime} />
        <ArticleBody>
          <P>
            Smallpdf is one of the most popular PDF sites, and for good reason: it’s polished and has a tool for almost everything. But its free plan limits how many documents you can download, keeps some features (like its strongest compression and text editing) for Pro, and every file you use is uploaded to its servers. If you mainly need to shrink, merge, split or convert files, FitTheFile does that for free, with no account, and your files never leave your browser.
          </P>
          <P>
            This page is an honest comparison. Smallpdf is better at some things, and we’ll say which.
          </P>
          <H2>The Short Answer</H2>
          <P>
            <strong>Use FitTheFile</strong> if you need to get a PDF or photo under an upload limit (for example a <Link href="/compress-pdf-to-100kb" style={linkStyle}>PDF under 100KB</Link> or a <Link href="/compress-image-to-50kb" style={linkStyle}>photo under 50KB</Link>), you don’t want to create an account, or you’d rather not upload documents like ID scans and certificates to a third-party server.
          </P>
          <P>
            <strong>Use Smallpdf</strong> if you need to edit the text inside a PDF, convert PDFs to Word or Excel with OCR, collect e-signatures, or work on mobile through an app. FitTheFile doesn’t do those.
          </P>
          <H2>Where FitTheFile Is Different</H2>
          <P>
            <strong>Your files stay on your device.</strong> Smallpdf processes files on its servers (it says it deletes them afterwards). FitTheFile runs every tool inside your browser using JavaScript, so the file is never uploaded. You can check this yourself: open your browser’s developer tools, go to the Network tab, and watch &mdash; your file isn’t sent anywhere.
          </P>
          <P>
            <strong>You choose the exact limit.</strong> Instead of picking “low”, “medium” or “high” compression and hoping, you type the maximum size the form allows. The <Link href="/compress-pdf-to-200kb" style={linkStyle}>PDF</Link> and <Link href="/compress-image-to-100kb" style={linkStyle}>image</Link> size tools find the highest quality that fits under it.
          </P>
          <P>
            <strong>No account and no download cap.</strong> There’s nothing to sign up for and no daily or monthly limit. FitTheFile is free and supported by ads.
          </P>
          <H2>Where Smallpdf Is Better</H2>
          <P>
            Be honest with yourself about what you need. Smallpdf has more tools and some genuinely useful ones FitTheFile doesn’t have: editing existing PDF text, OCR when converting scans to Office files, e-signature workflows, and mobile apps.
          </P>
          <P>
            There’s also a real trade-off in how FitTheFile hits very small PDF sizes. To fit a strict limit, the size tools save each page as an image, so the text in the compressed PDF can’t be selected or searched. That’s fine for an upload portal, but not for a document you plan to edit. Very large PDFs also depend on your device’s memory, since nothing runs on a server.
          </P>
          <P>
            According to Smallpdf’s own plan comparison (checked in November 2026), the free plan has limited document downloads, while Strong Compression, Edit Text, batch processing and OCR for Office conversions are Pro features, with a 7-day free trial.
          </P>
          <CtaBox toolSlug="compress-pdf-to-100kb" toolName="Compress PDF to 100KB" />
          <H2>What You Can Do Free on FitTheFile</H2>
          <P>
            <Link href="/compress-pdf" style={linkStyle}>Compress PDF</Link>, <Link href="/merge-pdf" style={linkStyle}>Merge PDF</Link>, <Link href="/split-pdf" style={linkStyle}>Split PDF</Link>, <Link href="/rotate-pdf" style={linkStyle}>Rotate PDF</Link>, <Link href="/pdf-to-jpg" style={linkStyle}>PDF to JPG</Link>, <Link href="/jpg-to-pdf" style={linkStyle}>JPG to PDF</Link>, <Link href="/word-to-pdf" style={linkStyle}>Word to PDF</Link>, <Link href="/pdf-watermark" style={linkStyle}>PDF watermark</Link>, <Link href="/pdf-page-numbers" style={linkStyle}>page numbers</Link>, <Link href="/pdf-unlock" style={linkStyle}>unlock a PDF</Link> (with a password you know), plus image tools like <Link href="/image-compressor" style={linkStyle}>image compression</Link>, <Link href="/heic-to-jpg" style={linkStyle}>HEIC to JPG</Link> and <Link href="/image-resizer" style={linkStyle}>resizing</Link>.
          </P>
          <H2>Bottom Line</H2>
          <P>
            If your job is “make this file small enough to upload” or a quick merge or split, FitTheFile is the faster free option and keeps your documents private. If you need full PDF editing, OCR or e-signatures, Smallpdf’s paid plan is worth a look.
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
