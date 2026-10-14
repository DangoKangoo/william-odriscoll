# Progress: sitecard-scrolling

Handoff notes from each task, newest last. Read before starting a task.

## T1: Pass `scrolling` without the deprecated prop

- Did: `src/components/ui/SiteCard.astro`: added `hideScrollbar: Record<string, string> = { scrolling: "no" }` with a one-line comment in the frontmatter, and replaced `scrolling="no"` on the iframe with `{...hideScrollbar}`.
- Decisions: named it `hideScrollbar` because it says what the attribute does, not what it works around.
- Dead ends: none tried beyond the spec's approach. Not viable without touching other files: augmenting `astroHTML.JSX.IframeHTMLAttributes` (TS still marks an interface member deprecated if any declaration is), `@ts-ignore` (doesn't silence deprecation hints), `Scrolling="no"` (renders with that casing, breaks criterion 2).
- Surprises: BLOCKER for criterion 2. Astro 7's compiler (`@astrojs/compiler-rs` 0.4.1) compiles any spread on a scoped element to `$$spreadAttributes(obj, undefined, { class: "astro-<hash>" })`, so the built iframes now carry an extra `class="astro-ewtuyg46"` right after `scrolling="no"`. The class is inert: no CSS in `dist/` targets `.astro-ewtuyg46`, styles use `[data-astro-cid-ewtuyg46]`. `spreadAttributes` also mutates the spread object (writes `class` onto it); harmless here since the frontmatter runs per card.
- Next task should know: criterion 1, 3, 4, 5 hold; criterion 2 fails only on that extra class. Needs a call from William: amend criterion 2 to allow the inert class, or keep exact output with a non-enumerable no-op `class` setter on the object (works against the runtime internals, fragile), or drop the change and live with the hint.

## Orchestrator

- William chose to allow the extra class; criterion 2 in the spec is amended. No code change needed.
- The T1 entry above was appended after the subagent's last check.sh run and skipped the format hook, so check.sh failed on this file. Reformatted with Prettier; content unchanged.
