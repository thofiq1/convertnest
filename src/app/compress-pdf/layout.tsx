import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF — Free Online PDF Compressor",
  description:
    "Reduce PDF file size online for free. Compress PDF documents to make them smaller without losing quality. No signup, no watermarks.",
  keywords: ["compress pdf", "pdf compressor", "reduce pdf size", "shrink pdf", "compress pdf online free"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
