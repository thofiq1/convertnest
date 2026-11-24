import SizeLandingPage, { sizeMetadata } from "@/components/SizeLandingPage";

export const metadata = sizeMetadata(100);

export default function Page() {
  return <SizeLandingPage kb={100} />;
}
