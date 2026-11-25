import SizeLandingPage, { sizeMetadata } from "@/components/SizeLandingPage";

export const metadata = sizeMetadata(30);

export default function Page() {
  return <SizeLandingPage kb={30} />;
}
