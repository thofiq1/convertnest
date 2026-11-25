import { ImageResponse } from "next/og";

// Default social share card for every route that doesn't define its own.
export const alt = "FitTheFile — Make any PDF or photo fit an upload limit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 48 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "rgba(255,255,255,0.18)",
              border: "2px solid rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 28,
            }}
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 88, fontWeight: 800 }}>
            FitThe<span style={{ color: "#c7d2fe", marginLeft: -14 }}>File</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 60, fontWeight: 700, lineHeight: 1.15, maxWidth: 1000 }}>
          Make any PDF or photo fit an upload limit
        </div>
        <div style={{ display: "flex", fontSize: 36, marginTop: 36, color: "rgba(255,255,255,0.85)" }}>
          Free · Private · In your browser
        </div>
        <div style={{ display: "flex", fontSize: 28, marginTop: 56, color: "rgba(255,255,255,0.7)" }}>
          fitthefile.com
        </div>
      </div>
    ),
    { ...size }
  );
}
