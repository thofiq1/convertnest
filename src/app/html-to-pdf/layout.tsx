import type { Metadata } from "next";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "HTML to PDF Converter Free — Webpage to PDF",
  description:
    "Convert HTML code or web content to PDF for free. Paste your HTML, preview it, and download a clean PDF document. No signup, works in your browser.",
  keywords: ["html to pdf", "convert html to pdf", "webpage to pdf", "web page to pdf free", "html to pdf converter", "save html as pdf"],
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "HTML to PDF Converter Free — Webpage to PDF",
    description: "Convert HTML code or web content to PDF for free. Paste your HTML, preview it, and download a clean PDF document.",
    url: "/html-to-pdf",
    siteName: "FitTheFile",
    type: "website",
  },
  alternates: {
    canonical: "/html-to-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
