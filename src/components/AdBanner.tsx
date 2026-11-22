"use client";

interface AdBannerProps {
  slot?: string;
  format?: "horizontal" | "vertical" | "rectangle";
}

export default function AdBanner({ slot = "placeholder", format = "horizontal" }: AdBannerProps) {
  const heightMap = {
    horizontal: "90px",
    vertical: "600px",
    rectangle: "250px",
  };

  return (
    <div
      className="ad-placeholder"
      style={{
        minHeight: heightMap[format],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Replace with actual AdSense code after approval */}
      <span>Ad Space — {format} ({slot})</span>
    </div>
  );
}
