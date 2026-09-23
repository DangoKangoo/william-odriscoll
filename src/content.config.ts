import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// One YAML file per client site. The file name (without .yaml) is the slug,
// which also names its screenshot in src/assets/shots/<slug>.jpg.
const sites = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/sites" }),
  schema: z.object({
    name: z.string().min(1),
    url: z.url(),
    description: z.string().min(20).max(220),
    location: z.string().min(1),
    tags: z.array(z.string().min(1)).min(1).max(5),
    launched: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM"),
    featured: z.boolean().default(false),
    order: z.number().int().nonnegative(),
  }),
});

// One JSON file per project that's in progress (shown anonymously, no link).
// Copy a file to add a card; delete it when the project launches.
const inProgress = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/in-progress" }),
  schema: z.object({
    title: z.string().min(1),
    body: z.string().min(1).max(160),
    order: z.number().int().nonnegative(),
  }),
});

export const collections = { sites, inProgress };
