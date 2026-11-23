import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JPG to PDF Converter Free — Convert Images to PDF | ConvertNest",
  description:
    "Convert JPG, PNG, and other images to PDF for free. Combine multiple images into one PDF. No signup, no watermarks. Works in your browser.",
  keywords: ["jpg to pdf", "image to pdf", "convert jpg to pdf free", "photo to pdf", "jpeg to pdf converter"],
  openGraph: {
    title: "JPG to PDF Converter Free — Convert Images to PDF",
    description: "Convert JPG, PNG, and other images to PDF for free. No signup, no watermarks.",
    url: "https://convertnest-app.vercel.app/jpg-to-pdf",
    siteName: "ConvertNest",
    type: "website",
  },
  alternates: {
    canonical: "https://convertnest-app.vercel.app/jpg-to-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
