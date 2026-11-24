import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SVG to PNG Converter Free — Vector to Raster",
  description:
    "Convert SVG vector files to PNG or JPG at any resolution online for free. Scale up to 4x for high-res output. No signup. Browser-based.",
  keywords: ["svg to png", "convert svg to png", "svg to jpg", "svg converter", "vector to image free"],
  openGraph: {
    title: "SVG to PNG Converter Free — Vector to Raster",
    description: "Convert SVG vector files to PNG or JPG at any resolution online for free. No signup required.",
    url: "/svg-to-png",
    siteName: "FitTheFile",
    type: "website",
  },
  alternates: {
    canonical: "/svg-to-png",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
