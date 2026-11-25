import type { Metadata } from "next";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF Online Free",
  description:
    "Add page numbers to PDF files online for free. Choose position, format, and starting number. No signup, no limits, works in your browser.",
  keywords: ["add page numbers to pdf", "pdf page numbers", "number pdf pages", "page numbering pdf free"],
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "Add Page Numbers to PDF Online Free",
    description: "Add page numbers to PDF files online for free. Choose position, format, and starting number.",
    url: "/pdf-page-numbers",
    siteName: "FitTheFile",
    type: "website",
  },
  alternates: {
    canonical: "/pdf-page-numbers",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
