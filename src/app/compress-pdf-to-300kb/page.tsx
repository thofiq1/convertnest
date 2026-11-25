import PdfSizeLandingPage, { pdfSizeMetadata } from "@/components/PdfSizeLandingPage";

export const metadata = pdfSizeMetadata(300);

export default function Page() {
  return <PdfSizeLandingPage kb={300} />;
}
