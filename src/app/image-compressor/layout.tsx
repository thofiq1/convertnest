import type { Metadata } from "next";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Compress Images Online Free — Reduce Image Size",
  description:
    "Compress JPG, PNG, and WebP images online for free. Choose a quality level, see the new size instantly. No signup, runs in your browser.",
  keywords: ["compress image", "image compressor", "reduce image size", "compress jpg", "compress png online free"],
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "Compress Images Online Free — Reduce Image Size",
    description: "Compress JPG, PNG, and WebP images online for free with a quality slider. No signup required.",
    url: "/image-compressor",
    siteName: "FitTheFile",
    type: "website",
  },
  alternates: {
    canonical: "/image-compressor",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
