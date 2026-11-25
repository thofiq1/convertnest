import type { Metadata } from "next";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import TargetSizeCompressor from "@/components/TargetSizeCompressor";
import { getExamPage } from "@/lib/examPages";
import { DEFAULT_OG_IMAGES } from "@/lib/site";

export function examMetadata(slug: string): Metadata {
  const page = getExamPage(slug)!;
  return {
    title: { absolute: `${page.metaTitle} | FitTheFile` },
    description: page.metaDescription,
    openGraph: { images: DEFAULT_OG_IMAGES, title: page.metaTitle, description: page.metaDescription, url: `/${page.slug}`, siteName: "FitTheFile", type: "website" },
    alternates: { canonical: `/${page.slug}` },
  };
}

const h2 = { color: "var(--foreground)", fontSize: "1.25rem", fontWeight: 700, margin: "2rem 0 0.75rem" } as const;
const cell = { padding: "0.5rem 0.6rem", borderBottom: "1px solid var(--card-border)", textAlign: "left" as const, verticalAlign: "top" as const };

export default function ExamLandingPage({ slug }: { slug: string }) {
  const page = getExamPage(slug)!;
  return (
    <ToolLayout
      title={page.h1}
      description={page.intro}
      slug={page.slug}
      faqs={page.faqs}
      related={page.related}
      guides={page.guides}
    >
      <TargetSizeCompressor defaultKb={page.presets[0].maxKb} presets={page.presets} showOtherSizes={false} />

      <section style={{ marginTop: "2rem", lineHeight: 1.75, color: "var(--muted)", fontSize: "0.95rem" }}>
        <h2 style={h2}>Official requirements</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <tbody>
              {page.requirements.map((r) => (
                <tr key={r.item}>
                  <th scope="row" style={{ ...cell, color: "var(--foreground)", fontWeight: 600, width: "35%" }}>{r.item}</th>
                  <td style={cell}>{r.spec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: "0.85rem", marginTop: "0.6rem" }}>
          Source:{" "}
          {page.sources.map((s, i) => (
            <span key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "underline" }}>{s.label}</a>
              {i < page.sources.length - 1 ? "; " : ""}
            </span>
          ))}
          . {page.verified}.
        </p>
        <p style={{ marginTop: "0.75rem" }}>{page.caveat}</p>

        <h2 style={h2}>How to use it</h2>
        <ol style={{ paddingLeft: "1.25rem", listStyle: "decimal" }}>
          {page.steps.map((s) => <li key={s} style={{ marginBottom: "0.35rem" }}>{s}</li>)}
        </ol>

        <h2 style={h2}>Tips for a clean result</h2>
        <ul style={{ paddingLeft: "1.25rem", listStyle: "disc" }}>
          {page.tips.map((t) => <li key={t} style={{ marginBottom: "0.35rem" }}>{t}</li>)}
        </ul>
        <p style={{ marginTop: "0.75rem" }}>
          iPhone photo in HEIC format? Convert it with <Link href="/heic-to-jpg" style={{ color: "var(--primary)", textDecoration: "underline" }}>HEIC to JPG</Link> first.
          Need a different size? Use the general <Link href="/compress-image-to-50kb" style={{ color: "var(--primary)", textDecoration: "underline" }}>image size tool</Link> and set your own limit and dimensions.
        </p>
      </section>
    </ToolLayout>
  );
}
