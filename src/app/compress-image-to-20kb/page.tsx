import SizeLandingPage, { sizeMetadata } from "@/components/SizeLandingPage";

export const metadata = sizeMetadata(20);

export default function Page() {
  return <SizeLandingPage kb={20} />;
}
