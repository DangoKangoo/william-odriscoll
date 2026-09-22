# Architecture

A single static page built by Astro. There is no server, database or client framework; the only JavaScript runs the scroll reveals and the live-preview loader.

## Layout

```
src/
  config/site.ts          All page copy: hero, services, contact, nav
  content.config.ts       Schema for client site entries (build fails on bad data)
  content/sites/*.yaml    One file per client site. File name = slug
  assets/shots/*.jpg      Screenshot per slug (written by npm run shots)
  data/embeds.json        Per slug: can it be framed from our origin? (written by npm run shots)
  lib/
    logo.ts               The flag mark (path, stroke, brand colors)
    shots.ts              Random golf-shot geometry for the hero loop
    sites.ts              Joins entries + screenshots + embed checks, sorted by order
    topo.ts               Seeded contour generator for the hero art
    url.ts                withBase() for base-path aware URLs
  components/
    layout/               Header, Footer
    sections/             Hero, Work, Services, Contact (one per page section)
    ui/                   Button, BrowserFrame, SiteCard
    art/                  TopoGreen, OutOfBounds, Logo, Icon, FairwayDivider (inline SVG)
  layouts/Base.astro      <head>, SEO and OG tags, fonts, reveal script
  pages/index.astro       Composes the sections
  pages/privacy.astro     Privacy note (copy lives in the page)
  pages/404.astro         Not-found page, served by GitHub Pages for any missing URL
  styles/
    tokens.css            Every color, size, radius and duration
    global.css            Reset, base type, shared utilities
scripts/shots.mjs         Screenshot + framing check for each site
scripts/brand.mjs         Favicons, app icons, manifest, share image and brand/ files from lib/logo.ts
brand/                    Logo files for use outside the site (not deployed)
.github/workflows/
  ci.yml                  PR checks (also reused by deploy)
  deploy.yml              main: CI, then build and deploy to GitHub Pages
```

## Data flow for a client site

```
content/sites/<slug>.yaml ─┐
assets/shots/<slug>.jpg ───┼─> lib/sites.ts ─> sections/Work ─> ui/SiteCard
data/embeds.json[<slug>] ──┘
```

`getSites()` throws with a clear message if a screenshot or embed check is missing. That is intentional: a card is never shipped empty.

## Live preview vs screenshot

1. The screenshot always renders, as an optimized responsive WebP.
2. If `embeds.json` says the site allows framing from `SITE_URL`, a lazy, sandboxed 1280x800 iframe is layered on top and scaled to fit.
3. The badge reads "Screenshot" until the iframe fires `load`, then "Live preview". If the iframe hasn't loaded after 8s, it's removed and a warning is logged.

## Configuration

| Variable    | Default                         | Used by                          |
| ----------- | ------------------------------- | -------------------------------- |
| `SITE_URL`  | `https://dangokangoo.github.io` | canonical/OG URLs, framing check |
| `BASE_PATH` | `/william-odriscoll`            | every internal URL               |

To move to a custom domain, set both (`BASE_PATH=/`), add `public/CNAME`, then re-run `npm run shots` so the framing checks target the new origin.
