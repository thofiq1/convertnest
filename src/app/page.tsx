import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Compress PDF & Photos to Any KB Size, Free | FitTheFile" },
  alternates: { canonical: "/" },
  openGraph: {
    images: DEFAULT_OG_IMAGES,
    title: "Compress PDF & Photos to Any KB Size, Free | FitTheFile",
    description:
      "Compress a PDF or photo to 20KB, 50KB, 100KB or any limit you type, plus merge, split and convert. Free, no signup, files never leave your browser.",
    url: "/",
    siteName: "FitTheFile",
    type: "website",
  },
};

export default function Home() {
  return <HomeContent />;
}
