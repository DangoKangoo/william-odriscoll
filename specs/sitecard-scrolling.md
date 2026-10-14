# Clear the `scrolling` deprecation in SiteCard

Branch: `fix/sitecard-scrolling` from `main` (rebuilt on `main` after the harness PR #21 merged; it was first stacked on `chore/agentic-harness`)
Decisions: [docs/DECISIONS.md](../docs/DECISIONS.md), "2026-10-12: SiteCard scrolling attribute"
Progress: [sitecard-scrolling.progress.md](sitecard-scrolling.progress.md) (written by `run-spec`)

## Goal

`astro check` stops reporting `'scrolling' is deprecated` (ts 6385) at
`src/components/ui/SiteCard.astro:42`, and the live previews look exactly as
they do now. This is also the first end-to-end run of the harness, so the scope
stays as small as possible.

## Non-goals

- Any other change to `SiteCard.astro` (styles, script, markup) or `BrowserFrame.astro`.
- Any other `astro check` hint or warning.
- How previews load, scale or time out.

## Assumptions

- The iframes keep rendering `scrolling="no"`. It's obsolete in the HTML spec,
  but every major browser still honors it, and nothing standard replaces it for
  hiding a cross-origin page's scrollbar. The 2026-09-23 decision relies on it
  ("so the client site's scrollbar doesn't show"). So the fix changes how the
  attribute is written, not what the browser receives.
- The attribute is passed by spreading an object typed as plain attributes
  (such as `Record<string, string>`) in the same position on the `<iframe>`,
  so the type checker doesn't match it to Astro's `@deprecated` `scrolling`
  prop. A one-line comment says why.

## Acceptance criteria

1. `npx astro check` output no longer mentions `scrolling` or `6385` for
   `src/components/ui/SiteCard.astro`.
2. Both iframes in the built `dist/index.html` match these tags exactly,
   attribute order included, apart from the `data-astro-cid-*` value and one
   added `class="astro-<hash>"`, which Astro's compiler adds to any spread
   element. No CSS or JS in `dist/` may target that class. (Amended
   2026-10-12, William's call, after T1 showed the class is unavoidable.)
   - `<iframe src="https://www.dormstongolf.com" title="Live preview of Dormston Indoor Golf" loading="lazy" sandbox="allow-scripts allow-same-origin" referrerpolicy="no-referrer" scrolling="no" tabindex="-1" aria-hidden="true" data-astro-cid-ewtuyg46>`
   - `<iframe src="https://twinarrowsgolf.com" title="Live preview of Twin Arrows Golf" loading="lazy" sandbox="allow-scripts allow-same-origin" referrerpolicy="no-referrer" scrolling="no" tabindex="-1" aria-hidden="true" data-astro-cid-ewtuyg46>`
3. Apart from `specs/` and `docs/DECISIONS.md`, the only file changed is
   `src/components/ui/SiteCard.astro`, and only at the iframe and its
   frontmatter.
4. No new dependency.
5. `bash scripts/check.sh` passes.

## Tasks

- [x] **T1: Pass `scrolling` without the deprecated prop**
  - Do: in `src/components/ui/SiteCard.astro`, define the attribute object in
    the frontmatter and spread it on the `<iframe>` where `scrolling="no"` is
    now, with a one-line comment on why.
  - Done when: acceptance criteria 1 to 5 hold.
