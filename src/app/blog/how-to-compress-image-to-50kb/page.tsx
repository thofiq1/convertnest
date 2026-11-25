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

const post = getBlogPost("how-to-compress-image-to-50kb")!;

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
    q: "How do I reduce a photo to exactly 50KB?",
    a: "Open FitTheFile's Compress Image to 50KB tool and drop in your photo. It finds the highest JPG quality that keeps the file under 50KB and only shrinks the dimensions if it has to. The result will be at or just under the limit rather than exactly 50KB, which is what upload forms want.",
  },
  {
    q: "Can I get a photo down to 20KB without it looking bad?",
    a: "Usually, yes, for a passport-style photo or a signature. Crop away the background first so the face or signature fills the frame, then use the 20KB tool. Large, detailed photos will look softer at 20KB because there's very little room to work with.",
  },
  {
    q: "Will my photo be converted to JPG?",
    a: "Yes. The tool always outputs a JPG, since that's the format most forms accept and the one that compresses photos best. You can drop in a JPG, PNG or WebP.",
  },
  {
    q: "Is my photo uploaded anywhere?",
    a: "No. Everything happens in your browser, so your photo stays on your device. Nothing is sent to a server.",
  },
];

export default function CompressImageTo50kbPost() {
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
            To compress a photo to 50KB, drop it into FitTheFile&rsquo;s free{" "}
            <Link href="/compress-image-to-50kb" style={linkStyle}>Compress Image to 50KB</Link>{" "}
            tool and download the JPG it gives you &mdash; it picks the highest
            quality that fits under 50KB automatically. Need it even smaller?
            The{" "}
            <Link href="/compress-image-to-20kb" style={linkStyle}>20KB version</Link>{" "}
            works the same way, and there&rsquo;s a{" "}
            <Link href="/compress-image-to-100kb" style={linkStyle}>100KB version</Link>{" "}
            when you have more room.
          </P>
          <P>
            Here&rsquo;s how it works and how to get the cleanest result,
            especially for passport photos and signatures.
          </P>

          <H2>Why Forms Want Tiny Photos</H2>
          <P>
            Many job, exam, visa and government application forms ask for a
            photo and a signature under a strict size, often somewhere between
            10KB and 100KB. A photo straight from your phone is usually several
            megabytes, so it gets rejected instantly.
          </P>
          <P>
            The exact limit &mdash; and often the required dimensions and
            background colour &mdash; is listed on the form itself. Check it
            before you start, because the size cap is only one of the rules.
          </P>

          <H2>How to Compress a Photo to 50KB</H2>
          <P>
            1. Open the{" "}
            <Link href="/compress-image-to-50kb" style={linkStyle}>Compress Image to 50KB</Link>{" "}
            tool. The target is set to 50KB, but you can type in any maximum,
            like 30 or 40.
          </P>
          <P>
            2. Drop in your photo. JPG, PNG and WebP all work.
          </P>
          <P>
            3. The tool tries the highest JPG quality first and steps down
            until the file fits. Only if the lowest sensible quality is still
            too big does it reduce the image dimensions.
          </P>
          <P>
            4. Check the preview, which shows the final size, dimensions and
            quality, then download the JPG.
          </P>

          <CtaBox toolSlug="compress-image-to-50kb" toolName="Compress Image to 50KB" />

          <H2>Getting a Passport Photo Down to 20KB</H2>
          <P>
            20KB is tight, but it&rsquo;s very doable for a head-and-shoulders
            photo if you set it up right.
          </P>
          <P>
            <strong>Crop first.</strong> Use{" "}
            <Link href="/image-crop" style={linkStyle}>Image Crop</Link> to cut
            away extra background so your face fills the frame. Less image
            means more of the size budget goes to the part that matters.
          </P>
          <P>
            <strong>Resize to the required dimensions.</strong> If the form
            asks for specific pixel dimensions, set them with{" "}
            <Link href="/image-resizer" style={linkStyle}>Image Resizer</Link>{" "}
            before compressing. A smaller image needs far less compression to
            hit 20KB, so it stays sharper.
          </P>
          <P>
            <strong>Use a plain background.</strong> Flat, even backgrounds
            compress much better than busy ones.
          </P>
          <P>
            Then run it through the{" "}
            <Link href="/compress-image-to-20kb" style={linkStyle}>20KB tool</Link>.
            Signatures work the same way: crop tight around the ink, and they
            usually come out crisp even at very small sizes.
          </P>

          <H2>Tips for a Cleaner Result</H2>
          <P>
            Start from the best original you have. A well-lit photo compresses
            better than a dark, grainy one, because noise eats up file size.
          </P>
          <P>
            Don&rsquo;t compress the same file over and over. Each round of
            JPG compression loses a little more detail, so always go back to
            the original and compress once.
          </P>
          <P>
            If the result looks too soft, the limit is doing that, not your
            photo. Crop tighter or resize smaller, then try again.
          </P>
          <P>
            Converting from PNG? Screenshots and PNG exports are often much
            larger than the same picture saved as a JPG, so don&rsquo;t worry
            if the starting size looks huge. The tool converts to JPG as part
            of the process.
          </P>

          <H2>Bottom Line</H2>
          <P>
            Reducing a photo to 50KB or 20KB takes seconds in your browser, and
            your photo never leaves your device. Crop and resize first, compress
            once, and check the form&rsquo;s other rules before you upload.
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
