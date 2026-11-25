import SizeLandingPage, { sizeMetadata } from "@/components/SizeLandingPage";

export const metadata = sizeMetadata(10);

export default function Page() {
  return <SizeLandingPage kb={10} />;
}
