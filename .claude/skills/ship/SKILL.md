---
name: ship
description: Finish a task by opening a pull request and reviewing it. This is the project's PR skill (/pr means /ship). Use whenever a task, feature or fix on this project is done (code written and verified locally), or when William says "/ship", "/pr", "open a PR", "ship it" or "let's PR". Refuses to continue unless scripts/check.sh passes, summarizes the diff against the spec's acceptance criteria, asks William before opening the PR, links the spec, runs the reviewer agent, and never merges without his go-ahead.
---

# Ship: PR and review when a task is done

Run this at the end of every task. The companion to `align` and `run-spec`:
`align` agrees the scope and writes the spec, `run-spec` builds it, and `ship`
checks the result before it merges.

Live site: https://dangokangoo.github.io/william-odriscoll/

## Step 1: Verify locally

```sh
bash scripts/check.sh
```

If it fails, stop here. Show William the failing lines and don't go on to
Step 2 until a fresh run passes. Don't work around a failure.

If content in `src/content/sites/` changed, also confirm the matching
screenshot and `src/data/embeds.json` entry exist (`npm run shots -- <slug>`).

Find the spec: the `specs/<slug>.md` that's new or changed on this branch. Fast
path work has no spec; say so and skip the spec parts below.

## Step 2: Ask if we're ready to PR

Never open a PR without asking. Use `AskUserQuestion`, and put this summary in
the question:

- What changed, in two lines.
- With a spec: each acceptance and quality criterion, marked met / partial /
  missing, with the file or command that shows it. If `run-spec` already
  reported the reviewer's verdict on this same diff, use that.
- Any change in the diff the spec didn't ask for.

Options:

- "Yes, open the PR" (Recommended only when every criterion is met)
- "Not yet": ask what's left, finish it, then go back to Step 1
- "Change something first": make the change, then go back to Step 1

## Step 3: Branch and commit

- Run `git status`. If nothing has changed, say so and stop. There's nothing to ship.
- Never commit to `main` (it's protected). If on `main`, create a branch named
  `<type>/<short-topic>`, where type is `feat`, `fix`, `ci`, `docs`, `chore` or `style`.
- Group related changes into logical commits. The message says why, not just what.
- Commit the spec and its `.progress.md` with the work they describe.
- Check for stray files (preview screenshots, `.lighthouseci`, scratch scripts)
  before committing. Never commit secrets or `.env` files.
- The global gitignore excludes `.claude/`. Force-add only the specific shared
  files (`git add -f .claude/skills/<name>/SKILL.md`, `.claude/agents/<name>.md`,
  `.claude/hooks/<name>.mjs`, `.claude/settings.json`), never the whole folder,
  because `.claude/settings.local.json` must stay uncommitted.

## Step 4: Open the PR

1. Push: `git push -u origin <branch>` the first time, `git push` after that.
2. Check for an existing PR: `gh pr view --json number,url`. If one exists,
   the push already updated it. Update its body with `gh pr edit` if the
   summary changed, and skip to Step 5.
3. Otherwise create it with `gh pr create --base main`. Body (the spec link
   points at `main`: a branch link 404s once `--delete-branch` runs, and the
   `main` one works from the merge on):

```
## Spec
[specs/<slug>.md](https://github.com/DangoKangoo/william-odriscoll/blob/main/specs/<slug>.md)
(or "none, fast path")

## Changed
- <bullets>

## Acceptance criteria
- [x] <criterion>: <evidence>
- [ ] <criterion>: <what's partial or missing>

## Why
- <bullets, link the DECISIONS.md entry if align was used>

## How to verify
- <steps William can follow>

## Risks / follow-ups
- <or "none">
```

Title follows the commit convention (`feat: ...`). No em dashes anywhere.

## Step 5: Review the PR

If `run-spec` already got an approve from the reviewer on this exact diff and
nothing has changed since, say so and skip to Step 6.

Otherwise spawn the reviewer agent (`Agent`, `subagent_type: reviewer`,
defined in `.claude/agents/reviewer.md`), so the review isn't done by the
context that wrote the code. Give it the PR number and the spec path (or, on
the fast path, the task goal and the relevant `docs/DECISIONS.md` entries). It
returns a verdict, each criterion graded with evidence, and required changes
with file:line references.

If the Agent tool isn't available, review it yourself against the same
instructions in `.claude/agents/reviewer.md`, and say it was a self-review.

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
