import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotate PDF Online Free — Fix Page Orientation",
  description:
    "Rotate PDF pages online for free. Turn pages 90, 180, or 270 degrees to fix orientation. No signup, no watermarks. Works in your browser.",
  keywords: ["rotate pdf", "rotate pdf pages", "turn pdf", "fix pdf orientation", "rotate pdf online free"],
  openGraph: {
    title: "Rotate PDF Online Free — Fix Page Orientation",
    description: "Rotate PDF pages online for free. Turn pages 90, 180, or 270 degrees to fix orientation.",
    url: "/rotate-pdf",
    siteName: "FitTheFile",
    type: "website",
  },
  alternates: {
    canonical: "/rotate-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
