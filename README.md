# william-odriscoll

Portfolio site for William O'Driscoll, websites for golf businesses. Built with Astro and deployed to GitHub Pages.

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

### Live previews

A card shows a live iframe only when the client site allows framing from this site's origin. To allow it, add `https://dangokangoo.github.io` to that site's `Content-Security-Policy: frame-ancestors`, then re-run `npm run shots`.

## Workflow

- `main` is protected. Work on a branch and open a PR.
- CI on every PR: Prettier, `astro check`, build, link check (lychee), Lighthouse (performance and accessibility at least 0.9).
- A merge to `main` runs CI again, then deploys to GitHub Pages.

More: [ARCHITECTURE.md](ARCHITECTURE.md), [docs/DECISIONS.md](docs/DECISIONS.md). Scoping for new work goes through the `align` skill in `.claude/skills/align`.
