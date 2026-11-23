import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password Protect PDF Online Free — Encrypt PDF | ConvertNest",
  description:
    "Password protect and encrypt PDF files online for free. Lock your PDFs with a password. No signup, no limits, works in your browser.",
  keywords: ["password protect pdf", "encrypt pdf", "lock pdf", "secure pdf", "pdf password free", "protect pdf online"],
  openGraph: {
    title: "Password Protect PDF Online Free — Encrypt PDF",
    description: "Password protect and encrypt PDF files online for free. Lock your PDFs with a password.",
    url: "https://convertnest-app.vercel.app/pdf-protect",
    siteName: "ConvertNest",
    type: "website",
  },
  alternates: {
    canonical: "https://convertnest-app.vercel.app/pdf-protect",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
