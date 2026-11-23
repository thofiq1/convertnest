import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotate PDF Pages Online Free — Fix PDF Orientation | ConvertNest",
  description:
    "Rotate PDF pages online for free. Turn pages 90, 180, or 270 degrees to fix orientation. No signup, no watermarks. Works in your browser.",
  keywords: ["rotate pdf", "rotate pdf pages", "turn pdf", "fix pdf orientation", "rotate pdf online free"],
  openGraph: {
    title: "Rotate PDF Pages Online Free — Fix PDF Orientation",
    description: "Rotate PDF pages online for free. Turn pages 90, 180, or 270 degrees to fix orientation.",
    url: "https://convertnest-app.vercel.app/rotate-pdf",
    siteName: "ConvertNest",
    type: "website",
  },
  alternates: {
    canonical: "https://convertnest-app.vercel.app/rotate-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
