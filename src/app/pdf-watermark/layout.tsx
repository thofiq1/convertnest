import type { Metadata } from "next";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Add Watermark to PDF Online Free — PDF Stamper",
  description:
    "Add text watermarks to PDF files online for free. Customize font, opacity, and position. No signup, no watermarks on output, browser-based.",
  keywords: ["add watermark to pdf", "pdf watermark", "stamp pdf", "watermark pdf free", "text watermark pdf"],
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "Add Watermark to PDF Online Free — PDF Stamper",
    description: "Add text watermarks to PDF files online for free. Customize font, opacity, and position.",
    url: "/pdf-watermark",
    siteName: "FitTheFile",
    type: "website",
  },
  alternates: {
    canonical: "/pdf-watermark",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
