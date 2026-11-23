import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF Online Free — Reduce PDF File Size | ConvertNest",
  description:
    "Compress PDF files online for free without losing quality. Reduce PDF size for email, upload, or sharing. No signup, no watermarks, no limits.",
  keywords: ["compress pdf", "compress pdf online free", "reduce pdf size", "pdf compressor", "shrink pdf", "make pdf smaller"],
  openGraph: {
    title: "Compress PDF Online Free — Reduce PDF File Size",
    description: "Compress PDF files online for free without losing quality. No signup, no watermarks.",
    url: "https://convertnest-app.vercel.app/compress-pdf",
    siteName: "ConvertNest",
    type: "website",
  },
  alternates: {
    canonical: "https://convertnest-app.vercel.app/compress-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
