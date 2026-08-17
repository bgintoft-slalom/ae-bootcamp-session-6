# Implementation Plan: Support for Overdue Todo Items

**Branch**: `001-overdue-todo-items` | **Date**: 2026-08-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-overdue-todo-items/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Visually distinguish incomplete todos whose due date has passed by rendering a "Overdue"
text badge (styled with the existing danger color) next to the due date on each todo card.
Overdue status is a derived value computed from the existing `dueDate` and `completed`
fields (no new persisted data, no backend changes). Computation happens in a shared,
independently testable utility function, re-evaluated on every render and on a periodic
(≥ once/minute) timer so the badge appears/disappears without requiring a page reload.

## Technical Context

**Language/Version**: JavaScript (ES2020+), React 18.2 (frontend package only)

**Primary Dependencies**: React 18.2, react-scripts 5.0.1 (existing); no new dependencies required

**Storage**: N/A — overdue status is derived from the existing `dueDate`/`completed` fields, no schema or persistence changes

**Testing**: Jest + React Testing Library via `react-scripts test`, colocated in `__tests__/` following existing repo conventions

**Target Platform**: Web browser (existing React SPA, `packages/frontend`)

**Project Type**: Web application (npm workspaces: `frontend` + `backend`) — this feature is frontend-only

**Performance Goals**: Negligible; a single lightweight `setInterval` tick (≤ once/minute) per mounted list, no added network calls

**Constraints**: No new persisted fields or API changes; must reuse existing color tokens (`--danger-color`) and typography from `docs/ui-guidelines.md`; indicator must not rely on color alone (text badge)

**Scale/Scope**: Single derived-state utility + one component update (`TodoCard`) + optional small hook for periodic re-render; scope limited to display logic, no new screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality & Consistency**: Overdue determination will live in one shared utility
  (`src/utils/todoStatus.js`) rather than being duplicated inline in components, following
  camelCase/PascalCase conventions and the prescribed import order. PASS
- **II. Test-First & Comprehensive Coverage**: New utility gets a colocated
  `__tests__/todoStatus.test.js` covering all FR-009 scenarios; `TodoCard` tests extended for
  badge show/hide per FR-010. PASS
- **III. Simplicity & Scope Discipline**: No new persisted field, no backend change, no
  sorting/filtering/notifications added — strictly the visual badge and its derivation, per
  functional requirements and constitution scope. PASS
- **IV. Consistent UI & Accessibility**: Badge is a text label ("Overdue") using the existing
  `--danger-color` token, not color-only signaling; keyboard/DOM structure unaffected. PASS
- **V. Error Handling & Observability**: Date parsing in the utility guards against
  malformed/missing `dueDate` values, returning `false` rather than throwing, so a bad date
  never crashes the list render. PASS

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
packages/frontend/
├── src/
│   ├── components/
│   │   ├── TodoCard.js          # add Overdue badge rendering next to due date
│   │   ├── TodoList.js          # host periodic re-render tick (setInterval-based hook)
│   │   └── __tests__/
│   │       └── TodoCard.test.js # extend: badge show/hide per FR-010
│   ├── utils/                   # new folder
│   │   ├── todoStatus.js        # isOverdue(todo, referenceDate) pure function
│   │   └── __tests__/
│   │       └── todoStatus.test.js # FR-009 scenarios
│   └── styles/
│       └── theme.css            # reuse existing --danger-color token (no new tokens)

packages/backend/                # unchanged — no API or schema changes required
```

**Structure Decision**: Web application monorepo (`packages/frontend` + `packages/backend`
npm workspaces, per `docs/project-overview.md`). This feature is implemented entirely within
`packages/frontend`: a new `utils/todoStatus.js` holds the pure overdue-determination logic
(independently unit-testable per FR-009), `TodoCard.js` renders the badge using that utility
(tested per FR-010), and `TodoList.js` (or a small custom hook) drives the periodic
re-evaluation timer required by FR-007. No backend changes are needed since overdue status
is fully derived from data the API already returns.

## Complexity Tracking

*No violations — table not applicable.*
