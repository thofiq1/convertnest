import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JPG to PDF Converter Free — Images to PDF",
  description:
    "Convert JPG, PNG, and other images to PDF for free. Combine multiple images into one PDF. No signup, no watermarks. Works in your browser.",
  keywords: ["jpg to pdf", "image to pdf", "convert jpg to pdf free", "photo to pdf", "jpeg to pdf converter"],
  openGraph: {
    title: "JPG to PDF Converter Free — Images to PDF",
    description: "Convert JPG, PNG, and other images to PDF for free. No signup, no watermarks.",
    url: "/jpg-to-pdf",
    siteName: "ConvertNest",
    type: "website",
  },
  alternates: {
    canonical: "/jpg-to-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
