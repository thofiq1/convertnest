import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resize Images Online Free — Change Image Dimensions | ConvertNest",
  description:
    "Resize images online for free. Set custom dimensions or scale by percentage. Supports JPG, PNG, WebP. No signup. Works in your browser.",
  keywords: ["resize image", "image resizer", "resize photo online", "change image size", "resize image for social media"],
  openGraph: {
    title: "Resize Images Online Free — Change Image Dimensions",
    description: "Resize images online for free. Set custom dimensions or scale by percentage. No signup required.",
    url: "https://convertnest-app.vercel.app/image-resizer",
    siteName: "ConvertNest",
    type: "website",
  },
  alternates: {
    canonical: "https://convertnest-app.vercel.app/image-resizer",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
