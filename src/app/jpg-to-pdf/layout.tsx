import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JPG to PDF — Convert Images to PDF Online Free",
  description:
    "Convert JPG, PNG, and other images to PDF for free. Combine multiple images into one PDF document. No signup, no watermarks.",
  keywords: ["jpg to pdf", "image to pdf", "convert jpg to pdf", "photo to pdf", "png to pdf", "pictures to pdf"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
