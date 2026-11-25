import ExamLandingPage, { examMetadata } from "@/components/ExamLandingPage";

export const metadata = examMetadata("pan-card-photo-signature-resizer");

export default function Page() {
  return <ExamLandingPage slug="pan-card-photo-signature-resizer" />;
}
