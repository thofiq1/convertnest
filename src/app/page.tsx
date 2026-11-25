import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Free Online PDF Tools & File Converter | FitTheFile" },
  alternates: { canonical: "/" },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "Free Online PDF Tools & File Converter | FitTheFile",
    description:
      "Compress, merge, split, and convert PDFs and images. Free online tools — no signup, no watermarks.",
    url: "/",
    siteName: "FitTheFile",
    type: "website",
  },
};

export default function Home() {
  return <HomeContent />;
}
