import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  title: { absolute: "Free Online PDF Tools & File Converter | ConvertNest" },
  alternates: { canonical: "/" },
  openGraph: {
    title: "Free Online PDF Tools & File Converter | ConvertNest",
    description:
      "Compress, merge, split, and convert PDFs and images. Free online tools — no signup, no watermarks.",
    url: "/",
    siteName: "ConvertNest",
    type: "website",
  },
};

export default function Home() {
  return <HomeContent />;
}
