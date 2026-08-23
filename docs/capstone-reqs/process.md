# Capstone Requirements Gathering Process

## Overview
Requirements for the capstone feature are proposed, discussed, and triaged as GitHub issues before being folded into a SpecKit spec via `/speckit-specify`.

## How to submit a requirement
1. Open a new GitHub issue in this repository.
2. Add the `requirement-proposal` label.
3. Describe the requirement: the problem, the desired behavior, and any acceptance criteria.

## Triage workflow
1. Requirements are reviewed on a regular cadence (e.g., weekly) against the project constitution (`.specify/memory/constitution.md`) and existing `docs/functional-requirements.md`.
2. Each proposal is marked as one of:
   - **Accepted** — in scope for the current spec
   - **Deferred** — valid but out of scope for now
   - **Rejected** — not aligned with project goals
3. Outcomes are recorded in `decisions.md` with a link back to the issue number and rationale.

## Acceptance criteria
A requirement is accepted only if it:
- Aligns with the principles in the project constitution
- Doesn't conflict with existing functional requirements
- Is specific enough to be testable

## Next step
Once a batch of requirements is accepted, run `/speckit-specify` to generate the feature spec from the accepted set.
