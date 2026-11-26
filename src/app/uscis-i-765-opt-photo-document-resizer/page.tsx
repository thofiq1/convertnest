import ExamLandingPage, { examMetadata } from "@/components/ExamLandingPage";

export const metadata = examMetadata("uscis-i-765-opt-photo-document-resizer");

export default function Page() {
  return <ExamLandingPage slug="uscis-i-765-opt-photo-document-resizer" />;
}
