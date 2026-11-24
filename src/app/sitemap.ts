import { SITE_URL } from "@/lib/site";
import { tools } from "@/lib/tools";
import { blogPosts } from "@/lib/blog";
import { sizePages, pdfSizePages } from "@/lib/sizePages";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

  const toolPages = tools.map((tool) => ({
    url: `${baseUrl}/${tool.slug}`,
    lastModified: new Date("2026-11-21"),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const sizeLandingPages = [...pdfSizePages, ...sizePages].map((p) => ({
    url: `${baseUrl}/${p.slug}`,
    lastModified: new Date("2026-11-24"),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date("2026-11-21"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date("2026-11-24"),
      changeFrequency: "weekly",
      priority: 0.8,
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
    ...sizeLandingPages,
    ...blogPages,
  ];
}
