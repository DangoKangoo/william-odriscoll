import { getCollection, type CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import embeds from "../data/embeds.json";

type EmbedStatus = {
  embeddable: boolean;
  reason: string;
  checkedFor: string;
  checkedAt: string;
};

export type Site = CollectionEntry<"sites">["data"] & {
  slug: string;
  screenshot: ImageMetadata;
  embed: EmbedStatus;
};

const screenshots = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/shots/*.jpg",
  {
    eager: true,
  },
);
const embedStatus: Record<string, EmbedStatus> = embeds;

// Joins each site entry with its screenshot and embed check.
// Fails the build if either is missing, rather than rendering an empty card.
export async function getSites(): Promise<Site[]> {
  const entries = await getCollection("sites");
  const missing: string[] = [];

  const sites = entries.map((entry) => {
    const screenshot = screenshots[`../assets/shots/${entry.id}.jpg`]?.default;
    const embed = embedStatus[entry.id];
    if (!screenshot || !embed) missing.push(entry.id);
    return { ...entry.data, slug: entry.id, screenshot, embed } as Site;
  });

  if (missing.length) {
    throw new Error(
      `Missing screenshot or embed check for: ${missing.join(", ")}. Run "npm run shots" and commit the results.`,
    );
  }

  return sites.sort((a, b) => a.order - b.order);
}
