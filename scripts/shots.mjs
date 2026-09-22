// Captures a screenshot of every client site and records whether it can be
// shown in a live iframe from this portfolio's origin.
//
// Usage: npm run shots            (all sites)
//        npm run shots -- dormston (one site, by slug)
//
// Writes src/assets/shots/<slug>.jpg and src/data/embeds.json. Commit both.
// Re-run after adding a site or changing the deploy domain (SITE_URL).

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(import.meta.dirname, "..");
const SITES_DIR = path.join(ROOT, "src/content/sites");
const SHOTS_DIR = path.join(ROOT, "src/assets/shots");
const EMBEDS_FILE = path.join(ROOT, "src/data/embeds.json");
const PORTFOLIO_ORIGIN = new URL(
  process.env.SITE_URL ?? "https://dangokangoo.github.io",
).origin;
const VIEWPORT = { width: 1280, height: 800 };
const NAV_TIMEOUT_MS = 30_000;

async function readSiteUrls(onlySlug) {
  const files = (await readdir(SITES_DIR)).filter((f) => f.endsWith(".yaml"));
  const sites = [];
  for (const file of files) {
    const slug = file.replace(/\.yaml$/, "");
    if (onlySlug && slug !== onlySlug) continue;
    const text = await readFile(path.join(SITES_DIR, file), "utf8");
    const match = text.match(/^url:\s*["']?([^"'\s]+)/m);
    if (!match) throw new Error(`${file}: no "url:" line found`);
    sites.push({ slug, url: match[1] });
  }
  if (onlySlug && sites.length === 0)
    throw new Error(`No site named "${onlySlug}"`);
  return sites;
}

// Does a CSP frame-ancestors source expression allow our origin?
function sourceAllows(source, origin, siteOrigin) {
  const s = source.toLowerCase();
  if (s === "*") return true;
  if (s === "'none'") return false;
  if (s === "'self'") return origin.origin === siteOrigin;
  if (s.endsWith(":") && !s.includes("/")) return origin.protocol === s;

  const m = s.match(
    /^(?:([a-z][a-z0-9+.-]*):\/\/)?(\*\.)?([^:/]+)(?::(\d+|\*))?/,
  );
  if (!m) return false;
  const [, scheme, wildcard, host, port] = m;
  if (scheme && `${scheme}:` !== origin.protocol) return false;
  const hostOk = wildcard
    ? origin.hostname.endsWith(`.${host}`)
    : origin.hostname === host;
  if (!hostOk) return false;
  if (port && port !== "*") {
    const actual = origin.port || (origin.protocol === "https:" ? "443" : "80");
    if (port !== actual) return false;
  }
  return true;
}

function checkEmbeddable(headers, siteOrigin) {
  const origin = new URL(PORTFOLIO_ORIGIN);
  const csp = headers.get("content-security-policy") ?? "";
  const directive = csp
    .split(/[;,]/)
    .map((d) => d.trim())
    .find((d) => d.toLowerCase().startsWith("frame-ancestors"));

  // CSP frame-ancestors overrides X-Frame-Options when present.
  if (directive) {
    const sources = directive.split(/\s+/).slice(1);
    const allowed = sources.some((src) =>
      sourceAllows(src, origin, siteOrigin),
    );
    return allowed
      ? { embeddable: true, reason: `frame-ancestors allows ${origin.origin}` }
      : { embeddable: false, reason: `frame-ancestors: ${sources.join(" ")}` };
  }
  const xfo = headers.get("x-frame-options");
  if (xfo) return { embeddable: false, reason: `X-Frame-Options: ${xfo}` };
  return { embeddable: true, reason: "no framing restrictions" };
}

async function main() {
  const onlySlug = process.argv[2];
  const sites = await readSiteUrls(onlySlug);
  await mkdir(SHOTS_DIR, { recursive: true });

  let embeds = {};
  try {
    embeds = JSON.parse(await readFile(EMBEDS_FILE, "utf8"));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }

  const browser = await chromium.launch();
  const failures = [];
  try {
    for (const { slug, url } of sites) {
      try {
        const res = await fetch(url, { redirect: "follow" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const embed = checkEmbeddable(res.headers, new URL(res.url).origin);

        const page = await browser.newPage({ viewport: VIEWPORT });
        await page.goto(url, { waitUntil: "load", timeout: NAV_TIMEOUT_MS });
        // Give fonts, lazy images and entrance animations a moment to settle.
        await page.waitForTimeout(2500);
        await page.screenshot({
          path: path.join(SHOTS_DIR, `${slug}.jpg`),
          type: "jpeg",
          quality: 80,
        });
        await page.close();

        embeds[slug] = {
          ...embed,
          checkedFor: PORTFOLIO_ORIGIN,
          checkedAt: new Date().toISOString(),
        };
        console.log(
          `ok   ${slug}  embeddable=${embed.embeddable} (${embed.reason})`,
        );
      } catch (err) {
        failures.push(slug);
        console.error(`FAIL ${slug}  ${url}: ${err.message}`);
      }
    }
  } finally {
    await browser.close();
  }

  const sorted = Object.fromEntries(
    Object.entries(embeds).sort(([a], [b]) => a.localeCompare(b)),
  );
  await writeFile(EMBEDS_FILE, JSON.stringify(sorted, null, 2) + "\n");

  if (failures.length) {
    console.error(
      `\n${failures.length} site(s) failed: ${failures.join(", ")}`,
    );
    process.exit(1);
  }
}

await main();
