# <Title>

<!--
Copy to specs/<slug>.md. The `align` skill writes it, `run-spec` builds it,
`ship` links it in the PR. The reviewer grades only Acceptance criteria and
Quality criteria, so anything not written down there isn't checked.
-->

Branch: `<type>/<slug>`
Decisions: [docs/DECISIONS.md](../docs/DECISIONS.md), "YYYY-MM-DD: <topic>"
Progress: [<slug>.progress.md](<slug>.progress.md) (written by `run-spec`)

## Goal

<One or two sentences: what changes, for whom, and why.>

## Non-goals

- <Explicitly out of scope. The reviewer flags any change that lands here.>

## Assumptions

- <Defaults picked without asking. Each one is a guess William can correct.>

## Acceptance criteria

Each is a statement someone who didn't write the code can mark met or not,
from the diff, a command, or the built page.

1. <...>
2. `bash scripts/check.sh` passes.

## Quality criteria

Only for subjective work (copy, design, structure). 3 to 5, each checkable.
Delete this section when the work isn't subjective.

1. <Follows the existing pattern in `<file>`: <what the pattern is>.>
2. <No new dependency added.>
3. <No em dashes; copy lives in `src/config/site.ts`.>

## Tasks

Small and in order. Each one leaves `bash scripts/check.sh` passing and can be
verified on its own. `run-spec` ticks a box only after check.sh passes.

- [ ] **T1: <title>**
  - Do: <what to change, which files>
  - Done when: <checkable statements for this task only>
- [ ] **T2: <title>**
  - Do: <...>
  - Done when: <...>
