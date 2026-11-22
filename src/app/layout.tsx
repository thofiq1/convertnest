import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "ConvertNest — Free Online File Converter & PDF Tools",
    template: "%s | ConvertNest",
  },
  description:
    "Free online PDF tools and file converters. Compress PDF, merge PDF, convert images, JPG to PDF, and more. No signup required. 100% free.",
  keywords: [
    "compress pdf",
    "merge pdf",
    "pdf to jpg",
    "jpg to pdf",
    "image compressor",
    "online converter",
    "free pdf tools",
    "pdf compressor",
    "split pdf",
    "image converter",
    "webp to jpg",
    "word to pdf",
  ],
  verification: {
    google: "-30b_GIZaX7vrEBAUvG9wZKwFuu4bg-M9wi5l6K3qr0",
  },
  openGraph: {
    title: "ConvertNest — Free Online File Converter & PDF Tools",
    description:
      "Compress, merge, split, and convert PDFs and images. Free online tools — no signup, no watermarks.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HYG2KD68KP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HYG2KD68KP');
          `}
        </Script>
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
