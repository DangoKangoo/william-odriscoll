---
name: ship
description: Finish a task by opening a pull request and reviewing it. Use whenever a task, feature or fix on this project is done (code written and verified locally), or when William says "/ship", "open a PR", "ship it" or "let's PR". Always asks William if he's ready to PR first, then opens the PR, runs an independent review, reports the findings, and never merges without his go-ahead.
---

# Ship: PR and review when a task is done

Run this at the end of every task. The companion to `align`: `align` agrees the
scope before building, and `ship` checks the result before it merges.

## Step 1: Ask if we're ready to PR

Never open a PR without asking. Use `AskUserQuestion` with a two-line summary
of what changed:

- "Yes, open the PR" (Recommended when checks pass)
- "Not yet": ask what's left, finish it, then come back to this step
- "Change something first": make the change, then come back to this step

If local checks (Step 2) are already failing, say so in the question and
recommend "Not yet".

## Step 2: Verify locally

Run all of these and stop on the first failure. Report it, don't work around it.

```sh
npm run format:check
npm run check
npm run build
```

If content in `src/content/sites/` changed, also confirm the matching
screenshot and `src/data/embeds.json` entry exist (`npm run shots -- <slug>`).

## Step 3: Branch and commit

- Never commit to `main` (it's protected). If on `main`, create a branch named
  `<type>/<short-topic>`, where type is `feat`, `fix`, `ci`, `docs`, `chore` or `style`.
- Group related changes into logical commits. The message says why, not just what.
- Check `git status` for stray files (screenshots from previews, `.lighthouseci`,
  scratch scripts) before committing. Never commit secrets or `.env` files.
- The global gitignore excludes `.claude/`, so skills need `git add -f`.

## Step 4: Open the PR

Push the branch and create the PR with `gh pr create --base main`. Body:

```
## Changed
- <bullets>

## Why
- <bullets, link the DECISIONS.md entry if align was used>

## How to verify
- <steps William can follow>

## Risks / follow-ups
- <or "none">
```

Title follows the commit convention (`feat: ...`). No em dashes anywhere.

## Step 5: Review the PR

Default: spawn an independent reviewer with the `Agent` tool
(`subagent_type: general-purpose`) so the review isn't done by the same context
that wrote the code. Give it:

- The PR number and `gh pr diff <n>` output (or tell it to run that)
- The task goal and the relevant `docs/DECISIONS.md` entries
- This checklist:
  - Correctness bugs, broken edge cases, error states
  - Fail loud: no swallowed errors, no placeholder data shown as real
  - Follows existing patterns (tokens in `tokens.css`, copy in `config/site.ts`,
    one YAML per site, components in the right folder)
  - Accessibility: alt text, focus states, contrast, reduced motion
  - Performance: image sizes, new JS, new dependencies (flag every one)
  - Scope creep: anything changed that wasn't asked for
  - No em dashes in copy, comments, docs or commit messages
- Ask it to return findings ranked by severity, each with a file:line and a
  concrete failure scenario, and to say "no findings" rather than invent any.

If the Agent tool isn't available, review it yourself against the same checklist
(the `code-review` skill works well for this), and say it was a self-review.

Then verify each finding yourself before reporting it. Drop anything that doesn't hold up.

## Step 6: Report, fix, wait for CI

1. Post the verified findings as one PR comment (`gh pr comment <n>`), with the
   reviewer type (agent or self) noted.
2. Show William the findings, most severe first, and ask with `AskUserQuestion`
   which to fix: all / pick some / none.
3. Push fixes to the same branch as new commits.
4. Wait for CI (`gh pr checks <n> --watch`). If a check fails, show the failing
   log lines and fix it. Never mark a failure as passing.

## Step 7: Ask before merging

When CI is green and findings are resolved, ask: "Merge and deploy?"

- "Yes, squash and merge": `gh pr merge <n> --squash --delete-branch`, then
  watch the Deploy run and confirm the live URL returns 200.
- "Leave it open": stop and give William the PR link.

## Rules

- Ask before the PR, and ask before the merge. Both steps need explicit confirmation.
- Never force push, bypass branch protection or use admin merge.
- Report outcomes as they are. If something failed or was skipped, say so.
