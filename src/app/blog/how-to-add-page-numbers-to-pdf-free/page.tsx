import type { Metadata } from "next";
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

const post = getBlogPost("how-to-add-page-numbers-to-pdf-free")!;

export const metadata: Metadata = {
  title: `${post.title} | ConvertNest`,
  description: post.description,
  keywords: post.keywords,
  openGraph: {
    title: post.title,
    description: post.description,
    siteName: "ConvertNest",
    type: "article",
    publishedTime: post.date,
  },
};

export default function AddPageNumbersBlogPost() {
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
            Page numbers seem like a small detail, but they make a big
            difference. Whether you are submitting a thesis, sharing a report
            with a client, or organizing a legal document, numbered pages help
            everyone navigate the document and reference specific sections
            easily.
          </P>

          <H2>Why Add Page Numbers to a PDF?</H2>
          <P>
            Printed documents almost always need page numbers. Without them,
            dropping a stack of printed pages means you have no way to
            reassemble them in order. Digital documents benefit too — page
            numbers make it easy to say &ldquo;see page 14&rdquo; in an email
            or meeting, and they look more polished and professional.
          </P>
          <P>
            Many document editors add page numbers before exporting to PDF, but
            if you have a PDF that is already finalized — or one you received
            from someone else — you need a tool that can stamp numbers onto the
            existing pages.
          </P>

          <H2>Method 1: Use a Free Online Tool</H2>
          <P>
            The simplest way to add page numbers is with a browser-based tool
            like ConvertNest. Upload your PDF, choose where you want the numbers
            (top or bottom of the page, left, center, or right), pick a starting
            number, and download the result. Everything runs in your browser, so
            your document stays private.
          </P>
          <P>
            This approach works on any device — Windows, Mac, Linux,
            Chromebook, even a phone in a pinch. No installations, no signups,
            and no watermarks on your document.
          </P>

          <CtaBox toolSlug={post.relatedTool} toolName={post.relatedToolName} />

          <H2>Method 2: Use Microsoft Word</H2>
          <P>
            If you have Microsoft Word, you can open a PDF, let Word convert it
            to an editable document, insert page numbers through Insert &rarr;
            Page Number, and then export back to PDF. This works, but the
            conversion can break formatting — tables shift, fonts change, and
            images move around. For simple text documents it is fine, but for
            anything with complex layouts, an online tool is safer.
          </P>

          <H2>Method 3: Use Adobe Acrobat</H2>
          <P>
            Adobe Acrobat Pro lets you add headers, footers, and page numbers
            with precise control over fonts, sizes, and positioning. You can
            also set different numbering for different sections (Roman numerals
            for the introduction, Arabic numerals for the body). It is the most
            flexible option, but it requires a paid subscription.
          </P>

          <H2>Choosing Position and Format</H2>
          <P>
            The most common placement is centered at the bottom of the page —
            it is unobtrusive and universally understood. For documents that will
            be bound or hole-punched, bottom-right or bottom-left avoids the
            binding edge. Academic papers sometimes use top-right numbering to
            match style guide requirements.
          </P>
          <P>
            For the number format, simple Arabic numerals (1, 2, 3) work for
            most purposes. Some formal documents use &ldquo;Page 1 of 10&rdquo;
            format, which immediately tells the reader how long the document is.
          </P>

          <H2>Tips for Page Numbering</H2>
          <P>
            If your PDF has a cover page, you probably want to start numbering
            from the second page. Most tools let you set a starting page — in
            ConvertNest, just set &ldquo;Start from page&rdquo; to 2 and
            optionally adjust the starting number.
          </P>
          <P>
            For documents you plan to print double-sided, make sure the page
            numbers are consistently positioned so they appear on the same side
            of every printed sheet. Center-bottom is the safest choice for
            double-sided printing since it looks correct on both left and right
            pages.
          </P>
          <P>
            Adding page numbers takes just a few seconds with the right tool.
            For a quick, free solution that does not touch your formatting,
            an online tool like ConvertNest is hard to beat.
          </P>
        </ArticleBody>
      </article>

      <FaqSchema
        faqs={[
          { question: "Can I add page numbers to a PDF without Adobe?", answer: "Yes. Free online tools like ConvertNest let you add page numbers with custom positioning, formatting, and starting numbers — no software download needed." },
          { question: "How do I skip page numbers on the first page?", answer: "Most PDF page number tools offer a 'skip first page' option. In ConvertNest, simply toggle the 'Skip first page' switch before processing." },
        ]}
      />
      <section style={{ marginTop: "2.5rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "1rem" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            { q: "Can I add page numbers to a PDF without Adobe?", a: "Yes. Free online tools like ConvertNest let you add page numbers with custom positioning, formatting, and starting numbers — no software download needed." },
            { q: "How do I skip page numbers on the first page?", a: "Most PDF page number tools offer a 'skip first page' option. In ConvertNest, simply toggle the 'Skip first page' switch before processing." },
          ].map((faq, i) => (
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
