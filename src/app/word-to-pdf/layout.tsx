import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word to PDF Converter Free — Convert DOCX to PDF | ConvertNest",
  description:
    "Convert Word documents to PDF online for free. Upload .docx and download as PDF instantly. No signup, no watermarks. Works in your browser.",
  keywords: ["word to pdf", "docx to pdf", "convert word to pdf free", "doc to pdf", "word document to pdf"],
  openGraph: {
    title: "Word to PDF Converter Free — Convert DOCX to PDF",
    description: "Convert Word documents to PDF online for free. No signup, no watermarks.",
    url: "https://convertnest-app.vercel.app/word-to-pdf",
    siteName: "ConvertNest",
    type: "website",
  },
  alternates: {
    canonical: "https://convertnest-app.vercel.app/word-to-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
