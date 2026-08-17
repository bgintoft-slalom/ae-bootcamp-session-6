---

description: "Task list template for feature implementation"
---

# Tasks: Support for Overdue Todo Items

**Input**: Design documents from `/specs/001-overdue-todo-items/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Explicitly requested by the feature spec (FR-009, FR-010) — test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

This is a web application monorepo. This feature is frontend-only; all paths are under `packages/frontend/src/`. No backend changes are required.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the new `utils` module location used by this feature.

- [X] T001 Create `packages/frontend/src/utils/` directory and `packages/frontend/src/utils/__tests__/` directory (no files yet, just the structure needed for the `isOverdue` utility and its tests)

**Checkpoint**: Directory structure ready for foundational work.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core derived-status logic that BOTH user stories depend on. Must be complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Write failing tests for `isOverdue(todo, referenceDate)` in `packages/frontend/src/utils/__tests__/todoStatus.test.js` covering the FR-009 truth table: past due date + incomplete → `true`; past due date + completed → `false`; due date today + incomplete → `false`; future due date + incomplete → `false`; no due date + incomplete → `false`; malformed/unparseable `dueDate` → `false` (no throw)
- [X] T003 Implement `isOverdue(todo, referenceDate = new Date())` pure function in `packages/frontend/src/utils/todoStatus.js`, comparing at day granularity (`startOfDay` semantics), treating `completed` truthy (`1`/`true`) as never overdue, and returning `false` for missing/invalid `dueDate` instead of throwing, so all tests from T002 pass

**Checkpoint**: `isOverdue` utility fully implemented, tested, and passing — ready for both user stories to consume.

---

## Phase 3: User Story 1 - Spot Overdue Todos at a Glance (Priority: P1) 🎯 MVP

**Goal**: Visually distinguish incomplete todos whose due date has passed, using an "Overdue" text badge next to the due date, styled with the existing danger color.

**Independent Test**: Populate the todo list with todos covering each due-date state (past, today, future, none) in both completed and incomplete status, then verify only incomplete todos with a past due date show the overdue treatment.

### Tests for User Story 1

- [X] T004 [P] [US1] Write failing tests in `packages/frontend/src/components/__tests__/TodoCard.test.js` asserting the "Overdue" badge renders (text content "Overdue") for a todo with a past `dueDate` and `completed: 0`, and does NOT render for: completed + past due date, due date today, future due date, and no due date

### Implementation for User Story 1

- [X] T005 [US1] Add `.badge-overdue` CSS class in `packages/frontend/src/App.css` near the existing `.todo-due-date` rule (around line 363), styled using the existing `--danger-color` token (no new color tokens)
- [X] T006 [US1] Import `isOverdue` from `../utils/todoStatus` in `packages/frontend/src/components/TodoCard.js` and render a `<span className="badge-overdue">Overdue</span>` next to the due date (inside the existing `todo.dueDate && (...)` block) only when `isOverdue(todo)` is `true`, so tests from T004 pass

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently — overdue todos show the badge on render, satisfying FR-001 through FR-006 and FR-009/FR-010.

---

## Phase 4: User Story 2 - Overdue Status Updates Immediately with Todo Changes (Priority: P2)

**Goal**: Ensure the overdue indicator updates immediately when a todo's completion state or due date changes (no reload), and re-evaluates periodically (≥ once/minute) purely from the passage of time while the list stays open.

**Independent Test**: With an overdue todo visible in the list, mark it complete and confirm the overdue indicator disappears immediately; edit its due date to a future date and confirm the same; leave the list open across a simulated date rollover and confirm the badge appears without any other action.

### Tests for User Story 2

- [X] T007 [P] [US2] Extend `packages/frontend/src/components/__tests__/TodoCard.test.js` with two tests: (1) render an overdue todo, then re-render with `completed: 1` (simulating the toggle), asserting the "Overdue" badge is no longer present; (2) render an overdue todo, then re-render with `dueDate` changed to today/future, asserting the "Overdue" badge is no longer present — no page reload needed for either since these are normal React re-renders (covers spec Acceptance Scenarios US2-1 and US2-2)
- [X] T008 [P] [US2] Write failing tests in `packages/frontend/src/components/__tests__/TodoList.test.js` using `jest.useFakeTimers()` to verify a periodic re-render tick occurs at least once per minute (advance timers by 60s and confirm the list re-renders enough to re-evaluate `isOverdue`, e.g. by checking a todo due "today" at render time shows the badge after simulated time advances past midnight)

### Implementation for User Story 2

- [X] T009 [US2] Add a periodic re-render mechanism to `packages/frontend/src/components/TodoList.js`: a `useEffect` with `setInterval` (interval ≤ 60000ms) updating a local tick state, and `clearInterval` on cleanup/unmount, so `isOverdue` in child `TodoCard`s is re-evaluated against the current time at least once per minute, so tests from T008 pass

**Checkpoint**: Both user stories independently functional — badge updates immediately on todo changes (React re-render, no extra code needed beyond US1) and also updates purely from elapsed time via the new periodic tick.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across both stories.

- [X] T010 Run `npm run test:frontend` from repo root and confirm all new and existing tests pass with coverage remaining ≥ 80% per SC-004, per `packages/frontend/src/utils/__tests__/todoStatus.test.js`, `packages/frontend/src/components/__tests__/TodoCard.test.js`, and `packages/frontend/src/components/__tests__/TodoList.test.js`
- [X] T010a Run `npm run lint` from repo root and fix any errors/warnings in the new/modified files (`todoStatus.js`, `TodoCard.js`, `TodoList.js`, their tests, `App.css`) per the constitution's Development Workflow
- [ ] T011 Manually validate the quickstart.md scenarios end-to-end via `npm start` (create overdue/today/future/no-due-date todos; toggle complete; edit due date) to confirm the badge appears/disappears as expected in the running app

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. BLOCKS both User Story phases.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion (needs `isOverdue`). Can start once Phase 2 is done.
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion; T009 also depends on User Story 1's T006 (badge must render before its immediate-update and periodic-refresh behavior can be verified/observed in `TodoList`). Recommended to implement after Phase 3 completes.
- **Polish (Phase 5)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other stories — the MVP. Only depends on the Foundational `isOverdue` utility.
- **User Story 2 (P2)**: Builds on User Story 1 (the badge must exist before its update behavior is meaningful) but does not modify US1's files' core logic — it adds a periodic timer in `TodoList.js`.

### Within Each User Story

- Tests (if included) MUST be written and FAILING before implementation.
- Story complete when its checkpoint criteria are met.

### Parallel Opportunities

- T002 (write tests) and T001 (setup directories) have no file overlap with each other's targets but T002 depends on T001's directory existing — run T001 first, then T002.
- Within User Story 1: T004 (test file) can be written in parallel with T005 (CSS) since they touch different files; T006 depends on both.
- Within User Story 2: T007 and T008 touch different test files and can run in parallel; T009 depends on both being written (failing) first.
- Once Foundational (Phase 2) is done, User Story 1 and User Story 2 test-writing tasks (T004, T007, T008) could be drafted in parallel, though T007/T008 are most meaningful once T006 (badge rendering) exists.

---

## Parallel Example: User Story 1

```bash
# Launch T004 and T005 together (different files):
Task: "Write failing badge tests in packages/frontend/src/components/__tests__/TodoCard.test.js"
Task: "Add .badge-overdue CSS class in packages/frontend/src/App.css"
```

## Parallel Example: User Story 2

```bash
# Launch T007 and T008 together (different files):
Task: "Extend TodoCard.test.js with immediate-update test"
Task: "Write TodoList.test.js periodic re-render test with fake timers"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (`isOverdue` utility + tests) — CRITICAL, blocks everything else
3. Complete Phase 3: User Story 1 (badge rendering)
4. **STOP and VALIDATE**: Run `npm run test:frontend`, manually verify badge shows/hides correctly per quickstart.md steps 2, 4, 5, 6
5. Deploy/demo if ready — this alone satisfies the core feature value (SC-001, SC-002, SC-003)

### Incremental Delivery

1. Setup + Foundational → `isOverdue` utility ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (full FR-007/FR-008 coverage)
4. Polish phase → Final coverage and manual validation pass
