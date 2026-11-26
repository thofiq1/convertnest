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

const post = getBlogPost("how-to-unlock-pdf-remove-password")!;

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
  { q: "Can I unlock a PDF if I forgot the password?", a: "Not if the PDF needs that password to open. The tool is not a password cracker, so you have to enter the correct password. A PDF that opens normally but has restrictions can be unlocked without one." },
  { q: "Can I still select and search text in the unlocked PDF?", a: "Yes. The unlocked copy keeps the original pages, so text stays selectable and searchable. For a few unusual files the tool falls back to redrawing each page as an image, and in those the text can't be selected." },
  { q: "Is my password sent anywhere?", a: "No. The PDF is opened and rebuilt in your browser, and the password is only used there." },
  { q: "The tool says my PDF is not password-protected. Why?", a: "The file has no password or restrictions on it, so there is nothing to remove. You can use it as it is." },
  { q: "Does unlocking change my original file?", a: "No. You download a separate unlocked copy, and the file on your device stays as it was." },
];

export default function UnlockPdfPost() {
  return (
    <ArticleWrapper>
      <Breadcrumb postTitle={post.title} />
      <article>
        <ArticleHeader title={post.title} date={post.date} readTime={post.readTime} />
        <ArticleBody>
          <P>
            A password-protected PDF is awkward when you need to merge it, compress it or upload it to a form. If you know the password, you can make an unlocked copy in a few seconds with the free <Link href="/pdf-unlock" style={linkStyle}>PDF Unlock</Link> tool. The file is handled in your browser and is not uploaded.
          </P>
          <H2>Two Kinds of PDF Lock</H2>
          <P>
            A PDF can be locked in two ways. The first asks for a password before the file will open at all. The second lets anyone open the file but restricts things such as printing, copying or editing. The tool checks which kind you have as soon as you add the file.
          </P>
          <H2>Remove a Password You Know</H2>
          <P>
            Drop the PDF on the page. If it needs a password to open, the tool asks for it. Type the password and unlock the file, then download the copy. If the password is wrong, the tool tells you and you can try again. It can't open the file without the right password.
          </P>
          <H2>Remove Printing, Copying and Editing Restrictions</H2>
          <P>
            If the PDF opens without a password but has restrictions, you don't need to type anything. The tool tells you the file is restricted and shows a Remove Restrictions button. Press it and download the copy.
          </P>
          <CtaBox toolSlug="pdf-unlock" toolName="PDF Unlock" />
          <H2>What You Get</H2>
          <P>
            The download is a separate copy with the password and restrictions removed. It keeps the original pages, so text stays selectable and the quality is unchanged. For a few unusual files the tool falls back to redrawing each page as an image. Those copies look the same, but their text can't be selected, and the tool tells you when that happened. Your original file is not changed.
          </P>
          <H2>What It Can't Do</H2>
          <P>
            The tool is not a password cracker. If a PDF needs a password to open and you don't have it, ask whoever sent the file. If you drop in a PDF that is not protected, the tool tells you no unlocking is needed. Only unlock files you have the right to use.
          </P>
          <H2>After Unlocking</H2>
          <P>
            An unlocked copy works with the other PDF tools. You can combine it with other files in <Link href="/merge-pdf" style={linkStyle}>Merge PDF</Link>, or shrink it for an upload form with <Link href="/compress-pdf-to-200kb" style={linkStyle}>Compress PDF to 200KB</Link>, which asks you to unlock protected files first. If you want a password on the finished file again, add one with <Link href="/pdf-protect" style={linkStyle}>PDF Protect</Link>.
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
