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

const post = getBlogPost("file-size-too-large-upload-fix")!;

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
  {
    q: "Why does the site say my file is too large?",
    a: "The website has a maximum upload size, and your file is over it. Many job, exam and government portals set limits as low as 100KB or 200KB, while a phone photo or scan is often several megabytes. The fix is to compress the file below the stated limit.",
  },
  {
    q: "How do I make a PDF smaller for upload?",
    a: "Use a tool that targets the exact limit, such as FitTheFile's Compress PDF to 200KB. It turns each page into an image and finds the best quality that fits, which works well for scans and forms. If the limit is generous, the regular Compress PDF tool lets you pick a quality preset instead. Both turn pages into images, so keep your original if you need selectable text.",
  },
  {
    q: "The tool couldn't reach my target size. What now?",
    a: "This can happen with long PDFs, because every page needs some space. Remove pages you don't need with Split PDF, check whether the portal accepts a larger size, or compress one page at a time if the form allows several uploads.",
  },
  {
    q: "Are my documents safe?",
    a: "Yes. FitTheFile runs in your browser, so your files are never uploaded to a server. They stay on your device the whole time.",
  },
];

export default function FileTooLargePost() {
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
            If a website says your file is too large to upload, compress it to
            just under the stated limit: use{" "}
            <Link href="/compress-pdf-to-200kb" style={linkStyle}>Compress PDF to 200KB</Link>{" "}
            (or the{" "}
            <Link href="/compress-pdf-to-100kb" style={linkStyle}>100KB</Link>{" "}
            and{" "}
            <Link href="/compress-pdf-to-500kb" style={linkStyle}>500KB</Link>{" "}
            versions) for PDFs, and{" "}
            <Link href="/compress-image-to-50kb" style={linkStyle}>Compress Image to 50KB</Link>{" "}
            or a similar size tool for photos. Both run free in your browser
            and take a few seconds.
          </P>
          <P>
            Below is a quick way to figure out which tool you need and what to
            do when a file just won&rsquo;t shrink enough.
          </P>

          <H2>Step 1: Find the Exact Limit</H2>
          <P>
            Look for the size rule next to the upload button or in the
            form&rsquo;s instructions. It&rsquo;s usually written as something
            like &ldquo;max 200KB&rdquo; or &ldquo;file size must not exceed
            1MB&rdquo;. Many job and exam portals cap uploads at 100KB or less
            for photos and signatures, while document uploads are often a bit
            more generous.
          </P>
          <P>
            Remember that 1MB is roughly 1,000KB. A 2MB file going into a 200KB
            slot needs to become about ten times smaller.
          </P>

          <H2>Step 2: Shrink a PDF That&rsquo;s Too Big</H2>
          <P>
            For scanned certificates, mark sheets, IDs and signed forms, the
            size-targeted tools are the fastest fix. Pick the one that matches
            your limit:
          </P>
          <P>
            <Link href="/compress-pdf-to-100kb" style={linkStyle}>Compress PDF to 100KB</Link>{" "}
            &middot;{" "}
            <Link href="/compress-pdf-to-200kb" style={linkStyle}>Compress PDF to 200KB</Link>{" "}
            &middot;{" "}
            <Link href="/compress-pdf-to-500kb" style={linkStyle}>Compress PDF to 500KB</Link>
          </P>
          <P>
            These tools turn each page into an image and find the highest
            quality that fits. That means the text in the result can&rsquo;t be
            selected or searched, which is fine for a scan but worth knowing for
            a typed document. Very long PDFs may not fit under small limits;
            if so, the tool tells you and shows the smallest size it reached.
          </P>
          <P>
            If the limit is generous and you&rsquo;d rather choose a quality
            preset yourself, try the regular{" "}
            <Link href="/compress-pdf" style={linkStyle}>Compress PDF</Link>{" "}
            tool. It also saves pages as images, so keep your original if you
            need selectable text.
          </P>

          <CtaBox toolSlug="compress-pdf-to-200kb" toolName="Compress PDF to 200KB" />

          <H2>Step 3: Shrink a Photo or Signature</H2>
          <P>
            For photos, use the image size tools:{" "}
            <Link href="/compress-image-to-20kb" style={linkStyle}>20KB</Link>,{" "}
            <Link href="/compress-image-to-50kb" style={linkStyle}>50KB</Link>,{" "}
            <Link href="/compress-image-to-100kb" style={linkStyle}>100KB</Link>{" "}
            or{" "}
            <Link href="/compress-image-to-200kb" style={linkStyle}>200KB</Link>.
            Each one outputs a JPG at the highest quality that fits, and only
            reduces the dimensions if it has to.
          </P>
          <P>
            For the sharpest result at very small sizes, crop away extra
            background first with{" "}
            <Link href="/image-crop" style={linkStyle}>Image Crop</Link>. If the
            form asks for specific pixel dimensions, set them with{" "}
            <Link href="/image-resizer" style={linkStyle}>Image Resizer</Link>{" "}
            before compressing.
          </P>

          <H2>When the File Still Won&rsquo;t Fit</H2>
          <P>
            <strong>Cut pages.</strong> If the portal only needs one or two
            pages, keep just those with{" "}
            <Link href="/split-pdf" style={linkStyle}>Split PDF</Link>. Fewer
            pages compress much further.
          </P>
          <P>
            <strong>Rescan more simply.</strong> A grayscale or black-and-white
            scan of a paper document is far smaller than a colour photo of it.
          </P>
          <P>
            <strong>Check the file type.</strong> Some forms want a JPG, not a
            PDF, or the other way round. Wrong formats are sometimes reported
            as a size error. Our{" "}
            <Link href="/jpg-to-pdf" style={linkStyle}>JPG to PDF</Link> and{" "}
            <Link href="/pdf-to-jpg" style={linkStyle}>PDF to JPG</Link> tools
            can switch between them.
          </P>

          <H2>Before You Hit Submit</H2>
          <P>
            Open the compressed file and zoom in. Make sure names, numbers and
            signatures are still readable, because a file that&rsquo;s small
            but illegible can get your application rejected later. Keep the
            original too, in case you need to try a different size.
          </P>
          <P>
            And since everything runs in your browser, you can do all of this
            on a shared or office computer without your documents being sent
            anywhere. Close the tab when you&rsquo;re done and nothing is left
            behind on a server.
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
