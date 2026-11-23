import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Converter Online Free — JPG PNG WebP BMP | ConvertNest",
  description:
    "Convert images between JPG, PNG, WebP, and BMP formats for free. Batch convert multiple images at once. No signup. Works in your browser.",
  keywords: ["image converter", "convert image format", "webp to jpg", "png to jpg", "jpg to png", "convert image online free"],
  openGraph: {
    title: "Image Converter Online Free — JPG PNG WebP BMP",
    description: "Convert images between JPG, PNG, WebP, and BMP formats for free. No signup required.",
    url: "https://convertnest-app.vercel.app/image-converter",
    siteName: "ConvertNest",
    type: "website",
  },
  alternates: {
    canonical: "https://convertnest-app.vercel.app/image-converter",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
