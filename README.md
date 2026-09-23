# william-odriscoll

Portfolio site for W. O'Design (William O'Driscoll), websites for golf businesses. Built with Astro and deployed to GitHub Pages.

Live: https://dangokangoo.github.io/william-odriscoll/

## Develop

```sh
npm ci
npx playwright install chromium   # once, for npm run shots
npm run dev                        # http://localhost:4321/william-odriscoll/
```

| Script               | What it does                                            |
| -------------------- | ------------------------------------------------------- |
| `npm run dev`        | Local dev server                                        |
| `npm run build`      | Static build to `dist/`                                 |
| `npm run check`      | Type and content-schema check                           |
| `npm run format`     | Prettier, write                                         |
| `npm run shots`      | Screenshot + framing check for every site (or one slug) |
| `npm run lighthouse` | Lighthouse budget against `dist/` (runs in CI)          |
| `npm run brand`      | Regenerate favicon, share image and `brand/` logo files |

## Add a client site

1. Create `src/content/sites/<slug>.yaml`:

   ```yaml
   name: Example Golf Club
   url: https://example.com
   description: One or two sentences, 20 to 220 characters.
   location: St. John's, NL
   tags: [Booking, Local SEO] # 1 to 5
   launched: 2026-10 # YYYY-MM
   featured: true # true = full preview card, false = "More work" list
   order: 3 # lower shows first
   ```

2. Run `npm run shots -- <slug>` to capture the screenshot and check framing.
3. Commit the YAML, `src/assets/shots/<slug>.jpg` and `src/data/embeds.json` on a branch and open a PR.

The build fails with a clear message if a field is wrong or the screenshot is missing.

### Work in progress

Under the client sites, one line counts the projects in progress ("2 more sites are in progress..."). The count is `work.inProgress` in `src/config/site.ts`. Keep it true: raise it when a project starts, lower it when one launches (and add the live site's YAML entry). `0` hides the line. Projects in progress are never named.

### Live previews

A site shows a live iframe only when the client site allows framing from this site's origin. To allow it, add `https://dangokangoo.github.io` to that site's `Content-Security-Policy: frame-ancestors`, then re-run `npm run shots`.

## Workflow

- `main` is protected. Work on a branch and open a PR.
- CI on every PR: Prettier, `astro check`, build, link check (lychee), Lighthouse (performance and accessibility at least 0.9).
- A merge to `main` runs CI again, then deploys to GitHub Pages.

More: [ARCHITECTURE.md](ARCHITECTURE.md), [docs/DECISIONS.md](docs/DECISIONS.md), [docs/search-setup.md](docs/search-setup.md) (Search Console and Google Business Profile). New work is scoped with the `align` skill and shipped with the `ship` skill (PR, review, merge), both in `.claude/skills/`.

## Brand

The flag mark is defined once in `src/lib/logo.ts`. After changing it, run `npm run brand` and commit the results: the favicons, home-screen icons and `manifest.webmanifest` in `public/`, `public/og.png`, and the logo files in `brand/` (green and white, SVG + PNG at 512 and 1024px).
