import ExamLandingPage, { examMetadata } from "@/components/ExamLandingPage";

export const metadata = examMetadata("ibps-photo-signature-resizer");

export default function Page() {
  return <ExamLandingPage slug="ibps-photo-signature-resizer" />;
}
