"use client";

import { useEffect } from "react";

// Every tool's upload box is a <div className="drop-zone"> with an onClick.
// This makes them reachable and usable by keyboard and screen readers on
// every page, without changing each tool: role="button", tabIndex, a label,
// and Enter/Space to open the file picker.
export default function DropZoneA11y() {
  useEffect(() => {
    const enhance = () => {
      document.querySelectorAll<HTMLElement>(".drop-zone, [data-dropzone]").forEach((el) => {
        if (el.dataset.a11y) return;
        el.dataset.a11y = "1";
        el.setAttribute("role", "button");
        el.tabIndex = 0;
        if (!el.getAttribute("aria-label")) {
          const text = ((el.innerText || el.textContent || "").split("\n").map((l) => l.trim()).find((l) => /[a-z]{3}/i.test(l)) || "").slice(0, 120);
          el.setAttribute("aria-label", text ? `Choose a file. ${text}` : "Choose a file");
        }
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            el.click();
          }
        });
      });
      document.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((input) => {
        if (!input.getAttribute("aria-label") && !input.labels?.length) input.setAttribute("aria-label", "Choose a file");
      });
    };
    // On phones the result often appears below the fold. When a download
    // control first appears off-screen, bring it into view.
    const seen = new WeakSet<Element>();
    const revealDownloads = () => {
      const candidates = document.querySelectorAll<HTMLElement>("main a[download], main button");
      for (const el of Array.from(candidates)) {
        if (seen.has(el)) continue;
        seen.add(el);
        const isDownload = el.tagName === "A" || /^\s*download/i.test(el.textContent || "");
        if (!isDownload) continue;
        const rect = el.getBoundingClientRect();
        if (rect.height > 0 && rect.top > window.innerHeight) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          break;
        }
      }
    };
    enhance();
    document.querySelectorAll("main a[download], main button").forEach((el) => seen.add(el));
    const obs = new MutationObserver(() => {
      enhance();
      revealDownloads();
    });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);
  return null;
}
