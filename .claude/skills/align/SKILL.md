---
name: align
description: Requirements alignment gate for William's portfolio site. Use BEFORE starting any new feature, page, section, design change, content change, dependency, infra/CI change, or any request that is broad or ambiguous. Asks the questions that change the outcome, writes the agreed spec to specs/<slug>.md for run-spec, gets explicit confirmation, and logs the decisions. Trigger on "/align", "let's add", "let's build", "change the", "new section", "redesign", or any non-trivial request on this project.
---

# Align: get 100% on the same page before building

William wants to be a participant in scoping, never handed guesses. No code, no
installs and no file edits until this process ends with an explicit "yes". The
exceptions are the throwaway probe in Step 4, which is undone before the spec is
written, and the spec draft in Step 5, because it's the thing being agreed.

## Fast path: clear, specific requests

If William's request already says exactly what to change ("add another of that
card", "remove that line", "make the flag green"), don't run question rounds.
Read DECISIONS.md, build it, and state any small decisions you made in one
line. No spec. Still log it in Step 6 and still use `ship` for the PR.

Ask only when a detail is truly ambiguous and the wrong guess matters (like the
exact spelling of a business name), or when the change conflicts with a locked
decision or with honesty (e.g. claiming work that doesn't exist). Then ask one
focused question, not a round.

Use the full process below for broad or open-ended work ("make it more
polished", new sections, new features).

## Step 1: Load what is already decided

1. Read `docs/DECISIONS.md` (create it in Step 6 if missing).
2. Read `README.md` and any file the request touches.
3. Never re-ask something already locked in `DECISIONS.md`. If the new request
   conflicts with a locked decision, call out the conflict and ask which wins.

## Step 2: Build the question list

For the request, walk every category below. For each, either (a) it is already
answered by DECISIONS.md or the request itself, or (b) it becomes a question.
Skip categories that genuinely do not apply, but say which ones you skipped.

| Category             | What to pin down                                                                  |
| -------------------- | --------------------------------------------------------------------------------- |
| Goal                 | Why this exists, who it is for, what "done" looks like                            |
| Audience             | Who visits, from where (client footer, LinkedIn, Google), what they should do     |
| Scope                | Exactly what is in, what is explicitly out, what is deferred                      |
| Content              | Real copy, names, links, images. Who supplies it. No placeholder text shipped     |
| Design               | Layout, theme (light/dark), colors, fonts, motion, reference sites liked/disliked |
| Behaviour            | Interactions, states (loading, empty, error), mobile vs desktop                   |
| Data / plug-and-play | Where data lives, how William adds an entry, required vs optional fields          |
| Tech                 | Framework, libraries, new dependencies (always flag), hosting                     |
| Infra / CI/CD        | Repo visibility, branches, checks, deploy target, domain, secrets                 |
| SEO / analytics      | Title, description, OG image, analytics tool, tracking params                     |
| Accessibility / perf | Contrast, keyboard, reduced motion, image budgets                                 |
| Failure modes        | What the user sees when something breaks (fail loud, never fake)                  |
| Acceptance           | How William will verify it is right                                               |

## Step 3: Ask, in rounds

Ask only where a wrong guess changes what gets built. Everything else is an
assumption: pick the sensible default (usually the existing pattern) and list
it under Assumptions in the spec, where William can correct it. Never ask about
naming, ordering or anything an existing pattern already answers.

- Use `AskUserQuestion`, max 4 questions per round, 2 to 4 concrete options each.
- Put the recommended option first, labelled "(Recommended)", with a one-line why.
- Use `preview` for visual choices (layout mockups, color palettes, code shapes).
- Ask the highest-impact questions first; later answers often depend on earlier ones.
- Keep going round after round until no outcome-changing questions remain. Do
  not stop early because it feels like "enough".
- Free-text answers ("Other") that raise new unknowns get follow-up questions.

## Step 4: Test risky assumptions

If the approach rests on an assumption that could be false and would change
the acceptance criteria ("this renders identically", "the library supports X",
"the build output doesn't change"), test it before writing any criteria:

1. Make the smallest version of the change, only in files with no other
   uncommitted changes, so undoing it can't lose other work.
2. Build or run it (`bash scripts/check.sh`, `npm run build`) and check the real
   output against the assumption: grep `dist/`, read the error, compare it with
   the output before the change.
3. Undo the probe: `git restore` the files you touched, and delete any new files
   it created. The build starts from the spec, not from the probe.
4. Base the spec on what you saw: confirmed assumptions go under Assumptions
   ("checked at align: ..."), and criteria describe the real output, not the
   guess. If the assumption failed, take the new options to William as a
   Step 3 question before writing the spec.

When nothing in the approach is uncertain, skip this and say so in one line.

## Step 5: Write the spec and confirm

Copy `specs/TEMPLATE.md` to `specs/<slug>.md` and fill in every section:

- **Branch**: the new branch and the branch it starts from, usually `main`.
  `run-spec` and the reviewer diff against that parent.
- **Goal**, **Non-goals**: from the scope answers.
- **Assumptions**: every default you picked instead of asking.
- **Acceptance criteria**: checkable statements a reviewer who didn't write the
  code can mark met or not from the diff, a command or the built page. Not
  "looks good"; "the Services section lists 4 items, each from `site.ts`".
- **Quality criteria**: required for subjective work (copy, design, layout,
  structure): 3 to 5 checkable criteria, e.g. "follows the card pattern in
  `SiteCard.astro`", "no new dependency", "every color from `tokens.css`".
  Delete the section when the work isn't subjective. The reviewer grades only
  these two lists, so anything that matters must be in one of them.
- **Tasks**: small, ordered, each one independently verifiable with its own
  "Done when" line, and each leaving `bash scripts/check.sh` passing.

Show William the spec's path and a short summary (goal, non-goals, the
assumptions, the criteria, task titles), plus new dependencies and open risks.
Then ask one final `AskUserQuestion`: "Is this 100% right?" with options
"Yes, build it" / "Change something". Only "Yes, build it" unlocks building.
"Change something" updates the spec, then asks again.

## Step 6: Log it

Append confirmed decisions to `docs/DECISIONS.md` under a dated heading
(`## YYYY-MM-DD: <topic>`). One line per decision, plus a **Why:** line where the
reason is not obvious, and a link to the spec. Superseded decisions get struck
through, not deleted.

Then say the next step: `/run-spec <slug>`.

## Rules

- No em dashes anywhere (copy, docs, comments, replies).
- Never assume silently. A default either goes in the spec's Assumptions or, if a
  wrong guess changes the outcome, gets asked with it marked "(Recommended)".
- Flag every new dependency, cost, or account William must create.
- Ask before anything destructive (deleting files, force pushes, repo settings).
