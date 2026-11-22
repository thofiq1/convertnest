import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compressor — Compress JPG, PNG, WebP Online Free",
  description:
    "Compress images online for free. Reduce JPEG, PNG, and WebP file sizes without losing quality. No signup required.",
  keywords: ["compress image", "image compressor", "compress jpg", "compress png", "reduce image size", "image compression online"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
