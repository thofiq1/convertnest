/**
 * Canonical site origin. Set NEXT_PUBLIC_SITE_URL (no trailing slash) when the
 * custom domain goes live; every canonical, OG URL and JSON-LD URL reads this.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://convertnest-app.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "ConvertNest";

/** Absolute URL for a site path, e.g. absoluteUrl("/merge-pdf"). */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
