import { tools } from "@/lib/tools";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://convertnest-app.vercel.app";

  const toolPages = tools.map((tool) => ({
    url: `${baseUrl}/${tool.slug}`,
    lastModified: new Date("2026-11-21"),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date("2026-11-21"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date("2026-11-21"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2026-11-22"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date("2026-11-22"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...toolPages,
  ];
}
