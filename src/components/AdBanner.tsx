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
      data-ad-slot={slot}
      data-ad-format={format}
      style={{
        minHeight: heightMap[format],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "0.75rem",
      }}
    >
      {/* Replace with actual AdSense code after approval */}
      <span style={{ opacity: 0.5, fontSize: "0.7rem" }}>
        Ad Space — {format} ({slot})
      </span>
    </div>
  );
}
