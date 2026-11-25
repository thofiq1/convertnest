import ExamLandingPage, { examMetadata } from "@/components/ExamLandingPage";

export const metadata = examMetadata("us-visa-photo-resizer");

export default function Page() {
  return <ExamLandingPage slug="us-visa-photo-resizer" />;
}
