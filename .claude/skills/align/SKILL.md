---
name: align
description: Requirements alignment gate for William's portfolio site. Use BEFORE starting any new feature, page, section, design change, content change, dependency, infra/CI change, or any request that is broad or ambiguous. Asks every question needed so Claude and William are 100% aligned, reflects the answers back for explicit confirmation, and logs the decisions. Trigger on "/align", "let's add", "let's build", "change the", "new section", "redesign", or any non-trivial request on this project.
---

# Align: get 100% on the same page before building

William wants to be a participant in scoping, never handed guesses. No code, no file
edits, no installs until this process ends with an explicit "yes".

## Step 1: Load what is already decided

1. Read `docs/DECISIONS.md` (create it in Step 5 if missing).
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

- Use `AskUserQuestion`, max 4 questions per round, 2 to 4 concrete options each.
- Put the recommended option first, labelled "(Recommended)", with a one-line why.
- Use `preview` for visual choices (layout mockups, color palettes, code shapes).
- Ask the highest-impact questions first; later answers often depend on earlier ones.
- Keep going round after round until no open questions remain. Do not stop early
  because it feels like "enough".
- Free-text answers ("Other") that raise new unknowns get follow-up questions.

## Step 4: Reflect back and confirm

Present a short spec in this exact shape:

```
Request: <one line>
In scope: <bullets>
Out of scope: <bullets>
Decisions: <bullets, each one line>
New dependencies: <list or "none">
Open risks: <list or "none">
Acceptance: <how William checks it>
```

Then ask one final `AskUserQuestion`: "Is this 100% right?" with options
"Yes, build it" / "Change something". Only "Yes, build it" unlocks building.

## Step 5: Log it

Append confirmed decisions to `docs/DECISIONS.md` under a dated heading
(`## YYYY-MM-DD: <topic>`). One line per decision, plus a **Why:** line where the
reason is not obvious. Superseded decisions get struck through, not deleted.

## Rules

- No em dashes anywhere (copy, docs, comments, replies).
- Never assume defaults silently. If you would pick a default, ask with it marked
  "(Recommended)".
- Flag every new dependency, cost, or account William must create.
- Ask before anything destructive (deleting files, force pushes, repo settings).
