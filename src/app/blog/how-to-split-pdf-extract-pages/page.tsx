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

const post = getBlogPost("how-to-split-pdf-extract-pages")!;

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

export default function SplitPdfBlogPost() {
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
            PDFs are great for sharing finalized documents, but they are not
            designed for easy editing. When you only need a few pages from a
            50-page report, or you want to remove sensitive pages before
            forwarding a document, splitting the PDF is the answer. Here are
            three ways to do it for free.
          </P>

          <H2>When You Need to Split a PDF</H2>
          <P>
            There are more situations than you might think. Students extract
            individual chapters from textbooks for study sessions. Office
            workers pull out specific invoices from a batch scan. Legal teams
            separate exhibits from lengthy filings. Real estate agents extract
            individual listing sheets from a multi-property brochure. In every
            case, the goal is the same: get exactly the pages you need, without
            the ones you do not.
          </P>

          <H2>Method 1: Use ConvertNest (Easiest)</H2>
          <P>
            ConvertNest&rsquo;s{" "}
            <Link href="/split-pdf" style={{ color: "var(--primary)" }}>
              Split PDF
            </Link>{" "}
            tool gives you a visual page selector. Upload your PDF, see
            thumbnail previews of every page, then click to select the pages
            you want to extract. You can pick individual pages, ranges, or any
            combination. Hit download and you get a new PDF with just your
            selected pages. Everything happens in your browser — your document
            never gets uploaded anywhere.
          </P>
          <P>
            This is the fastest approach for occasional use. No software to
            install, no account to create, and the visual previews mean you can
            verify you are grabbing the right pages before extracting them.
          </P>

          <H2>Method 2: Use Preview on Mac</H2>
          <P>
            If you are on a Mac, the built-in Preview app can split PDFs. Open
            the PDF, go to View &rarr; Thumbnails to see all pages in the
            sidebar, select the pages you want (hold Command to pick
            multiple), then drag them to your desktop to create a new PDF. You
            can also use File &rarr; Print and select specific page ranges,
            then save as PDF.
          </P>
          <P>
            This works fine for simple extractions, but it can be cumbersome
            with large documents. There is no easy way to visually preview the
            pages before extraction if the sidebar thumbnails are too small to
            read.
          </P>

          <H2>Method 3: Use Google Chrome</H2>
          <P>
            Chrome&rsquo;s built-in PDF viewer has a hidden split feature. Open
            the PDF in Chrome, press Ctrl+P (or Cmd+P on Mac) to open the
            print dialog, choose &ldquo;Save as PDF&rdquo; as the destination,
            and type specific page numbers in the Pages field (for example,
            &ldquo;1-3, 7, 12-15&rdquo;). Click Save and you get a new PDF
            with only those pages.
          </P>
          <P>
            This method works on any operating system where Chrome is installed.
            The limitation is that you need to know the exact page numbers in
            advance — there are no visual previews to help you pick.
          </P>

          <CtaBox toolSlug={post.relatedTool} toolName={post.relatedToolName} />

          <H2>Tips for Splitting PDFs</H2>
          <P>
            Always keep the original file intact. Split into a new document
            rather than deleting pages from the source, so you can go back if
            you extracted the wrong pages. If your PDF was created from a scan,
            the file size of the extracted pages will be proportional to the
            number of pages — splitting a 20 MB scanned document in half gives
            you roughly two 10 MB files. For scanned PDFs that are still too
            large after splitting, run the result through a{" "}
            <Link href="/compress-pdf" style={{ color: "var(--primary)" }}>
              PDF compressor
            </Link>{" "}
            to shrink it further.
          </P>
          <P>
            If you need to do the opposite — combine several PDFs into one —
            check out our guide on{" "}
            <Link
              href="/blog/how-to-merge-pdf-files-free"
              style={{ color: "var(--primary)" }}
            >
              how to merge PDF files
            </Link>
            .
          </P>
        </ArticleBody>
      </article>
      <RelatedPosts currentSlug={post.slug} />
    </ArticleWrapper>
  );
}
