import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DropZoneA11y from "@/components/DropZoneA11y";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGES } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: "Compress PDF & Photos to Any KB Size, Free | FitTheFile",
    template: "%s | FitTheFile",
  },
  description:
    "Compress a PDF or photo to 20KB, 50KB, 100KB or any limit you type, plus merge, split and convert. Free, no signup, files never leave your browser.",
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
    images: DEFAULT_OG_IMAGES,
    title: "Compress PDF & Photos to Any KB Size, Free | FitTheFile",
    siteName: SITE_NAME,
    locale: "en_US",
    description:
      "Compress a PDF or photo to 20KB, 50KB, 100KB or any limit you type, plus merge, split and convert. Free, no signup, files never leave your browser.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9974156537162042"
          crossOrigin="anonymous"
        ></script>
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
        <DropZoneA11y />
      </body>
    </html>
  );
}
