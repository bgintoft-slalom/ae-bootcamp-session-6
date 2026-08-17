# Research: Support for Overdue Todo Items

All unknowns from the Technical Context were resolvable from existing repo conventions and
the clarified spec; no NEEDS CLARIFICATION markers remain.

## Decision: Where overdue logic lives

- **Decision**: Implement a pure function `isOverdue(todo, referenceDate = new Date())` in a
  new `packages/frontend/src/utils/todoStatus.js` module.
- **Rationale**: Constitution Principle I (DRY) requires shared logic to live in one place,
  not duplicated inline in `TodoCard`. A pure function taking an injectable `referenceDate`
  is trivially unit-testable for all FR-009 scenarios (past, today, future, no due date,
  completed-but-past-due) without faking the system clock globally.
- **Alternatives considered**:
  - Inline comparison inside `TodoCard.js` — rejected: not reusable, harder to unit test in
    isolation, violates DRY if any other component needs the same check later.
  - Compute overdue status on the backend and return it as a field — rejected: spec/
    constitution explicitly state this is a derived UI concern, no persisted field, and
    Additional Constraints prohibit schema changes not required by functional requirements.

## Decision: Periodic re-check mechanism

- **Decision**: Use a small custom hook (e.g., `useInterval`-style effect with
  `setInterval`/`clearInterval` in a `useEffect`) inside `TodoList.js` that increments a local
  "tick" state at least once per minute, forcing re-render so `isOverdue` is re-evaluated
  against the current time.
- **Rationale**: FR-007 requires re-evaluation "periodically (at least once per minute)
  while the list stays open" purely from the passage of time, with no new data fetch. A
  render-triggering timer confined to the list component is the simplest mechanism (KISS)
  and avoids introducing new dependencies.
- **Alternatives considered**:
  - Global app-level timer/context — rejected: adds cross-cutting state for a need local to
    the todo list, unnecessary complexity (Principle III).
  - `requestAnimationFrame` loop — rejected: designed for animation, wasteful for a
    once-a-minute check.
  - Recompute only on existing re-renders (skip timer) — rejected: fails FR-007's explicit
    "passage of time alone" requirement (edge case: todo becomes overdue while list stays
    open with no other user action).

## Decision: Badge presentation

- **Decision**: Render a `<span>` with class `badge-overdue` and text "Overdue" next to the
  due date in `TodoCard.js`, styled with the existing `--danger-color` token in
  `theme.css`; no new color tokens introduced.
- **Rationale**: FR-006 specifies a text badge styled with the existing Danger color,
  displayed next to the due date, so status isn't conveyed by color alone (accessibility,
  Principle IV). Reusing `--danger-color` keeps light/dark mode support for free.
- **Alternatives considered**:
  - Icon-only indicator — rejected: fails "not relying on color alone" and explicit
    clarification that the indicator is a text badge reading "Overdue".
  - New dedicated color token — rejected: unnecessary given an existing danger token already
    covers this semantic meaning (YAGNI, Principle III).

## Decision: Testing approach

- **Decision**: Two colocated test files — `utils/__tests__/todoStatus.test.js` (pure logic,
  FR-009) and an extension of `components/__tests__/TodoCard.test.js` (badge rendering,
  FR-010) — using Jest + React Testing Library per existing patterns (see
  `packages/frontend/src/components/__tests__/TodoCard.test.js`).
- **Rationale**: Matches constitution Principle II (colocated `__tests__/`, `{filename}.test.js`
  naming, deterministic/isolated tests) and satisfies FR-009/FR-010 explicitly.
- **Alternatives considered**: A single combined test file — rejected: mixes pure-logic unit
  tests with component/DOM tests, harder to keep deterministic and against existing
  file-per-unit convention in the repo.
