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
import { DEFAULT_OG_IMAGES } from "@/lib/site";

const post = getBlogPost("how-to-compress-pdf-without-losing-quality")!;

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

export default function CompressPdfBlogPost() {
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
            If you have ever tried to email a PDF only to get a &ldquo;file too
            large&rdquo; error, you know the frustration. Large PDFs are a
            common headache for students, professionals, and anyone who works
            with documents regularly. The good news is that you can significantly
            reduce PDF file size without any visible loss in quality.
          </P>

          <H2>Why Are PDF Files So Large?</H2>
          <P>
            PDF file size depends on what is inside the document. Scanned pages
            are essentially images, so they tend to be enormous — a single
            scanned page can be 2-5 MB. PDFs with embedded fonts, high-resolution
            photos, or complex vector graphics also add up fast. Even a
            straightforward text document can balloon in size if the authoring
            tool embeds every font variant and stores redundant metadata.
          </P>
          <P>
            Understanding what makes your PDF large helps you pick the right
            compression approach. Image-heavy documents benefit the most from
            compression, while text-only PDFs are already fairly lean.
          </P>

          <H2>Method 1: Use an Online Compressor (Easiest)</H2>
          <P>
            The fastest way to shrink a PDF is with a free online tool like
            FitTheFile. You simply upload your file, choose a compression level,
            and download the smaller version. No software to install, no account
            to create, and your file never leaves your browser — the compression
            happens entirely on your device.
          </P>
          <P>
            FitTheFile offers four compression presets: Maximum Quality (keeps
            the file nearly identical), High, Recommended (a balanced option that
            works well for most documents), and Minimum Size for when you need
            the smallest file possible. For most use cases, the Recommended
            preset often shrinks scanned and image-heavy PDFs by half or more while staying readable. Results vary by document, so check the output before you send it.
            Each page is saved as an image, so text in the compressed file
            can&rsquo;t be selected or searched — keep your original if you need that.
          </P>

          <CtaBox toolSlug={post.relatedTool} toolName={post.relatedToolName} />

          <H2>Method 2: Use Preview on Mac</H2>
          <P>
            If you are on a Mac, the built-in Preview app can reduce PDF size.
            Open the PDF in Preview, go to File &rarr; Export, choose
            &ldquo;Reduce File Size&rdquo; from the Quartz Filter dropdown, and
            save. This method is free and requires no additional software.
          </P>
          <P>
            The downside is that Preview&rsquo;s compression is aggressive —
            images can come out noticeably blurry. You also cannot choose a
            quality level. For documents with charts, photos, or diagrams, an
            online compressor with adjustable settings will give better results.
          </P>

          <H2>Method 3: Use Adobe Acrobat</H2>
          <P>
            Adobe Acrobat Pro offers granular control over PDF compression. You
            can adjust image downsampling, choose JPEG or ZIP compression for
            different image types, and strip unnecessary metadata. It is the most
            powerful option, but it requires a paid subscription starting at
            around $20/month.
          </P>
          <P>
            For occasional use, a free tool is usually more practical. Acrobat
            makes sense if you work with PDFs professionally and need advanced
            features like batch processing or custom optimization profiles.
          </P>

          <H2>Tips for the Best Compression Results</H2>
          <P>
            Start with the lightest compression that meets your needs — you can
            always compress again if the file is still too large. If your PDF
            contains scanned pages, make sure the original scan was at a
            reasonable resolution (150-200 DPI is enough for most documents).
            Higher DPI scans look the same on screen but take up much more space.
          </P>
          <P>
            Before compressing, remove any pages you do not need. Fewer pages
            means a smaller file, and tools like FitTheFile&rsquo;s Split PDF
            can help you extract just the pages that matter.
          </P>

          <H2>Which Method Should You Choose?</H2>
          <P>
            For most people, an online compressor is the best choice. It is
            free, fast, works on any device, and gives you control over the
            quality-to-size tradeoff. Use Preview if you are on a Mac and need a
            quick fix. Choose Acrobat if you compress PDFs daily and need
            professional features. Whatever you choose, there is no reason to
            struggle with oversized PDFs anymore.
          </P>
        </ArticleBody>
      </article>

      <FaqSchema
        faqs={[
          { question: "Does compressing a PDF reduce quality?", answer: "It depends on the method. Lossless compression reduces size without any quality loss. Lossy compression sacrifices some image quality for smaller files. FitTheFile's compressor is lossy: it re-saves each page as an image at the level you choose, which shrinks files a lot but means text is no longer selectable." },
          { question: "What is a good PDF file size?", answer: "For email attachments, under 10MB is ideal. For web uploads, under 5MB works best. Most PDFs can be compressed by 50-80% without noticeable quality loss." },
          { question: "Is it safe to compress PDFs online?", answer: "With browser-based tools like FitTheFile, your files are never uploaded to a server. All processing happens locally in your browser, keeping your documents completely private." },
        ]}
      />
      <section style={{ marginTop: "2.5rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "1rem" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            { q: "Does compressing a PDF reduce quality?", a: "It depends on the method. Lossless compression reduces size without any quality loss. Lossy compression sacrifices some image quality for smaller files. FitTheFile's compressor is lossy: it re-saves each page as an image at the level you choose, which shrinks files a lot but means text is no longer selectable." },
            { q: "What is a good PDF file size?", a: "For email attachments, under 10MB is ideal. For web uploads, under 5MB works best. Most PDFs can be compressed by 50-80% without noticeable quality loss." },
            { q: "Is it safe to compress PDFs online?", a: "With browser-based tools like FitTheFile, your files are never uploaded to a server. All processing happens locally in your browser, keeping your documents completely private." },
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
