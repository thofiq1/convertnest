import SizeLandingPage, { sizeMetadata } from "@/components/SizeLandingPage";

export const metadata = sizeMetadata(200);

export default function Page() {
  return <SizeLandingPage kb={200} />;
}
