// Small allowlist sanitizer for HTML produced from user-supplied documents
// (e.g. mammoth's .docx → HTML). Runs in the browser only.

const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "sub", "sup", "small", "span",
  "ul", "ol", "li", "blockquote", "pre", "code",
  "table", "thead", "tbody", "tfoot", "tr", "td", "th", "caption", "colgroup", "col",
  "a", "img", "div",
]);

// Elements whose content must be dropped entirely, not unwrapped.
const DROP_WITH_CONTENT = new Set([
  "script", "style", "iframe", "object", "embed", "frame", "frameset",
  "noscript", "template", "svg", "math", "form", "input", "button",
  "select", "textarea", "link", "meta", "base",
]);

const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href", "title"],
  img: ["src", "alt", "width", "height"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan"],
  col: ["span"],
  colgroup: ["span"],
  ol: ["start", "type"],
};

function safeHref(v: string): string | null {
  const t = v.trim();
  if (t.startsWith("#")) return t;
  try {
    const u = new URL(t, "https://invalid.example/");
    if (u.origin === "https://invalid.example") return null; // relative path
    return ["http:", "https:", "mailto:"].includes(u.protocol) ? t : null;
  } catch {
    return null;
  }
}

function safeImgSrc(v: string): string | null {
  const t = v.trim();
  // mammoth embeds images as data: URIs; allow raster image types only.
  return /^data:image\/(png|jpe?g|gif|webp|bmp);base64,[a-z0-9+/=\s]+$/i.test(t) ? t : null;
}

function clean(node: Element, doc: Document) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.remove();
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const el = child as Element;
    const tag = el.tagName.toLowerCase();

    if (DROP_WITH_CONTENT.has(tag)) {
      el.remove();
      continue;
    }
    if (!ALLOWED_TAGS.has(tag)) {
      // Unwrap unknown elements but keep their (cleaned) text/children.
      clean(el, doc);
      const frag = doc.createDocumentFragment();
      while (el.firstChild) frag.appendChild(el.firstChild);
      el.replaceWith(frag);
      continue;
    }

    const allowed = ALLOWED_ATTRS[tag] || [];
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (!allowed.includes(name)) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (tag === "a" && name === "href") {
        const v = safeHref(attr.value);
        if (v) el.setAttribute("href", v);
        else el.removeAttribute("href");
      } else if (tag === "img" && name === "src") {
        const v = safeImgSrc(attr.value);
        if (v) el.setAttribute("src", v);
        else el.removeAttribute("src");
      }
    }
    if (tag === "a" && el.getAttribute("href") && !el.getAttribute("href")!.startsWith("#")) {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer nofollow");
    }
    clean(el, doc);
  }
}

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") return "";
  const doc = new DOMParser().parseFromString(`<!DOCTYPE html><body>${html}</body>`, "text/html");
  clean(doc.body, doc);
  return doc.body.innerHTML;
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
