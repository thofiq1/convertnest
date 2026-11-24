import PdfSizeLandingPage, { pdfSizeMetadata } from "@/components/PdfSizeLandingPage";

export const metadata = pdfSizeMetadata(200);

export default function Page() {
  return <PdfSizeLandingPage kb={200} />;
}
