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

const post = getBlogPost("how-to-compress-pdf-to-100kb")!;

export const metadata: Metadata = {
  title: post.title,
  alternates: { canonical: `/blog/${post.slug}` },
  description: post.description,
  keywords: post.keywords,
  openGraph: {
    title: post.title,
    description: post.description,
    siteName: "FitTheFile",
    type: "article",
    publishedTime: post.date,
  },
};

const linkStyle = { color: "var(--primary)" };

const faqs = [
  {
    q: "Can I compress any PDF to 100KB?",
    a: "Not always. A one- or two-page scan usually fits under 100KB, but a long PDF with many pages may not, because every page still needs some space to stay readable. If the target can't be reached, FitTheFile tells you and shows the smallest size it managed, so you can try a larger target such as 200KB or 500KB, or split the PDF first.",
  },
  {
    q: "Will I still be able to select or search the text?",
    a: "No. To fit under a size limit, the tool turns each page into an image, so the text in the output can't be selected, copied or searched. That's fine for scanned documents, certificates and forms you're uploading to a portal, but keep your original file if you need editable text.",
  },
  {
    q: "Is my PDF uploaded to a server?",
    a: "No. The compression runs entirely in your browser, so your file never leaves your device. That matters when the PDF is an ID, mark sheet or other personal document.",
  },
  {
    q: "What's the difference between this and the regular Compress PDF tool?",
    a: "The regular Compress PDF tool lets you pick a quality preset and keeps the file closer to the original. The 100KB, 200KB and 500KB tools work backwards from a size limit: you set the maximum, and the tool finds the best quality that fits under it.",
  },
];

export default function CompressPdfTo100kbPost() {
  return (
    <ArticleWrapper>
      <Breadcrumb postTitle={post.title} />
      <article>
        <ArticleHeader
          title={post.title}
          date={post.date}
          readTime={post.readTime}
        />
        <ArticleBody>
          <P>
            To compress a PDF to 100KB, open FitTheFile&rsquo;s free{" "}
            <Link href="/compress-pdf-to-100kb" style={linkStyle}>Compress PDF to 100KB</Link>{" "}
            tool, drop in your file, and download the result &mdash; it
            automatically finds the best quality that fits under the limit. If
            your portal allows a bit more room, use the{" "}
            <Link href="/compress-pdf-to-200kb" style={linkStyle}>200KB</Link> or{" "}
            <Link href="/compress-pdf-to-500kb" style={linkStyle}>500KB</Link>{" "}
            version instead for a sharper document.
          </P>
          <P>
            That&rsquo;s the short answer. Below is how it works, what to
            expect, and what to do if your file still won&rsquo;t fit.
          </P>

          <H2>Why Portals Ask for Such Small PDFs</H2>
          <P>
            Many job, exam, university and government portals cap uploads at
            100KB, 200KB or 500KB. They do it to keep their servers fast when
            thousands of people apply at once. The problem is that a single
            page scanned on a phone can easily be a few megabytes, so you hit
            the limit right when you&rsquo;re trying to finish an application.
          </P>
          <P>
            Always check the exact limit on the portal itself. Requirements
            vary by form and change over time, and it&rsquo;s the portal&rsquo;s
            instructions that count.
          </P>

          <H2>How to Compress a PDF to 100KB, Step by Step</H2>
          <P>
            1. Open the{" "}
            <Link href="/compress-pdf-to-100kb" style={linkStyle}>Compress PDF to 100KB</Link>{" "}
            tool. You can change the target to any size you need.
          </P>
          <P>
            2. Drop your PDF onto the page. Nothing is uploaded &mdash; the
            work happens in your browser.
          </P>
          <P>
            3. Wait a few seconds while the tool tries different quality
            levels and picks the highest one that stays under your limit.
          </P>
          <P>
            4. Check the result, then download it and upload it to the portal.
          </P>

          <CtaBox toolSlug="compress-pdf-to-100kb" toolName="Compress PDF to 100KB" />

          <H2>What Happens to Your PDF (Read This First)</H2>
          <P>
            To fit under a size limit, the tool turns each page of your PDF into an
            image and compresses those images until the file fits. That has a
            few honest trade-offs:
          </P>
          <P>
            <strong>Text is no longer selectable or searchable.</strong> The
            output looks like your document, but it&rsquo;s a picture of each
            page. You can&rsquo;t copy text out of it or search inside it.
          </P>
          <P>
            <strong>Scans and forms are the best fit.</strong> If your PDF is
            already a scan &mdash; a certificate, mark sheet, ID or signed form
            &mdash; you lose nothing, because it was an image to begin with.
          </P>
          <P>
            <strong>Long PDFs may not fit under 100KB.</strong> Every page needs
            some space to stay readable. If your file has many pages, the tool
            may not be able to get below 100KB. When that happens it tells you
            and shows the smallest size it reached, so you know where you
            stand.
          </P>
          <P>
            If you&rsquo;d rather pick a quality level yourself, use the regular{" "}
            <Link href="/compress-pdf" style={linkStyle}>Compress PDF</Link>{" "}
            tool. It also saves pages as images, but can&rsquo;t promise an
            exact size. Either way, keep your original if you need selectable text.
          </P>

          <H2>If It Still Won&rsquo;t Fit</H2>
          <P>
            Remove pages you don&rsquo;t need. Portals often want just the
            first page or a specific section, and{" "}
            <Link href="/split-pdf" style={linkStyle}>Split PDF</Link> lets you
            keep only those pages. Fewer pages means each one gets more of the
            size budget, so the result looks sharper.
          </P>
          <P>
            Check whether a larger size is allowed. Plenty of forms accept 200KB
            or 500KB, and the difference in readability is noticeable. Try the{" "}
            <Link href="/compress-pdf-to-200kb" style={linkStyle}>200KB tool</Link>{" "}
            or the{" "}
            <Link href="/compress-pdf-to-500kb" style={linkStyle}>500KB tool</Link>.
          </P>
          <P>
            Rescan at a lower resolution. If you&rsquo;re scanning a paper
            document, a plain black-and-white or grayscale scan compresses far
            better than a full-color photo of the page.
          </P>

          <H2>Bottom Line</H2>
          <P>
            For scanned documents and forms, compressing a PDF to 100KB takes
            about a minute and costs nothing. Just remember that the output is
            image-based, keep your original, and zoom in on the result before
            you submit to make sure every word is still readable.
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
