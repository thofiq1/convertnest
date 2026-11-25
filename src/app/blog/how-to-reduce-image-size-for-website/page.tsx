import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPost } from "@/lib/blog";
import { DEFAULT_OG_IMAGES } from "@/lib/site";
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

const post = getBlogPost("how-to-reduce-image-size-for-website")!;

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

export default function ReduceImageSizeBlogPost() {
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
            Images are usually the heaviest part of any web page. A single
            unoptimized photo can weigh more than the rest of the page combined,
            dragging down load times and frustrating visitors. The good news is
            that you can dramatically reduce image file size without any
            visible quality loss — if you know the right approach.
          </P>

          <H2>Why Image Size Matters for Your Website</H2>
          <P>
            Page speed directly affects both user experience and search engine
            rankings. Google uses Core Web Vitals — including Largest Contentful
            Paint (LCP) — as a ranking factor, and images are often the largest
            element on the page. A slow-loading site also hurts conversion
            rates: studies consistently show that even a one-second delay can
            reduce conversions by several percent. Optimizing your images is one
            of the highest-impact, lowest-effort improvements you can make.
          </P>

          <H2>Recommended Image Sizes for the Web</H2>
          <P>
            For most websites, hero images should be no wider than 1920 pixels.
            Blog content images work well at 800 to 1200 pixels wide. Thumbnails
            and card images can be 400 to 600 pixels. As a general rule, you
            should never upload an image larger than the maximum size it will be
            displayed at. A 4000-pixel-wide photo crammed into a 600-pixel
            column is wasted bandwidth.
          </P>
          <P>
            For file size targets, aim for under 200 KB for most content images
            and under 500 KB for full-width hero images. If your images are in
            the megabyte range, there is significant room for improvement.
          </P>

          <H2>Choose the Right Format</H2>
          <P>
            Format choice has a huge impact on file size. WebP delivers the same
            visual quality as JPG at 25-35% smaller file sizes, and all modern
            browsers support it. Use JPG for photographs that do not need
            transparency and PNG for graphics, logos, and screenshots. For a
            deeper comparison, see our guide on{" "}
            <Link
              href="/blog/how-to-convert-images-between-formats"
              style={{ color: "var(--primary)" }}
            >
              converting between image formats
            </Link>
            .
          </P>
          <P>
            If your site framework supports it, consider serving WebP with a JPG
            fallback. This gives modern browsers the smaller file while keeping
            compatibility with older software.
          </P>

          <H2>How to Compress Images Without Visible Quality Loss</H2>
          <P>
            The key is to use smart compression that targets redundant data
            rather than visible detail. FitTheFile&rsquo;s{" "}
            <Link href="/image-compressor" style={{ color: "var(--primary)" }}>
              Image Compressor
            </Link>{" "}
            lets you adjust the quality slider and see the compressed result
            before downloading. For most photographs, dropping quality to 80%
            produces a file that is 60-70% smaller with no visible difference on
            screen. Everything runs in your browser, so your images stay private.
          </P>
          <P>
            For PNG files, compression works differently — it reduces file size
            by optimizing the way color data is stored without changing any
            pixels. This means PNG compression is always lossless, but the
            savings are typically smaller than what you get with JPG or WebP
            compression.
          </P>

          <CtaBox toolSlug={post.relatedTool} toolName={post.relatedToolName} />

          <H2>The WebP Advantage</H2>
          <P>
            If you are not already using WebP on your site, switching to it is
            probably the single biggest optimization you can make. Convert your
            existing JPG and PNG images to WebP using an{" "}
            <Link href="/image-converter" style={{ color: "var(--primary)" }}>
              image converter
            </Link>{" "}
            and you will typically see a 30% or greater reduction in total image
            weight. Combined with proper sizing and compression, it is not
            unusual to cut page load time in half.
          </P>

          <H2>Quick Optimization Checklist</H2>
          <P>
            Resize images to the maximum display size before uploading. Choose
            WebP when possible, JPG for photos without transparency, and PNG
            for graphics that need it. Compress every image — even a light
            compression pass saves significant bandwidth. Use lazy loading so
            images below the fold do not block the initial page render. Finally,
            always check your page speed after optimization using tools like
            Google PageSpeed Insights to confirm the improvement.
          </P>
        </ArticleBody>
      </article>
      <RelatedPosts currentSlug={post.slug} />
    </ArticleWrapper>
  );
}
