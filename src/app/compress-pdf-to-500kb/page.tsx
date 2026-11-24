import PdfSizeLandingPage, { pdfSizeMetadata } from "@/components/PdfSizeLandingPage";

export const metadata = pdfSizeMetadata(500);

export default function Page() {
  return <PdfSizeLandingPage kb={500} />;
}
