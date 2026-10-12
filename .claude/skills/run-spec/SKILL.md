---
name: run-spec
description: Build an aligned spec (specs/<slug>.md) one task at a time. Use when William says "/run-spec <slug>", "run the spec" or "build it" after align has written a spec. Each task runs in a fresh subagent with a handoff file, scripts/check.sh gates every ticked box, and the reviewer agent grades the result with up to 3 fix rounds. The main session only orchestrates.
---

# Run spec: build a spec task by task

You are the orchestrator. Subagents write and review the code; you dispatch
them, run `check.sh`, tick boxes and report. Keep your own context small:
don't read source files or diffs yourself beyond what a step below needs.

## Step 0: Load and check

1. Find the spec: `specs/<slug>.md` from the argument. If there's no argument
   and more than one spec has unticked tasks, ask which one.
2. Refuse (and say why) if it has no Acceptance criteria or no Tasks, or still
   reads like the unfilled `specs/TEMPLATE.md`. Point William at `/align`.
3. If you're not on the branch named in the spec, switch to it, or create it
   from the current branch (`git switch -c <branch>`). Never build on `main`.
4. If `git status` shows changes other than `specs/` and `docs/DECISIONS.md`,
   ask before starting: they'd get mixed into this work.
5. Create `specs/<slug>.progress.md` if it doesn't exist:

   ```
   # Progress: <slug>

   Handoff notes from each task, newest last. Read before starting a task.
   ```

6. Run `bash scripts/check.sh` as a baseline. If it fails before any task,
   stop and report: the failure isn't from this work.

## Step 1: One task at a time

For the first task whose box is `- [ ]`:

1. Spawn a fresh subagent (`Agent`, `subagent_type: general-purpose`). Give it
   only the spec path and this task, never conversation history:

   ```
   You're implementing one task from specs/<slug>.md in this repo.

   Read first, in full:
   - specs/<slug>.md: the goal, non-goals and criteria this task serves.
   - specs/<slug>.progress.md: handoff notes from earlier tasks.

   Your task, verbatim from the spec:
   <the task's title, Do and Done when lines>

   Rules:
   - Do only this task. Nothing from later tasks, nothing in Non-goals.
   - Make `bash scripts/check.sh` pass before you finish.
   - Don't commit, push, or tick boxes in the spec.
   - Before finishing, append to specs/<slug>.progress.md:

     ## T<n>: <title>
     - Did: <files changed, one line each>
     - Decisions: <choice> because <why>
     - Dead ends: <what didn't work, so nobody retries it>
     - Surprises: <anything unexpected about the code>
     - Next task should know: <...>

     Short bullets. Write "none" rather than leave a line out.

   Reply with: files changed, check.sh result, and anything blocking.
   ```

2. When it returns, run `bash scripts/check.sh` yourself. The subagent's
   report isn't proof.
3. **Pass**: tick the box (`- [ ]` to `- [x]`) and go to the next task. If the
   subagent skipped its progress entry, add one line saying so.
4. **Fail**: retry once with a new fresh subagent, the same prompt, plus the
   failing check.sh lines and "The first attempt's notes are the last entry in
   the progress file. Don't repeat its dead ends."
5. **Fails twice**: stop. Don't tick, don't move on. Report the task, what
   both attempts tried (from the progress file) and the failing lines.

## Step 2: Review and fix (at most 3 fix rounds)

When every box is ticked and check.sh passes:

1. Spawn the reviewer (`subagent_type: reviewer`) with: the spec path, "the
   working tree against main", and, after round 1, the previous findings.
2. **approve**: go to Step 3.
3. **request changes**: spawn a fresh `general-purpose` fixer with the spec
   path, the progress path and the reviewer's "Required changes" verbatim.
   Same rules as a task subagent; its progress heading is
   `## Review fix <round>`. Run `bash scripts/check.sh` yourself, then review
   again.
4. After 3 fix rounds, if the verdict is still request changes, stop. Report
   which criteria are still partial or missing, with the reviewer's evidence.

## Step 3: Report

Short, in this shape:

```
Spec: specs/<slug>.md (<n>/<n> tasks ticked)
check.sh: pass | fail
Review: approve | request changes after 3 rounds
Criteria: <one line each: met / partial / missing>
Notes: specs/<slug>.progress.md
```

If it all passed, the next step is `/ship`. Don't commit or open a PR here.

## Rules

- Orchestrate only. The only files you edit are the spec's checkboxes and the
  progress file's header.
- Never tick a box without a passing check.sh that you ran.
- Never skip, reorder, merge or rewrite tasks without asking William.
- Report failures as they are. Never mark a failure as passing.
- No em dashes anywhere.
