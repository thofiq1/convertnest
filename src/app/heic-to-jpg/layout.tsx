import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HEIC to JPG Converter Free — Convert iPhone Photos | ConvertNest",
  description:
    "Convert iPhone HEIC photos to JPG or PNG format online for free. Batch convert multiple files at once. No signup. Works in your browser.",
  keywords: ["heic to jpg", "convert heic to jpeg", "iphone photo converter", "heic converter free", "heic to png"],
  openGraph: {
    title: "HEIC to JPG Converter Free — Convert iPhone Photos",
    description: "Convert iPhone HEIC photos to JPG or PNG format online for free. No signup required.",
    url: "https://convertnest-app.vercel.app/heic-to-jpg",
    siteName: "ConvertNest",
    type: "website",
  },
  alternates: {
    canonical: "https://convertnest-app.vercel.app/heic-to-jpg",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
