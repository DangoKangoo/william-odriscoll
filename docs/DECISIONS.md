# Decisions

Confirmed through the `align` skill. Superseded decisions are struck through, never deleted.

## 2026-09-22: Initial build

- Fresh start. Nothing carries over from any earlier version of this site.
- Purpose: a golf web studio sales page. William is introduced as a St. John's software engineer; the client sites do the selling.
- Stack: Astro, fully static.
- Hosting: GitHub Pages, deployed by GitHub Actions on every merge to `main`.
- Repo: public `DangoKangoo/william-odriscoll`, served at `dangokangoo.github.io/william-odriscoll`. Custom domain later.
- One page, four sections: Hero, Work, Services, Contact.
- Visual direction: light, off-white background, deep golf-green accent, Manrope (display) + Inter (body).
- Hero art: generated topographic contour map of a green, with a flag and ~~a ball flight that draws itself once~~ looping shots (see "Hero shot loop").
- ~~Motion: subtle. Scroll fade-ups, card hover lift, one-time ball-flight draw. Everything is off under `prefers-reduced-motion`.~~ Superseded 2026-09-22, see "Hero shot loop".
- Extras: service icons, dimple texture on Contact, one fairway divider under the hero.
  **Why:** the stats strip was skipped until there are enough sites (5+) for the numbers to impress.
- Showcase: a live iframe in a browser frame when the site allows framing from this origin, otherwise a screenshot. A badge always says which is showing.
  **Why:** cross-origin iframes cannot reliably report a CSP block, so `npm run shots` checks the headers ahead of time and saves the result to `src/data/embeds.json`.
- Screenshots: `npm run shots` (Playwright), committed to `src/assets/shots/`. The build fails if a site is missing one.
- Site entry fields: name, url, description, location, tags, launched (YYYY-MM), featured, order.
- `featured: true` gets a full preview card; `featured: false` is listed under "More work" as a compact link.
- Contact: visible email `willod17@outlook.com` plus a mailto button. No form.
- Analytics: none.
- CI on every PR: Prettier, `astro check`, build, lychee link check, Lighthouse (performance and accessibility at least 0.9).
- Branches: feature branches with PRs into a protected `main` that requires CI to pass.
- Copy is drafted by Claude and reviewed by William before it ships.
- Out of scope: analytics, contact form, custom domain, case studies, personal bio or CV.

## 2026-09-22: Hero shot loop

- Motion: subtle. Scroll fade-ups, card hover lift, and a looping hero shot. Everything is off under `prefers-reduced-motion`.
- Hero shots loop one at a time, and each shot is new and random: it starts somewhere along the left side of the art, flies a random arc height, and lands on the green around the pin.
- Each shot: the trail draws as the ball flies (about 1.6s), the ball rolls a short way toward the pin, holds, then the ball and trail fade together before the next shot. About 4s per shot.
- ~~Every shot lands on the green. No misses, no hole-in-one.~~ Superseded 2026-09-22, see "Hole in one".
- The loop pauses when the hero is off screen or the tab is hidden.
  **Why:** it saves battery and CPU for an effect nobody is looking at.
- Reduced motion or no JavaScript: one still, finished shot.

## 2026-09-22: Logo, footer and privacy

- The flag mark next to the name is the logo. One `Logo` component; the mark's geometry lives in `src/lib/logo.ts`.
- The favicon is the exact same mark on the green rounded tile.
- `npm run brand` regenerates the favicon, the share image and the `brand/` files from that one source, so they can't drift apart.
- Brand files in `brand/` (repo only, not published): mark only, green and white, SVG + PNG at 512 and 1024px.
- Share image: a branded 1200x630 card (contours, flag, name, tagline, location) replaces the hero screenshot.
- ~~Footer: logo, name and tagline; nav (Work, Services, Contact, Privacy); LinkedIn; then the © line and location.~~ Superseded 2026-09-22, see "Footer tweaks".
- LinkedIn (`linkedin.com/in/will-odriscoll`) is the only personal link on the site. No GitHub.
- `/privacy`: a short plain-language note. No cookies, no tracking, emails used only to reply, never sold or shared, deleted on request, hosted on GitHub Pages.
- ~~The visible email under "Email me" stays.~~ Superseded 2026-09-22, see "Rename to W. O'Design".
  **Why:** mailto doesn't work for webmail users who have no mail app set up.

## 2026-09-22: Footer tweaks

- Footer: flag and name (no tagline); nav (Work, Services, Contact, Privacy); LinkedIn as an icon only; then the © line and location.
- The footer flag uses the same size and spacing as the header flag, so it lines up with the name.

## 2026-09-22: 404 page and app icons

- The 404 page has a light golf tone: "Out of bounds." with "This page doesn't exist. Let's get you back on the fairway." and one "Back to the fairway" button to the homepage.
- 404 art: a still contour map with the ball resting in the rough next to a white out-of-bounds stake. No animation.
- The 404 page has the normal header and footer, is marked `noindex`, and is kept out of the sitemap.
- App icons: the white flag on the green tile. Apple touch icon (180px), a 32px PNG favicon fallback, and a web manifest (short name "W. O'Driscoll") with 192px and 512px icons.
- Every icon is generated by `npm run brand` from `lib/logo.ts`.

## 2026-09-22: Search setup

- The "How it works" section is dropped. William decided it wasn't needed.
- The homepage carries JSON-LD ~~`ProfessionalService`~~ `LocalBusiness` structured data (schema.org deprecates the generic `ProfessionalService`): based in St. John's, NL and serving Canada, with email, logo and share image, and founder William O'Driscoll (Software Engineer) with LinkedIn as `sameAs`.
- Homepage title: "Golf Website Design, St. John's NL | William O'Driscoll".
  **Why:** people search for the service, not the name.
