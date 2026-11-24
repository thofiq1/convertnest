import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  title: { absolute: "Free Online PDF Tools & File Converter | FitTheFile" },
  alternates: { canonical: "/" },
  openGraph: {
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
