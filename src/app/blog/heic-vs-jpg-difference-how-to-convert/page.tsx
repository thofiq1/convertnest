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

const post = getBlogPost("heic-vs-jpg-difference-how-to-convert")!;

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

export default function HeicVsJpgBlogPost() {
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
            If you have ever transferred photos from an iPhone to a Windows PC,
            you have probably run into HEIC files. They will not open in many
            apps, they can not be uploaded to some websites, and they confuse
            just about everyone who encounters them for the first time. Here is
            what HEIC actually is, why Apple uses it, and how to convert your
            files to the universal JPG format.
          </P>

          <H2>What Is HEIC?</H2>
          <P>
            HEIC stands for High Efficiency Image Container. It is an image
            format based on the HEVC (H.265) video codec, and it was adopted by
            Apple starting with iOS 11 in 2017. When you take a photo on a
            modern iPhone, it is saved as a HEIC file by default.
          </P>
          <P>
            The format is part of the broader HEIF (High Efficiency Image
            Format) standard. While HEIF is the standard, HEIC is Apple&rsquo;s
            specific implementation that uses HEVC compression. You will
            sometimes see the .heic or .heif file extension — for practical
            purposes, they are the same thing.
          </P>

          <H2>Why Does Apple Use HEIC Instead of JPG?</H2>
          <P>
            The main advantage is file size. HEIC files are roughly 50% smaller
            than equivalent JPG files at the same visual quality. For a phone
            that stores thousands of photos, that adds up — you can fit twice
            as many photos in the same storage space. HEIC also supports
            features that JPG cannot, like transparency (alpha channels), 16-bit
            color depth, and storing multiple images in a single file (which is
            how Live Photos work).
          </P>

          <H2>The Compatibility Problem</H2>
          <P>
            Despite its advantages, HEIC has a major drawback: limited
            compatibility. Windows did not add native HEIC support until Windows
            10 (and even then, it requires a free extension from the Microsoft
            Store). Many web browsers, social media platforms, and older software
            cannot open HEIC files at all.
          </P>
          <P>
            If you need to share photos with someone on Windows, upload images
            to a website, or use photos in a presentation or document, JPG is
            still the safest choice. It is universally supported and works
            everywhere.
          </P>

          <H2>HEIC vs JPG: Quick Comparison</H2>
          <P>
            In terms of quality, HEIC delivers better image quality at smaller
            file sizes thanks to more modern compression. JPG uses older
            compression technology (DCT-based) and needs larger files to achieve
            the same quality. For color depth, HEIC supports up to 16-bit
            color while JPG is limited to 8-bit. HEIC also supports
            transparency, which JPG does not.
          </P>
          <P>
            Where JPG wins decisively is compatibility. It works on every device,
            every browser, and every piece of software made in the last 30
            years. HEIC support is growing, but it is not there yet.
          </P>

          <H2>How to Convert HEIC to JPG</H2>
          <P>
            The easiest approach is a free online converter. With ConvertNest,
            you can drag and drop your HEIC files, and they are instantly
            converted to high-quality JPGs right in your browser. No upload to
            a server, no quality loss, and no signup required. You can convert
            multiple files at once, making it fast to process a whole batch of
            iPhone photos.
          </P>

          <CtaBox toolSlug={post.relatedTool} toolName={post.relatedToolName} />

          <P>
            On iPhone, you can also change the default camera format. Go to
            Settings &rarr; Camera &rarr; Formats and choose &ldquo;Most
            Compatible&rdquo; to shoot in JPG going forward. Keep in mind that
            your photos will take up more storage space.
          </P>

          <H2>Which Format Should You Use?</H2>
          <P>
            If you are only using Apple devices, HEIC is a great default — it
            saves space and preserves quality. The moment you need to share
            photos with non-Apple users, upload to a website, or use them in
            most editing software, convert to JPG first. The conversion is fast,
            free, and painless with the right tool.
          </P>
        </ArticleBody>
      </article>

      <FaqSchema
        faqs={[
          { question: "Why are my iPhone photos HEIC?", answer: "Apple uses HEIC (High Efficiency Image Container) as the default photo format since iOS 11 because it produces smaller files than JPG while maintaining the same quality." },
          { question: "Can Windows open HEIC files?", answer: "Windows 10 and 11 can open HEIC files after installing the HEIF Image Extensions from the Microsoft Store. For older systems, converting to JPG is the simplest solution." },
          { question: "Does converting HEIC to JPG lose quality?", answer: "There is minimal quality loss when converting HEIC to JPG at high quality settings (90%+). The difference is virtually undetectable to the human eye." },
        ]}
      />
      <section style={{ marginTop: "2.5rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "1rem" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            { q: "Why are my iPhone photos HEIC?", a: "Apple uses HEIC (High Efficiency Image Container) as the default photo format since iOS 11 because it produces smaller files than JPG while maintaining the same quality." },
            { q: "Can Windows open HEIC files?", a: "Windows 10 and 11 can open HEIC files after installing the HEIF Image Extensions from the Microsoft Store. For older systems, converting to JPG is the simplest solution." },
            { q: "Does converting HEIC to JPG lose quality?", a: "There is minimal quality loss when converting HEIC to JPG at high quality settings (90%+). The difference is virtually undetectable to the human eye." },
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
