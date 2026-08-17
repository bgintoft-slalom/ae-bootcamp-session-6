# Quickstart: Support for Overdue Todo Items

This guide validates the overdue-todo feature end-to-end. See [data-model.md](./data-model.md)
for the `isOverdue` derivation rules and [research.md](./research.md) for design decisions.
No API contracts changed — this is a frontend-only, derived-display feature.

## Prerequisites

- Node.js installed, repo dependencies installed: `npm run install:all` from repo root.
- Backend and frontend can run together via `npm start` (root `package.json`), or frontend
  tests can run standalone.

## Automated Validation (primary)

Run the frontend test suite, which must cover all scenarios from FR-009/FR-010:

```bash
npm run test:frontend
```

Expected outcomes:

- `src/utils/__tests__/todoStatus.test.js` passes, covering:
  - past due date + incomplete → overdue
  - past due date + completed → not overdue
  - due date today + incomplete → not overdue
  - future due date + incomplete → not overdue
  - no due date + incomplete → not overdue
- `src/components/__tests__/TodoCard.test.js` passes, covering:
  - "Overdue" badge renders for an overdue todo
  - badge does not render for a completed, future-due, or due-today todo
  - badge disappears immediately when the todo is toggled complete (no reload)
  - badge disappears immediately when the todo's due date is edited to today/future (no reload)
- Coverage remains at or above the project's 80%+ threshold (`--coverage` is already enabled
  in `packages/frontend/package.json`'s `test` script).

## Manual Validation (exploratory)

1. Start the app: `npm start` from repo root (starts both frontend and backend).
2. Create a todo with a due date set to yesterday; leave it incomplete.
   - **Expected**: The todo card shows an "Overdue" badge next to the due date, styled in
     the danger color.
3. Mark that todo complete via its checkbox.
   - **Expected**: The "Overdue" badge disappears immediately, no page reload.
4. Uncheck it again, then edit its due date to tomorrow.
   - **Expected**: The "Overdue" badge does not appear.
5. Create a todo with no due date.
   - **Expected**: No "Overdue" badge is ever shown for it.
6. Create a todo due today.
   - **Expected**: No "Overdue" badge is shown.
7. (Time-based) Leave an incomplete todo due "today" open in the list past midnight (or
   simulate by adjusting the system clock in a dev environment), without touching the todo
   or reloading the page.
   - **Expected**: Within about a minute of the date rolling over, the badge appears on its
     own (validates the periodic re-check from FR-007).

## Success Criteria Traceability

- SC-001 / SC-002 / SC-003 → covered by `todoStatus.test.js` truth-table coverage and
  `TodoCard.test.js` badge assertions.
- SC-004 → verified by the `--coverage` output of `npm run test:frontend` staying ≥ 80% for
  touched files.
