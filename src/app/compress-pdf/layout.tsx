import type { Metadata } from "next";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Compress PDF Online Free — Reduce PDF Size",
  description:
    "Compress PDF files online for free. Pick a quality level and shrink PDFs for email, uploads or sharing. No signup, no watermarks, runs in your browser.",
  keywords: ["compress pdf", "compress pdf online free", "reduce pdf size", "pdf compressor", "shrink pdf", "make pdf smaller"],
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "Compress PDF Online Free — Reduce PDF Size",
    description: "Compress PDF files online for free. Pick a quality level and shrink PDFs in your browser. No signup, no watermarks.",
    url: "/compress-pdf",
    siteName: "FitTheFile",
    type: "website",
  },
  alternates: {
    canonical: "/compress-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
