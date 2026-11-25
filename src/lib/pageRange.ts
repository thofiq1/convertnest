// Strict page-range parser shared by Split PDF and PDF to JPG.
// Accepts "1-3, 5, 8-10" (any dash style). Anything it can't understand is
// reported instead of being silently dropped, so users never get wrong pages.
export function parsePageRange(input: string, total: number): { pages: number[]; error?: string } {
  const cleaned = input.replace(/[‐-―−]/g, "-").replace(/\bto\b/gi, "-");
  const parts = cleaned.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  const pages = new Set<number>();
  const hint = `This PDF has ${total} page${total === 1 ? "" : "s"}. Use a format like 1-3, 5.`;
  if (parts.length === 0) return { pages: [], error: `Enter the pages you want. ${hint}` };
  for (const part of parts) {
    const single = /^\d+$/.exec(part);
    const range = /^(\d+)\s*-\s*(\d+)$/.exec(part);
    if (single) {
      const n = Number(part);
      if (n < 1 || n > total) return { pages: [], error: `Page ${n} doesn't exist. ${hint}` };
      pages.add(n);
    } else if (range) {
      const a = Number(range[1]), b = Number(range[2]);
      if (a > b) return { pages: [], error: `"${part}" is backwards — write the smaller page first. ${hint}` };
      if (a < 1 || b > total) return { pages: [], error: `"${part}" goes outside the document. ${hint}` };
      for (let i = a; i <= b; i++) pages.add(i);
    } else {
      return { pages: [], error: `Couldn't understand "${part}". ${hint}` };
    }
  }
  return { pages: Array.from(pages).sort((x, y) => x - y) };
}
