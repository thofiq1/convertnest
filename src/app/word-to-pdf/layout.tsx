import type { Metadata } from "next";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Word to PDF Converter Free — DOCX to PDF",
  description:
    "Convert Word documents to PDF online for free. Upload .docx and download as PDF instantly. No signup, no watermarks. Works in your browser.",
  keywords: ["word to pdf", "docx to pdf", "convert word to pdf free", "doc to pdf", "word document to pdf"],
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "Word to PDF Converter Free — DOCX to PDF",
    description: "Convert Word documents to PDF online for free. No signup, no watermarks.",
    url: "/word-to-pdf",
    siteName: "FitTheFile",
    type: "website",
  },
  alternates: {
    canonical: "/word-to-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
