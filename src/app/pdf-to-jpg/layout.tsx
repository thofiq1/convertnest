import type { Metadata } from "next";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "PDF to JPG Converter Free — PDF to Images",
  description:
    "Convert PDF pages to high-quality JPG images online for free. Extract each page as an image. No signup, no watermarks. Works in your browser.",
  keywords: ["pdf to jpg", "convert pdf to image", "pdf to jpeg", "pdf to png", "pdf to jpg converter free"],
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "PDF to JPG Converter Free — PDF to Images",
    description: "Convert PDF pages to high-quality JPG images online for free. No signup, no watermarks.",
    url: "/pdf-to-jpg",
    siteName: "FitTheFile",
    type: "website",
  },
  alternates: {
    canonical: "/pdf-to-jpg",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
