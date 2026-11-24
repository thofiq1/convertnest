import { SITE_URL } from "@/lib/site";

interface ToolJsonLdProps {
  name: string;
  description: string;
  url: string;
}

export default function ToolJsonLd({ name, description, url }: ToolJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: name,
    description: description,
    url: url,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: "ConvertNest",
      url: SITE_URL,
    },
    browserRequirements: "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.",
    permissions: "none",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
