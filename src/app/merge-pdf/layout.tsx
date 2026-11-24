import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF Files Online Free — Combine PDFs",
  description:
    "Combine multiple PDF files into one document online for free. Merge PDFs in seconds. No signup, no watermarks, no limits. Works in your browser.",
  keywords: ["merge pdf", "combine pdf files", "join pdf", "pdf merger online", "merge pdf free"],
  openGraph: {
    title: "Merge PDF Files Online Free — Combine PDFs",
    description: "Combine multiple PDF files into one document online for free. No signup, no watermarks.",
    url: "/merge-pdf",
    siteName: "FitTheFile",
    type: "website",
  },
  alternates: {
    canonical: "/merge-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
