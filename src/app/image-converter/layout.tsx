import type { Metadata } from "next";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Image Converter Online Free — JPG, PNG, WebP",
  description:
    "Convert images to JPG, PNG or WebP for free, including BMP and GIF files. Batch convert multiple images at once. No signup. Works in your browser.",
  keywords: ["image converter", "convert image format", "webp to jpg", "png to jpg", "jpg to png", "convert image online free"],
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "Image Converter Online Free — JPG, PNG, WebP",
    description: "Convert images to JPG, PNG or WebP for free, including BMP and GIF files. No signup required.",
    url: "/image-converter",
    siteName: "FitTheFile",
    type: "website",
  },
  alternates: {
    canonical: "/image-converter",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
