import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crop Image Online Free — Photo Cropper Tool",
  description:
    "Crop images online for free with an easy drag-and-drop editor. Aspect ratio presets for social media. No signup. Works in your browser.",
  keywords: ["crop image", "image cropper", "crop photo online", "resize and crop image", "crop picture free"],
  openGraph: {
    title: "Crop Image Online Free — Photo Cropper Tool",
    description: "Crop images online for free with an easy drag-and-drop editor. No signup required.",
    url: "/image-crop",
    siteName: "ConvertNest",
    type: "website",
  },
  alternates: {
    canonical: "/image-crop",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
