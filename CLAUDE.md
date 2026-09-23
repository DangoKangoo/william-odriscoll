# CLAUDE.md

Portfolio site for **W. O'Design**, William O'Driscoll's web studio for golf businesses. Astro, static, deployed to GitHub Pages at https://dangokangoo.github.io/william-odriscoll/.

## How to work here

- **Before any change:** run the `align` skill (`.claude/skills/align`). For a clear, specific request, skip the question rounds: build it, and state any small decisions in one line.
- **When a task is done:** run the `ship` skill (`.claude/skills/ship`). Ask before the PR, get an independent agent review, and ask before merging.
- **Decisions:** logged in `docs/DECISIONS.md`. Read it first. Never re-ask something decided there, and strike through anything superseded.
- **Structure and data flow:** `ARCHITECTURE.md`. Everyday tasks (adding a site, brand assets, search setup): `README.md` and `docs/search-setup.md`.
- **Copy:** never use em dashes, in copy, comments, docs, commits or replies.

## Facts that aren't obvious from the code

- **Names:** the business is **W. O'Design** (`site.name`) and William O'Driscoll is `site.founder`. The flag mark (`src/lib/logo.ts`) is the logo. The repo, URL and base path stay `william-odriscoll`.
- **Repo must stay public.** Pages and branch protection on `main` both depend on it. If a deploy 404s, check visibility first.
- **Live previews:** both client sites allow framing from `https://dangokangoo.github.io` via CSP `frame-ancestors`:
  - Dormston: `D:\Projects\MPGolf`, `app.js` `defaultEmbedOrigins`. It deploys to Render from `main`.
  - Twin Arrows: `D:\Projects\twin-arrows-golf`, `next.config.ts`. This is the client's org repo; PRs go to `staging`, then staging is merged into `main`.

  A new portfolio domain must be added to both before re-running `npm run shots`.

- **In progress:** a count, `work.inProgress` in `src/config/site.ts`, shown as one line under the client sites. Keep it true. Never name a client project before it launches.
- **Search Console:** the verification code goes in `site.googleSiteVerification` once William sends it. There's no robots.txt, because github.io only reads it at the domain root.
- **Lighthouse:** `npm run lighthouse` fails locally on Windows (chrome-launcher EPERM). It runs in CI.
- **Skills:** the global gitignore excludes `.claude/`, so skill files need `git add -f .claude/skills/<name>/SKILL.md`. Never add the whole folder.
