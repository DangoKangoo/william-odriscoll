// Regenerates every brand asset from the one logo definition in src/lib/logo.ts:
//   public/favicon.svg        flag on the green tile
//   public/og.png             1200x630 social share card
//   brand/logo-mark-*.svg     flag mark, green and white
//   brand/logo-mark-*-{512,1024}.png
//
// Usage: npm run brand   (needs: npx playwright install chromium)
// Commit the outputs. The share card loads Manrope/Inter from Google Fonts.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { BRAND_COLORS, LOGO_PATH, LOGO_STROKE_WIDTH } from "../src/lib/logo.ts";
import { contourPaths } from "../src/lib/topo.ts";
import { site } from "../src/config/site.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const BRAND_DIR = path.join(ROOT, "brand");
const PUBLIC_DIR = path.join(ROOT, "public");
const PNG_SIZES = [512, 1024];

// The mark's path spans roughly x 7-18, y 3.5-21. This square frames it with even padding.
const MARK_VIEWBOX = "1.5 1.25 22 22";

function markSvg(color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}"><path d="${LOGO_PATH}" fill="none" stroke="${color}" stroke-width="${LOGO_STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`;
}

function faviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${BRAND_COLORS.green}"/><svg x="4" y="4" width="24" height="24" viewBox="${MARK_VIEWBOX}"><path d="${LOGO_PATH}" fill="none" stroke="${BRAND_COLORS.offWhite}" stroke-width="${LOGO_STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round"/></svg></svg>\n`;
}

function shareCardHtml() {
  const contours = contourPaths({
    cx: 960,
    cy: 300,
    rings: 16,
    spacing: 34,
    seed: 18,
  })
    .map((d) => `<path d="${d}"/>`)
    .join("");
  return `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500&family=Manrope:wght@800&display=block" rel="stylesheet">
<style>
  body { margin: 0; width: 1200px; height: 630px; background: #f7f6f1; font-family: Inter, sans-serif; color: #10231a; overflow: hidden; position: relative; }
  .contours { position: absolute; inset: 0; }
  .contours path { fill: none; stroke: ${BRAND_COLORS.green}; stroke-opacity: .2; stroke-width: 1.5; }
  .content { position: absolute; left: 96px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; gap: 28px; }
  .lockup { display: flex; align-items: center; gap: 28px; }
  .lockup svg { width: 120px; height: 120px; }
  h1 { margin: 0; font: 800 76px/1 Manrope, sans-serif; letter-spacing: -0.035em; }
  p { margin: 0; font-size: 34px; color: #52625a; }
  .loc { font-size: 22px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: ${BRAND_COLORS.green}; }
</style></head><body>
<svg class="contours" viewBox="0 0 1200 630">${contours}</svg>
<div class="content">
  <div class="lockup">${markSvg(BRAND_COLORS.green)}<h1>${site.name}</h1></div>
  <p>${site.role}.</p>
  <span class="loc">${site.location}</span>
</div>
</body></html>`;
}

async function main() {
  await mkdir(BRAND_DIR, { recursive: true });
  await writeFile(path.join(PUBLIC_DIR, "favicon.svg"), faviconSvg());

  const variants = { green: BRAND_COLORS.green, white: BRAND_COLORS.white };
  for (const [name, color] of Object.entries(variants)) {
    await writeFile(
      path.join(BRAND_DIR, `logo-mark-${name}.svg`),
      markSvg(color),
    );
  }

  const browser = await chromium.launch();
  try {
    for (const [name, color] of Object.entries(variants)) {
      for (const size of PNG_SIZES) {
        const page = await browser.newPage({
          viewport: { width: size, height: size },
        });
        await page.setContent(
          `<body style="margin:0;background:transparent">${markSvg(color).replace("<svg ", `<svg width="${size}" height="${size}" `)}</body>`,
        );
        await page.screenshot({
          path: path.join(BRAND_DIR, `logo-mark-${name}-${size}.png`),
          omitBackground: true,
        });
        await page.close();
      }
    }

    const card = await browser.newPage({
      viewport: { width: 1200, height: 630 },
    });
    await card.setContent(shareCardHtml(), { waitUntil: "networkidle" });
    const fontsLoaded = await card.evaluate(async () => {
      await document.fonts.ready;
      return (
        document.fonts.check("800 76px Manrope") &&
        document.fonts.check("500 34px Inter")
      );
    });
    if (!fontsLoaded) {
      throw new Error(
        "Share card fonts did not load from Google Fonts. Check your connection and re-run.",
      );
    }
    await card.screenshot({ path: path.join(PUBLIC_DIR, "og.png") });
  } finally {
    await browser.close();
  }

  console.log(
    "Wrote public/favicon.svg, public/og.png and brand/ (2 SVG, 4 PNG).",
  );
}

await main();
