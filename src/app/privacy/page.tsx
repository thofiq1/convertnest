import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ToolNest",
  description: "ToolNest privacy policy. All tools run entirely in your browser. We never collect, store, or transmit your data.",
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>Privacy Policy</h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>Last updated: November 2026</p>

      <div style={{ lineHeight: 1.8 }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "2rem", marginBottom: "0.5rem" }}>
          Your Privacy Matters
        </h2>
        <p>
          At ToolNest, we take your privacy seriously. All of our tools are designed to run entirely
          in your web browser using client-side JavaScript. This means your data never leaves your device.
        </p>

        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "2rem", marginBottom: "0.5rem" }}>
          Data Collection
        </h2>
        <p>
          <strong>We do not collect, store, or transmit any data you enter into our tools.</strong> Your
          text, files, images, and all other inputs are processed locally in your browser and are never
          sent to our servers or any third party.
        </p>

        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "2rem", marginBottom: "0.5rem" }}>
          Analytics
        </h2>
        <p>
          We use Google Analytics to understand how visitors use our website. This collects anonymized
          data about page visits, browser type, and general location. No personal information or tool
          input data is ever included in analytics.
        </p>

        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "2rem", marginBottom: "0.5rem" }}>
          Advertising
        </h2>
        <p>
          We use Google AdSense to display advertisements. Google may use cookies to serve ads based
          on your prior visits to this or other websites. You can opt out of personalized advertising
          by visiting{" "}
          <a href="https://www.google.com/settings/ads" style={{ color: "var(--primary)" }}>
            Google&apos;s Ad Settings
          </a>
          .
        </p>

        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "2rem", marginBottom: "0.5rem" }}>
          Cookies
        </h2>
        <p>
          ToolNest itself does not set any cookies. However, third-party services like Google Analytics
          and Google AdSense may set cookies as described above.
        </p>

        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "2rem", marginBottom: "0.5rem" }}>
          Contact
        </h2>
        <p>
          If you have any questions about this privacy policy, feel free to contact us at{" "}
          <a href="mailto:privacy@toolnest.com" style={{ color: "var(--primary)" }}>
            privacy@toolnest.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
