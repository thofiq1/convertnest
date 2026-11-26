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

const post = getBlogPost("opt-i-765-photo-document-upload-size")!;

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
  { q: "What is the file size limit for I-765 uploads?", a: "USCIS's tips for filing online say each evidence file must be no larger than 6MB." },
  { q: "Which file types does USCIS accept for online evidence?", a: "PDF, JPG, JPEG, TIF and TIFF, according to USCIS's tips for filing forms online." },
  { q: "How many pixels should the 2 \u00d7 2 inch photo be?", a: "USCIS gives the size in inches, not pixels. 600 \u00d7 600 pixels is a common choice for a 2 \u00d7 2 inch photo and is what our tool makes by default; that number is our choice, not a USCIS rule." },
  { q: "Does USCIS still use the photo I upload?", a: "In December 2025 USCIS announced that it will no longer use photos that applicants submit themselves, so it may take your photo at a biometrics appointment. The online form can still ask for an upload, so follow the current form instructions." },
  { q: "Are my documents uploaded to FitTheFile?", a: "No. The tools run in your browser, so your photo and documents never leave your device." },
];

export default function OptI765UploadPost() {
  return (
    <ArticleWrapper>
      <Breadcrumb postTitle={post.title} />
      <article>
        <ArticleHeader title={post.title} date={post.date} readTime={post.readTime} />
        <ArticleBody>
          <P>
            If you file Form I-765 online for OPT or the STEM OPT extension, every file you attach has to be an accepted type and under USCIS's size limit, and the photo has to be a 2 × 2 inch passport-style picture. This guide lists the published rules and shows how to fix a file that doesn't meet them, using the free <Link href="/uscis-i-765-opt-photo-document-resizer" style={linkStyle}>OPT / I-765 photo and file tool</Link>. It is not legal advice; for what to submit, follow the Form I-765 instructions and your school's DSO.
          </P>
          <H2>The Published Upload Rules</H2>
          <P>
            USCIS's page on tips for filing forms online says evidence can be uploaded as PDF, JPG, JPEG, TIF or TIFF, and that each file can be no larger than 6MB. Documents in another language need an English translation uploaded with them. A USCIS webinar on filing the I-765 for OPT adds a practical point: file names should use only English letters, numbers, spaces, periods, hyphens, underscores and parentheses, because other characters can make an upload fail. We checked these against the USCIS pages in November 2026.
          </P>
          <H2>The Photo</H2>
          <P>
            The form asks for a passport-style photo that follows the Department of State's specifications: 2 × 2 inches (51 × 51 mm) on a white or off-white background. The rule is in inches, not pixels. Our <Link href="/uscis-i-765-opt-photo-document-resizer" style={linkStyle}>I-765 photo tool</Link> crops your picture to a centred square at 600 × 600 or 1200 × 1200 pixels and saves a JPEG far below 6MB. Those pixel sizes are our choice for a 2 × 2 inch photo, not a USCIS requirement. Leave some space around your head in the original, because the square crop removes the sides of a tall photo.
          </P>
          <H2>A Change to Know About</H2>
          <P>
            In December 2025 USCIS announced that it will no longer use photos that applicants submit themselves. It may take your photo at a biometrics appointment even though the online form still has a photo upload. Check the current Form I-765 instructions for how recent a photo must be and what applies to you.
          </P>
          <CtaBox toolSlug="uscis-i-765-opt-photo-document-resizer" toolName="OPT / I-765 Photo and File Tool" />
          <H2>Getting Documents Under 6MB</H2>
          <P>
            Phone scans of an I-20, passport page or earlier EAD are often larger than 6MB, especially as multi-page PDFs. <Link href="/compress-pdf" style={linkStyle}>Compress PDF</Link> makes a PDF smaller, and <Link href="/image-compressor" style={linkStyle}>Image Compressor</Link> does the same for a JPG. If the two sides of a card are separate photos, <Link href="/jpg-to-pdf" style={linkStyle}>JPG to PDF</Link> puts them in one file, and <Link href="/merge-pdf" style={linkStyle}>Merge PDF</Link> joins separate PDFs. iPhone HEIC photos are not an accepted type, so convert them with <Link href="/heic-to-jpg" style={linkStyle}>HEIC to JPG</Link> first.
          </P>
          <H2>Before You Upload</H2>
          <P>
            Open each file and make sure every word is readable after compression; a small file is no use if the officer can't read it. If a PDF has a password, make an unlocked copy with <Link href="/pdf-unlock" style={linkStyle}>PDF Unlock</Link> using the password you know. Rename files so they use only the plain characters listed above. Which documents your category needs is decided by the form instructions and your DSO, not by this guide.
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
