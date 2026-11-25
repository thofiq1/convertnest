// Place text where the reader actually sees it: honours a page's /Rotate
// and a crop/media box that doesn't start at (0,0).
type PageLike = {
  getCropBox(): { x: number; y: number; width: number; height: number };
  getRotation(): { angle: number };
};

/** Size of the page as displayed (after rotation). */
export function visualSize(page: PageLike): { width: number; height: number } {
  const b = page.getCropBox();
  const r = ((page.getRotation().angle % 360) + 360) % 360;
  return r === 90 || r === 270 ? { width: b.height, height: b.width } : { width: b.width, height: b.height };
}

/** Convert a point/angle in displayed coordinates (origin bottom-left) to page coordinates. */
export function toPageSpace(page: PageLike, vx: number, vy: number, angleDeg = 0): { x: number; y: number; angle: number } {
  const b = page.getCropBox();
  const r = ((page.getRotation().angle % 360) + 360) % 360;
  let x = vx, y = vy;
  if (r === 90) { x = b.width - vy; y = vx; }
  else if (r === 180) { x = b.width - vx; y = b.height - vy; }
  else if (r === 270) { x = vy; y = b.height - vx; }
  return { x: b.x + x, y: b.y + y, angle: (angleDeg + r) % 360 };
}
