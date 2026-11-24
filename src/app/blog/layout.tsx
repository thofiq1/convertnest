import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Free PDF & Image Tool Guides | ConvertNest",
  description:
    "Learn how to compress, merge, convert, and edit PDFs and images for free. Tips, tutorials, and guides for all your file conversion needs.",
  openGraph: {
    title: "Blog — Free PDF & Image Tool Guides",
    description:
      "Tips, tutorials, and guides for PDF and image conversion.",
    siteName: "ConvertNest",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
