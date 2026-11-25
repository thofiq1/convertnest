import type { Metadata } from "next";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog — Free PDF & Image Tool Guides",
  alternates: { canonical: "/blog" },
  description:
    "Learn how to compress, merge, convert, and edit PDFs and images for free. Tips, tutorials, and guides for all your file conversion needs.",
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "Blog — Free PDF & Image Tool Guides",
    description:
      "Tips, tutorials, and guides for PDF and image conversion.",
    siteName: "FitTheFile",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
