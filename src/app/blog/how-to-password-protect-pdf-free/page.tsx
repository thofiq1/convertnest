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

const post = getBlogPost("how-to-password-protect-pdf-free")!;

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

export default function PasswordProtectPdfBlogPost() {
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
            Sending sensitive documents as PDFs is part of everyday work — tax
            returns, medical records, contracts, financial statements. But a
            regular PDF offers no protection. Anyone who gets the file can open
            it, copy the text, or print it. Adding a password takes just a few
            seconds and ensures that only the intended recipient can access
            your document.
          </P>

          <H2>Why Password Protect a PDF?</H2>
          <P>
            Email is not secure by default. When you send a PDF as an email
            attachment, it can be intercepted, forwarded, or accessed by someone
            other than the intended recipient. Password protection adds a layer
            of security — even if the file falls into the wrong hands, it
            cannot be opened without the password.
          </P>
          <P>
            Common scenarios include sending tax documents to your accountant,
            sharing medical records with a new doctor, distributing confidential
            business reports, or emailing contracts with sensitive terms. In
            many industries, encrypting sensitive documents before sending them
            is not just good practice — it is a compliance requirement.
          </P>

          <H2>Two Types of PDF Passwords</H2>
          <P>
            PDFs actually support two different kinds of passwords, and
            understanding the difference matters. A <strong>user password</strong>{" "}
            (also called an open password) prevents anyone from opening the
            document without entering the password. This is the most common
            type and the one most people mean when they say &ldquo;password
            protect a PDF.&rdquo;
          </P>
          <P>
            An <strong>owner password</strong> (also called a permissions
            password) lets anyone open and read the document, but restricts
            what they can do with it. You can prevent printing, copying text,
            editing, or extracting pages. This is useful when you want someone
            to read a document but not modify or redistribute it — think of a
            draft contract you are sharing for review only.
          </P>

          <H2>Free Ways to Password Protect a PDF</H2>
          <P>
            On a Mac, open the PDF in Preview, choose File → Export, tick
            &quot;Encrypt&quot;, and set a password. On Windows, Microsoft Word can
            do it: open or create the document, choose File → Save As → PDF →
            Options, and tick &quot;Encrypt the document with a password&quot;.
            LibreOffice (free) offers the same option in its PDF export dialog.
          </P>
          <P>
            Whichever method you use, test the result: reopen the file and
            confirm it actually asks for the password before you send it.
            Some tools silently skip encryption, and a file that only looks
            protected is worse than one you know is unprotected.
          </P>
          <P>
            FitTheFile&apos;s browser-based Protect PDF tool is being upgraded and
            will return once encryption is verified end to end. In the
            meantime, if you need to shrink a file before encrypting it, our
            free compressor works entirely in your browser.
          </P>

          <CtaBox toolSlug="compress-pdf" toolName="Compress PDF" />

          <H2>Tips for Choosing a Strong Password</H2>
          <P>
            A password-protected PDF is only as secure as the password itself.
            Avoid obvious choices like &ldquo;password&rdquo;, &ldquo;123456&rdquo;,
            or the recipient&rsquo;s name. Use a mix of uppercase and lowercase
            letters, numbers, and symbols. A passphrase — a short sentence
            like &ldquo;correct-horse-battery-staple&rdquo; — is both strong
            and memorable.
          </P>
          <P>
            Share the password through a different channel than the document.
            If you email the PDF, send the password via text message, a phone
            call, or a messaging app. This way, even if someone intercepts your
            email, they will not have the password to open the file.
          </P>

          <H2>What About Removing PDF Passwords?</H2>
          <P>
            If you receive a password-protected PDF and you know the password,
            you can remove the protection by opening the document and
            re-saving it without a password. This is useful when a password
            was set temporarily for transit and is no longer needed.
          </P>
          <P>
            Keep in mind that PDF password protection is not unbreakable.
            Determined attackers with enough computing power can crack weak
            passwords. For highly sensitive documents, consider additional
            security measures like encrypted email services or secure file
            sharing platforms. For everyday protection — keeping honest people
            honest and meeting basic security requirements — PDF passwords do
            the job well.
          </P>
        </ArticleBody>
      </article>

      <FaqSchema
        faqs={[
          { question: "What's the difference between user password and owner password?", answer: "A user password prevents opening the PDF entirely. An owner password allows opening but restricts actions like printing, copying text, or editing." },
          { question: "Can a password-protected PDF be cracked?", answer: "Strong passwords (12+ characters with mixed case, numbers, and symbols) are extremely difficult to crack. Short or common passwords can be vulnerable to brute-force attacks." },
          { question: "Does password protection reduce PDF quality?", answer: "No. Encryption protects access to the file without altering its content or quality in any way." },
        ]}
      />
      <section style={{ marginTop: "2.5rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "1rem" }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            { q: "What's the difference between user password and owner password?", a: "A user password prevents opening the PDF entirely. An owner password allows opening but restricts actions like printing, copying text, or editing." },
            { q: "Can a password-protected PDF be cracked?", a: "Strong passwords (12+ characters with mixed case, numbers, and symbols) are extremely difficult to crack. Short or common passwords can be vulnerable to brute-force attacks." },
            { q: "Does password protection reduce PDF quality?", a: "No. Encryption protects access to the file without altering its content or quality in any way." },
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
