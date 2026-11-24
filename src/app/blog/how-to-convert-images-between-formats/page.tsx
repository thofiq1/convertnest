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

const post = getBlogPost("how-to-convert-images-between-formats")!;

export const metadata: Metadata = {
  title: post.title,
  alternates: { canonical: `/blog/${post.slug}` },
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

export default function ConvertImagesBlogPost() {
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
            Image formats can be confusing. You have a PNG that is too large for
            your website, a WebP that your email client cannot display, or a JPG
            that lost its transparent background. Understanding when to use each
            format — and how to convert between them — saves time and avoids
            quality headaches.
          </P>

          <H2>JPG: Best for Photos</H2>
          <P>
            JPG (also written JPEG) uses lossy compression, which means it
            discards some image data to achieve smaller file sizes. This makes
            it ideal for photographs and complex images with many colors and
            gradients. A typical photo saved as JPG is 5 to 10 times smaller
            than the same image saved as PNG. The tradeoff is that each time you
            re-save a JPG, it loses a tiny bit more quality. JPG does not
            support transparency, so it is not suitable for logos or icons that
            need to sit on different backgrounds.
          </P>

          <H2>PNG: Best for Graphics and Transparency</H2>
          <P>
            PNG uses lossless compression, so it preserves every pixel exactly.
            This makes it the go-to format for screenshots, logos, icons, and
            any image that needs a transparent background. The downside is file
            size — a PNG photograph can be several megabytes, which is why PNG
            works better for graphics with flat colors and sharp edges rather
            than photos.
          </P>

          <H2>WebP: The Modern All-Rounder</H2>
          <P>
            Developed by Google, WebP supports both lossy and lossless
            compression plus transparency. A WebP image is typically 25-35%
            smaller than a comparable JPG at the same visual quality, and
            significantly smaller than PNG for photographic content. All modern
            browsers support WebP, making it an excellent choice for websites.
            The main limitation is that some older software and email clients
            still cannot open WebP files.
          </P>

          <H2>When to Use Which Format</H2>
          <P>
            Use JPG for photographs you plan to share via email or social media
            — the files stay small and every device can open them. Use PNG when
            you need transparency or pixel-perfect graphics like screenshots and
            logos. Use WebP for website images where you want the best balance
            of quality and file size. If you are dealing with iPhone photos, you
            might also encounter HEIC — check out our guide on{" "}
            <Link
              href="/blog/heic-vs-jpg-difference-how-to-convert"
              style={{ color: "var(--primary)" }}
            >
              HEIC vs JPG
            </Link>{" "}
            for details on that format.
          </P>

          <H2>How to Convert Images for Free</H2>
          <P>
            ConvertNest&rsquo;s{" "}
            <Link href="/image-converter" style={{ color: "var(--primary)" }}>
              Image Converter
            </Link>{" "}
            handles conversions between JPG, PNG, WebP, BMP, GIF, and more.
            Drop your image in, pick the target format, and download the result.
            Everything runs in your browser — your images never get uploaded to
            a server, which matters if you are converting screenshots or
            personal photos.
          </P>
          <P>
            If your goal is specifically to reduce file size for a website, you
            might also want to look at our{" "}
            <Link
              href="/blog/how-to-reduce-image-size-for-website"
              style={{ color: "var(--primary)" }}
            >
              guide to optimizing images for the web
            </Link>
            , which covers compression settings and best practices beyond just
            format conversion.
          </P>

          <CtaBox toolSlug={post.relatedTool} toolName={post.relatedToolName} />

          <H2>Tips for the Best Results</H2>
          <P>
            Always keep your original file. Converting from one lossy format to
            another (say, JPG to WebP and back) degrades quality each time.
            Start from the highest-quality source you have and convert once to
            your target format. If you need both a web version and a print
            version, make two separate conversions from the original rather than
            converting between the two output files.
          </P>
          <P>
            For batch conversions — say, converting a folder of PNG screenshots
            to JPG — look for a tool that handles multiple files at once.
            ConvertNest lets you drop several images and convert them all in one
            go, which saves a lot of repetitive clicking.
          </P>
        </ArticleBody>
      </article>
      <RelatedPosts currentSlug={post.slug} />
    </ArticleWrapper>
  );
}
