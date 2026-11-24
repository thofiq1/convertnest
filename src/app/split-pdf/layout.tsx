import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF Online Free — Extract Pages from PDF",
  description:
    "Split PDF files online for free. Extract specific pages or separate into individual files. No signup, no watermarks. Works in your browser.",
  keywords: ["split pdf", "extract pages from pdf", "separate pdf pages", "pdf splitter", "split pdf online free"],
  openGraph: {
    title: "Split PDF Online Free — Extract Pages from PDF",
    description: "Split PDF files online for free. Extract specific pages or separate into individual files.",
    url: "/split-pdf",
    siteName: "ConvertNest",
    type: "website",
  },
  alternates: {
    canonical: "/split-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
