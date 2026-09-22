// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Override both when moving to a custom domain (e.g. SITE_URL=https://example.com BASE_PATH=/).
const SITE_URL = process.env.SITE_URL ?? "https://dangokangoo.github.io";
const BASE_PATH = process.env.BASE_PATH ?? "/william-odriscoll";

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: "ignore",
  integrations: [sitemap()],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Manrope",
      cssVariable: "--font-display",
      weights: ["500 800"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Inter",
      cssVariable: "--font-body",
      weights: ["400 600"],
      fallbacks: ["sans-serif"],
    },
  ],
});
