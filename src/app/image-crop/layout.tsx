import type { Metadata } from "next";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Crop Image Online Free — Photo Cropper Tool",
  description:
    "Crop images online for free with an easy drag-and-drop editor. Aspect ratio presets for social media. No signup. Works in your browser.",
  keywords: ["crop image", "image cropper", "crop photo online", "resize and crop image", "crop picture free"],
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "Crop Image Online Free — Photo Cropper Tool",
    description: "Crop images online for free with an easy drag-and-drop editor. No signup required.",
    url: "/image-crop",
    siteName: "FitTheFile",
    type: "website",
  },
  alternates: {
    canonical: "/image-crop",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