- Search Console verification goes through the HTML tag method. The code lives in `site.googleSiteVerification`, and no tag renders while it's empty.
- No robots.txt: crawlers only read it at the domain root, which this repo doesn't control on github.io. The sitemap is submitted in Search Console instead.
- `docs/search-setup.md` is the guide for Search Console and Google Business Profile (service-area business).

## 2026-09-22: Hole in one

- Every shot still lands on the green, and about 10% are aces: the ball lands a little short, rolls into the cup and drops out of sight. There are never two aces in a row.
  **Why "about":** because of the no-repeat rule, the per-shot chance is 1/9, which works out to an average of 10%.
- The ace celebration (about 1.3s): two soft green rings ripple out from the cup, the flag gives one wave, and a small confetti burst (14 pieces in brand colors) falls and fades.
- Normal shots are unchanged and still stop at least 22 units from the pin.
- Reduced motion and no JavaScript: the same still shot, with no aces.

## 2026-09-22: Work status and statement

- The work grid shows live client sites, then one anonymous "In progress" card per real project in progress, then a "Your course could be next" card that links to Contact.
- ~~A status line under the Work heading reads "Currently building N site(s) · in talks with M more".~~ Superseded 2026-09-22, see "In-progress entries".
- ~~The in-progress count and the in-talks count (`work.inProgress` and `work.inTalks` in `config/site.ts`) drive both the cards and the line. They must stay true.~~ Superseded 2026-09-22, see "In-progress entries".
  **Why:** they show real momentum; placeholder cards for projects that don't exist would mislead prospects.
- In-progress projects are never named until they launch.
- A statement sits between Services and Contact: "This site is simple on purpose. The detail goes into yours." It's large, centered, with the flag mark above.

## 2026-09-22: Waving flag

- ~~The hero flag is about 1.5x bigger: a rectangular golf pennant in flag red with "WO’D" in bold white (Manrope, typographic apostrophe).~~ Superseded 2026-09-22, see "Rename to W. O'Design".
- It ripples gently and never stops: the cloth sways from the pole, and a soft light band rolls across it like folds, about 2.5s per cycle. The text moves with the cloth (now the logo mark, see "Rename to W. O'Design").
  **Why:** William asked for it. This adds a looping flag to the "subtle motion" set, which originally left one out.
- The wind pauses with the shot loop (off screen, hidden tab) and is off under reduced motion. The hole-in-one wave plays on top.
- Only the hero flag changes; the logo, 404 art and share card keep theirs.

## 2026-09-22: In-progress entries

- Each in-progress card is one JSON file in `src/content/in-progress/` (title, body, order), validated at build time. Copy a file to add a card; delete it when the project launches.
- Two in-progress cards, both "New client site". William's call.
- The status line is removed, along with `work.inProgress` and `work.inTalks`.
- ~~When the cards before it fill whole rows, the "next" card spans the row as a shorter banner.~~ Superseded 2026-09-22, see "Rename to W. O'Design".

## 2026-09-22: Rename to W. O'Design

- The business name is **W. O'Design** (`site.name`). It's used in the header, footer, page titles, share card, manifest and structured data.
- William O'Driscoll (`site.founder`) appears in the footer ("© 2026 W. O'Design · William O'Driscoll"), in the site description, and as the founder in the structured data.
- The flag mark stays the logo.
- The hero flag is green (`--color-accent`), with the white flag logo in place of "WO’D". The size and wind are unchanged.
- The contact section shows only the "Email me" button. The address stays on the privacy page and in the structured data.
  **Why:** William's call for a cleaner section. Accepted tradeoff: visitors on webmail with no mail app set up won't see the address on the homepage.
- The "next" card is the same size as the other cards and sits in the grid like them (left column today). Rows are equal height on desktop.
- A mirrored fairway divider sits between Work and Services.
- The repo, the URL and the GitHub Pages path stay `william-odriscoll`.

## 2026-09-23: Align fast path

- For clear, specific requests, `align` skips question rounds: build it and state any small decisions in one line. Ask one focused question only for a real ambiguity, a conflict with a locked decision, or an honesty concern. `ship` still applies.
  **Why:** William rejected a question round on a specific request ("I literally just want you to add the exact card"). The full process stays for broad or open-ended work.

## 2026-09-23: Services copy

- ~~Services keeps its 4 cards, icons, heading and layout. Each card has a one-line intro plus 3 deliverable bullets (`points` in `config/site.ts`).~~ Superseded 2026-09-23, see "Services revert".
- ~~Plain golf operations language (tee times, season hours, pro shop), no puns.~~ Superseded 2026-09-23, see "Services revert".
- No client names or links in Services.
  **Why:** William's call. That would repeat the Work section.
- ~~The copy never claims clients edit their own site. Changes go through William.~~ Superseded 2026-09-23, see "Services revert".

## 2026-09-23: Services wording

- No brand names in Services copy (no Acuity, Square or Google Business Profile). Describe the ability, e.g. "third-party booking and payment services".
  **Why:** William's call. Brand names read as name-dropping.
- ~~Design and build bullets list concrete abilities: mobile-first and fast, pages for rates, hours, lessons and events, and accessible and easy to read.~~ Superseded 2026-09-23, see "Services revert".

## 2026-09-23: Services revert

- Services is back to the original layout and copy (before 2026-09-23): 4 cards, an icon and one paragraph each, no bullets.
  **Why:** William preferred the original.
- The only change from the original: brand names are replaced with plain wording ("booking and payment services", "business listing guidance"), following "Services wording".
- The original "easy to update" line stays as is.
- Booking card wording: "Third-party integrations let customers pay and book online." William's call, replacing "most booking and payment services".
