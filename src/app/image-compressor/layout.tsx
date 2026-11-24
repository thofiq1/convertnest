import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress Images Online Free — Reduce Image Size",
  description:
    "Compress JPG, PNG, and WebP images online for free without losing quality. Reduce image file size instantly. No signup, browser-based.",
  keywords: ["compress image", "image compressor", "reduce image size", "compress jpg", "compress png online free"],
  openGraph: {
    title: "Compress Images Online Free — Reduce Image Size",
    description: "Compress JPG, PNG, and WebP images online for free without losing quality. No signup required.",
    url: "/image-compressor",
    siteName: "ConvertNest",
    type: "website",
  },
  alternates: {
    canonical: "/image-compressor",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
