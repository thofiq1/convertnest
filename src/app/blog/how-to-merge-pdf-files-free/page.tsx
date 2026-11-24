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

const post = getBlogPost("how-to-merge-pdf-files-free")!;

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

export default function MergePdfBlogPost() {
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
            Dealing with multiple PDF files when you need everything in one
            document is a common problem. Maybe you have separate scans of a
            signed contract, individual chapters of a report, or monthly
            invoices that need to go into a single file for your accountant.
            Whatever the reason, merging PDFs is straightforward when you know
            how.
          </P>

          <H2>When You Need to Merge PDFs</H2>
          <P>
            There are a few situations where combining PDFs comes up regularly.
            Freelancers and small business owners often need to merge invoices
            or receipts into a single document for tax purposes. Students
            combine assignment pages, reference materials, and cover sheets.
            Real estate agents merge disclosure forms, inspection reports, and
            contracts into one package for buyers.
          </P>
          <P>
            In all of these cases, sending one organized PDF is far better than
            attaching five or ten separate files to an email. It is easier for
            the recipient, looks more professional, and reduces the chance that
            a document gets lost.
          </P>

          <H2>Method 1: Use a Free Online Tool</H2>
          <P>
            The quickest way to merge PDFs is with a browser-based tool like
            FitTheFile. Upload your files (or drag and drop them), rearrange
            them in the order you want, and click merge. The combined PDF
            downloads to your device in seconds. All processing happens locally
            in your browser, so your documents stay private.
          </P>
          <P>
            This approach works on any device with a web browser — no
            installations needed. It is especially useful when you are on a
            work computer where you cannot install software or when you just
            need to combine a few files quickly.
          </P>

          <CtaBox toolSlug={post.relatedTool} toolName={post.relatedToolName} />

          <H2>Method 2: Use Preview on Mac</H2>
          <P>
            Mac users can merge PDFs using the built-in Preview app. Open the
            first PDF in Preview, show the sidebar (View &rarr; Thumbnails),
            then drag additional PDF files into the sidebar where you want them
            inserted. Save the result as a new file with File &rarr; Export as
            PDF.
          </P>
          <P>
            Preview is convenient because it comes with every Mac, but it can
            be fiddly with large documents or many files. Dragging pages into
            exactly the right position takes some care, and there is no bulk
            upload option.
          </P>

          <H2>Method 3: Use Adobe Acrobat</H2>
          <P>
            Adobe Acrobat Pro has a dedicated &ldquo;Combine Files&rdquo;
            feature that handles merging with full control. You can add files,
            reorder them, remove individual pages, and even mix PDFs with other
            file types like Word documents and images. Acrobat converts
            everything to PDF and merges it into one file.
          </P>
          <P>
            The tradeoff is cost — Acrobat Pro requires a subscription. For
            occasional merging, a free tool does the same job for the most
            common use case.
          </P>

          <H2>Tips for Merging PDFs</H2>
          <P>
            Before merging, check that your files are in the right order. Most
            tools let you reorder after uploading, but it saves time to name
            your files with numbers (01-cover.pdf, 02-report.pdf, etc.) so they
            sort correctly from the start.
          </P>
          <P>
            If some of your PDFs are scanned documents with large file sizes,
            consider compressing them first. Merging five uncompressed scans can
            produce a PDF that is too large to email. Compress each file before
            merging, or compress the final merged document afterward.
          </P>
          <P>
            Check the page orientation of each file too. If one document is
            landscape and the rest are portrait, the merged result can look
            inconsistent. FitTheFile&rsquo;s Rotate PDF tool can fix
            orientation before you merge.
          </P>
          <P>
            Merging PDFs does not have to be complicated. For most people, a
            free browser-based tool is the fastest path to a single, organized
            document.
          </P>
        </ArticleBody>
      </article>

      <FaqSchema
        faqs={[
          { question: "How many PDFs can I merge at once?", answer: "FitTheFile has no limit on the number of PDFs you can merge. Upload as many files as you need and drag them into your preferred order." },
          { question: "Will merging PDFs reduce quality?", answer: "No. Merging PDFs combines the original pages without any recompression, so quality remains exactly the same as the source files." },
        ]}
      />
      <section style={{ marginTop: "2.5rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "1rem" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            { q: "How many PDFs can I merge at once?", a: "FitTheFile has no limit on the number of PDFs you can merge. Upload as many files as you need and drag them into your preferred order." },
            { q: "Will merging PDFs reduce quality?", a: "No. Merging PDFs combines the original pages without any recompression, so quality remains exactly the same as the source files." },
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
