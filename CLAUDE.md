# CLAUDE.md

Portfolio site for **W. O'Design**, William O'Driscoll's web studio for golf businesses. Astro, static, deployed to GitHub Pages at https://dangokangoo.github.io/william-odriscoll/.

## Commands

- `bash scripts/check.sh`: Prettier check, `astro check` (types and content schema), build, and a scan for em dashes. This is the definition of done, and CI's "Format, types and build" job runs the same script. 10 to 40s.
- There are no unit tests and no single-test command. The build is the test: the content schema and `getSites()` fail on bad data or a missing screenshot.
- Link check (lychee) and Lighthouse run in CI only.

## How to work here

- **Clear, specific request:** the `align` fast path. Build it, state small decisions in one line, no spec.
- **Non-trivial work:** `/align` interviews William and writes `specs/<slug>.md` (format: `specs/TEMPLATE.md`). Then `/run-spec <slug>` builds it task by task. Nothing is built before William confirms the spec.
- **In `run-spec`, the main session only orchestrates.** Each task and each review runs in a fresh subagent. Handoff notes go in `specs/<slug>.progress.md`. A box is ticked only after `check.sh` passes.
- **PRs only through `/ship`** (it is this repo's `/pr`), and only after William approves. It refuses to continue on a failing `check.sh`, links the spec, and asks again before merging.
- **Review:** the `reviewer` agent (`.claude/agents/reviewer.md`) is read-only and grades only the spec's acceptance and quality criteria, with evidence.
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
- **`.claude/` is gitignored globally.** Shared files need `git add -f <file>`: `skills/<name>/SKILL.md`, `agents/<name>.md`, `hooks/<name>.mjs`, `settings.json`. Never add the whole folder; `settings.local.json` stays local.

## Hooks

- With uncommitted changes, Claude can't finish until `check.sh` passes.
- `enforce_admins` is off on `main`, so branch protection won't stop an admin push. The push guard hook is what does.
- How each hook works: `.claude/settings.json` and the header comment in each `.claude/hooks/*.mjs`.
