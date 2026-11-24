import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remove Password from PDF Free — Unlock PDF Online | ConvertNest",
  description:
    "Remove password from PDF files online for free. Enter the password you know and download an unlocked copy. No signup, no limits, works in your browser.",
  keywords: ["unlock pdf", "remove pdf password", "pdf password remover", "decrypt pdf free", "pdf unlocker", "remove pdf protection"],
  openGraph: {
    title: "Remove Password from PDF Free — Unlock PDF Online",
    description: "Remove password from PDF files online for free. Enter the password you know and download an unlocked copy.",
    url: "https://convertnest-app.vercel.app/pdf-unlock",
    siteName: "ConvertNest",
    type: "website",
  },
  alternates: {
    canonical: "https://convertnest-app.vercel.app/pdf-unlock",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
