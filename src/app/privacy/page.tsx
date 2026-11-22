import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ConvertNest",
  description:
    "ConvertNest privacy policy. All tools run entirely in your browser. Learn how we handle data, cookies, and advertising.",
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>
        Privacy Policy
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        Last updated: November 2026
      </p>

      <div style={{ lineHeight: 1.8 }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginTop: "2rem",
            marginBottom: "0.5rem",
          }}
        >
          Your Privacy Matters
        </h2>
        <p>
          At ConvertNest, we take your privacy seriously. All of our file
          conversion and processing tools are designed to run entirely in your
          web browser using client-side JavaScript. This means your files never
          leave your device — they are never uploaded to any server.
        </p>

        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginTop: "2rem",
            marginBottom: "0.5rem",
          }}
        >
          File Processing &amp; Data Collection
        </h2>
        <p>
          <strong>
            We do not collect, store, or transmit any files you process with our
            tools.
          </strong>{" "}
          When you compress a PDF, convert an image, merge documents, or use any
          other tool on ConvertNest, all processing happens locally in your
          browser. Your files, text, and images are never sent to our servers or
          any third party.
        </p>

        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginTop: "2rem",
            marginBottom: "0.5rem",
          }}
        >
          Google Analytics
        </h2>
        <p>
          We use Google Analytics (Measurement ID: G-HYG2KD68KP) to understand
          how visitors use our website. Google Analytics collects information
          such as:
        </p>
        <ul
          style={{
            paddingLeft: "1.5rem",
            marginTop: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <li>Pages visited and time spent on each page</li>
          <li>Browser type, device type, and screen resolution</li>
          <li>General geographic location (country/city level)</li>
          <li>Referral sources (how you found our site)</li>
        </ul>
        <p>
          This data is anonymized and aggregated. No personal information or
          file content is ever included in analytics data. For more information,
          see{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--primary)" }}
          >
            Google&apos;s Privacy Policy
          </a>
          .
        </p>

        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginTop: "2rem",
            marginBottom: "0.5rem",
          }}
        >
          Advertising
        </h2>
        <p>
          ConvertNest uses Google AdSense to display advertisements, which helps
          us keep all tools free for everyone. Google AdSense and its partners
          may use cookies and web beacons to serve ads based on your prior
          visits to this website and other websites on the internet.
        </p>
        <p style={{ marginTop: "0.75rem" }}>
          Specifically, third-party vendors including Google use cookies to serve
          ads based on your previous visits. Google&apos;s use of advertising
          cookies enables it and its partners to serve ads based on your visit
          to ConvertNest and/or other sites on the internet.
        </p>
        <p style={{ marginTop: "0.75rem" }}>
          <strong>You can opt out of personalized advertising</strong> by
          visiting{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--primary)" }}
          >
            Google&apos;s Ad Settings
          </a>
          . Alternatively, you can opt out of some third-party vendors&apos; use
          of cookies for personalized advertising by visiting{" "}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--primary)" }}
          >
            www.aboutads.info
          </a>
          .
        </p>

        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginTop: "2rem",
            marginBottom: "0.5rem",
          }}
        >
          Cookies
        </h2>
        <p>
          ConvertNest itself does not set any first-party cookies. However,
          third-party services we use may set cookies on your device:
        </p>
        <ul
          style={{
            paddingLeft: "1.5rem",
            marginTop: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <li>
            <strong>Google Analytics cookies</strong> — used to distinguish
            unique users and track sessions (e.g., _ga, _gid)
          </li>
          <li>
            <strong>Google AdSense cookies</strong> — used to serve relevant
            advertisements and track ad performance
          </li>
          <li>
            <strong>DoubleClick cookies</strong> — used by Google for ad
            serving and frequency capping
          </li>
        </ul>
        <p>
          You can control and delete cookies through your browser settings. Note
          that disabling cookies may affect the functionality of some third-party
          features on our site, but all ConvertNest tools will continue to work
          normally.
        </p>

        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginTop: "2rem",
            marginBottom: "0.5rem",
          }}
        >
          Third-Party Links
        </h2>
        <p>
          Our website may contain links to external websites. We are not
          responsible for the privacy practices or content of those sites. We
          encourage you to review the privacy policies of any third-party sites
          you visit.
        </p>

        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginTop: "2rem",
            marginBottom: "0.5rem",
          }}
        >
          Children&apos;s Privacy
        </h2>
        <p>
          ConvertNest does not knowingly collect personal information from
          children under the age of 13. If you believe a child has provided us
          with personal information, please contact us and we will take steps to
          remove that information.
        </p>

        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginTop: "2rem",
            marginBottom: "0.5rem",
          }}
        >
          Changes to This Policy
        </h2>
        <p>
          We may update this privacy policy from time to time. Any changes will
          be posted on this page with an updated revision date. We encourage you
          to review this policy periodically.
        </p>

        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginTop: "2rem",
            marginBottom: "0.5rem",
          }}
        >
          Contact
        </h2>
        <p>
          If you have any questions about this privacy policy, feel free to
          contact us at{" "}
          <a
            href="mailto:thofiq57@gmail.com"
            style={{ color: "var(--primary)" }}
          >
            thofiq57@gmail.com
          </a>{" "}
          or visit our{" "}
          <a href="/contact" style={{ color: "var(--primary)" }}>
            Contact page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
