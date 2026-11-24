import type { Metadata } from "next";

// Tool is disabled (pdf-lib can't encrypt) — keep it out of search results
// until real encryption ships, so nobody lands here expecting it to work.
export const metadata: Metadata = {
  title: "Protect PDF — Temporarily Unavailable",
  description: "Password protection is temporarily unavailable while we upgrade our encryption engine.",
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
