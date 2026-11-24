import PdfSizeLandingPage, { pdfSizeMetadata } from "@/components/PdfSizeLandingPage";

export const metadata = pdfSizeMetadata(100);

export default function Page() {
  return <PdfSizeLandingPage kb={100} />;
}
