---
name: ship
description: Finish a task by opening a pull request and reviewing it. Use whenever a task, feature or fix on this project is done (code written and verified locally), or when William says "/ship", "open a PR", "ship it" or "let's PR". Always asks William if he's ready to PR first, then opens the PR, runs an independent review, reports the findings, and never merges without his go-ahead.
---

# Ship: PR and review when a task is done

Run this at the end of every task. The companion to `align`: `align` agrees the
scope before building, and `ship` checks the result before it merges.

Live site: https://dangokangoo.github.io/william-odriscoll/

## Step 1: Verify locally

Run all of these first, so the question in Step 2 is based on real results.

```sh
npm run format:check
npm run check
npm run build
```

If content in `src/content/sites/` changed, also confirm the matching
screenshot and `src/data/embeds.json` entry exist (`npm run shots -- <slug>`).

Don't work around a failure. Note it for Step 2.

## Step 2: Ask if we're ready to PR

Never open a PR without asking. Use `AskUserQuestion` with a two-line summary
of what changed and the Step 1 results:

- "Yes, open the PR" (Recommended only when every check passed)
- "Not yet": ask what's left, finish it, then go back to Step 1
- "Change something first": make the change, then go back to Step 1

If a check failed, show the failing lines in the question and recommend
"Not yet" or "Change something first".

## Step 3: Branch and commit

- Run `git status`. If nothing has changed, say so and stop. There's nothing to ship.
- Never commit to `main` (it's protected). If on `main`, create a branch named
  `<type>/<short-topic>`, where type is `feat`, `fix`, `ci`, `docs`, `chore` or `style`.
- Group related changes into logical commits. The message says why, not just what.
- Check for stray files (preview screenshots, `.lighthouseci`, scratch scripts)
  before committing. Never commit secrets or `.env` files.
- The global gitignore excludes `.claude/`. Force-add only the specific skill
  file (`git add -f .claude/skills/<name>/SKILL.md`), never the whole folder,
  because `.claude/settings.local.json` must stay uncommitted.

## Step 4: Open the PR

1. Push: `git push -u origin <branch>` the first time, `git push` after that.
2. Check for an existing PR: `gh pr view --json number,url`. If one exists,
   the push already updated it. Update its body with `gh pr edit` if the
   summary changed, and skip to Step 5.
3. Otherwise create it with `gh pr create --base main`. Body:

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
that wrote the code. Tell it to review only (no edits, commits, comments or
merges) and give it:

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

Verify each finding yourself before reporting it. Drop anything that doesn't
hold up, and say how many you dropped.

## Step 6: Report, fix, wait for CI

1. Post the verified findings as one PR comment (`gh pr comment <n>`), noting
   whether the reviewer was an agent or a self-review.
2. Show William the findings, most severe first, and ask with `AskUserQuestion`
   which to fix: all / pick some / none.
3. Push fixes to the same branch as new commits. If the fixes are more than
   trivial, run Step 5 again on the new commits.
4. Wait for CI. Checks can take a few seconds to register after a push, so if
   `gh pr checks <n>` reports no checks yet, wait briefly and retry. Then run
   `gh pr checks <n> --watch`.
5. If a check fails, show William the failing log lines
   (`gh run view <run-id> --log-failed`) and ask before fixing anything that
   isn't an obvious slip in this PR. Never mark a failure as passing.

## Step 7: Ask before merging

When CI is green and findings are resolved, ask: "Merge and deploy?"

- "Yes, squash and merge":
  1. `gh pr merge <n> --squash --delete-branch`
  2. `git checkout main && git pull`
  3. Find the deploy: `gh run list --workflow deploy.yml --branch main -L 1`
  4. `gh run watch <run-id> --exit-status`
  5. Confirm the live site returns 200:
     `curl -s -o /dev/null -w "%{http_code}" https://dangokangoo.github.io/william-odriscoll/`
  6. If the deploy fails, show the failing log lines. If Pages returns 404,
     check the repo is still public first.
- "Leave it open": stop and give William the PR link.

## Rules

- Ask before the PR, and ask before the merge. Both steps need explicit confirmation.
- Never force push, bypass branch protection or use admin merge.
- Report outcomes as they are. If something failed or was skipped, say so.
