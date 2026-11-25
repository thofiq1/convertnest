import type { Metadata } from "next";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "HEIC to JPG Converter Free — iPhone Photos",
  description:
    "Convert iPhone HEIC photos to JPG or PNG format online for free. Batch convert multiple files at once. No signup. Works in your browser.",
  keywords: ["heic to jpg", "convert heic to jpeg", "iphone photo converter", "heic converter free", "heic to png"],
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "HEIC to JPG Converter Free — iPhone Photos",
    description: "Convert iPhone HEIC photos to JPG or PNG format online for free. No signup required.",
    url: "/heic-to-jpg",
    siteName: "FitTheFile",
    type: "website",
  },
  alternates: {
    canonical: "/heic-to-jpg",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
