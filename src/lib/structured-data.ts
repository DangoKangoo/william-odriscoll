// JSON-LD for the homepage, so Google can read who William is, what he does
// and where. All values come from config/site.ts.
import { site } from "../config/site";

type JsonLd = Record<string, unknown>;

/**
 * Builds the ProfessionalService schema. Throws on missing required values,
 * so a bad config fails the build instead of shipping broken markup.
 */
export function businessSchema(
  siteUrl: URL,
  assetUrl: (path: string) => URL,
): JsonLd {
  const required = {
    name: site.name,
    email: site.email,
    description: site.description,
    locality: site.address.locality,
    areaServed: site.areaServed,
  };
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length) {
    throw new Error(
      `[structured-data] Missing site config: ${missing.join(", ")}`,
    );
  }

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteUrl.href}#business`,
    name: site.name,
    description: site.description,
    url: siteUrl.href,
    email: `mailto:${site.email}`,
    logo: assetUrl("icon-512.png").href,
    image: assetUrl("og.png").href,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    areaServed: { "@type": "Country", name: site.areaServed },
    knowsAbout: [
      "Web design",
      "Web development",
      "Local SEO",
      "Golf businesses",
    ],
    founder: {
      "@type": "Person",
      name: site.name,
      jobTitle: site.jobTitle,
      sameAs: [site.linkedin],
    },
  };
}

/** Serializes for a <script type="application/ld+json">, escaping "<" so it can't close the tag. */
export function toJsonLdScript(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
