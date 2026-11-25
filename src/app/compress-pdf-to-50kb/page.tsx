import PdfSizeLandingPage, { pdfSizeMetadata } from "@/components/PdfSizeLandingPage";

export const metadata = pdfSizeMetadata(50);

export default function Page() {
  return <PdfSizeLandingPage kb={50} />;
}
