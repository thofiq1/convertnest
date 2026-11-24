import SizeLandingPage, { sizeMetadata } from "@/components/SizeLandingPage";

export const metadata = sizeMetadata(50);

export default function Page() {
  return <SizeLandingPage kb={50} />;
}
