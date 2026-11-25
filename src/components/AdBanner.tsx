"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot?: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
}

export default function AdBanner({ slot, format = "auto" }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!slot || pushed.current) return;
    try {
      const adsbygoogle = (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle;
      if (adsbygoogle) {
        adsbygoogle.push({});
        pushed.current = true;
      }
    } catch {
      // AdSense not loaded yet or blocked — fail silently
    }
  }, [slot]);

  if (!slot) {
    return null; // No ad slot configured — render nothing
  }

  return (
    // Reserve the ad's height up front so the page doesn't jump when it loads.
    <div ref={adRef} style={{ textAlign: "center", margin: "1rem 0", minHeight: format === "rectangle" ? 280 : format === "vertical" ? 600 : 100 }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9974156537162042"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
