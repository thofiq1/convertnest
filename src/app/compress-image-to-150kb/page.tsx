import SizeLandingPage, { sizeMetadata } from "@/components/SizeLandingPage";

export const metadata = sizeMetadata(150);

export default function Page() {
  return <SizeLandingPage kb={150} />;
}
