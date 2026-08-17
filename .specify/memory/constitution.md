<!--
Sync Impact Report
==================
Version change: [unratified template] → 1.0.0
Modified principles: N/A (initial ratification)
Added sections:
  - Core Principles: I. Code Quality & Consistency, II. Test-First & Comprehensive Coverage,
    III. Simplicity & Scope Discipline, IV. Consistent UI & Accessibility, V. Error Handling &
    Observability
  - Development Workflow (git practices, linting, code review)
  - Additional Constraints (technology stack, project structure)
  - Governance
Removed sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending manual review (not modified by this command)
  - .specify/templates/spec-template.md ⚠ pending manual review (not modified by this command)
  - .specify/templates/tasks-template.md ⚠ pending manual review (not modified by this command)
Follow-up TODOs: none
-->

# ae-bootcamp-session-6 Constitution

## Core Principles

### I. Code Quality & Consistency
All code MUST follow the conventions in `docs/coding-guidelines.md`: 2-space indentation,
`camelCase` for variables/functions, `PascalCase` for components and classes,
`UPPER_SNAKE_CASE` for constants, and the prescribed import order (external libraries,
internal modules, styles). Code MUST adhere to DRY (extract repeated logic into shared
utilities), KISS (prefer the simplest solution that works), and SOLID principles
(single responsibility per module/component/function, minimal and focused prop/interface
surfaces). Comments MUST explain "why", not "what"; obvious comments are prohibited.
Rationale: Shared, enforced conventions keep a multi-package monorepo (frontend + backend)
readable and maintainable as contributors change over time.

### II. Test-First & Comprehensive Coverage (NON-NEGOTIABLE)
Every feature or fix MUST include tests colocated in `__tests__/` directories next to the
code under test, named `{filename}.test.js`. The project targets 80%+ code coverage across
all packages, combining unit tests (components, route handlers, utilities in isolation) and
integration tests (component interactions, frontend-to-backend API communication). Tests
MUST be independent, deterministic, and isolated (no shared state, mock external
dependencies), and MUST verify behavior rather than implementation details. End-to-end tests
are out of scope until explicitly introduced. Rationale: Deterministic, behavior-focused
tests catch regressions early and allow safe refactoring across the monorepo.

### III. Simplicity & Scope Discipline
Implementations MUST stay within the scope defined in `docs/functional-requirements.md`:
a single-user todo application with create, view, complete/incomplete toggle, edit, and
delete operations, backed by the existing Express.js API. Features explicitly marked out of
scope (authentication, multi-user support, priorities/categories, recurring todos,
reminders, undo/redo, bulk operations, advanced filtering/search) MUST NOT be added without
a corresponding update to the functional requirements and this constitution. Prefer the
simplest solution that satisfies a requirement; avoid speculative abstractions or premature
optimization (YAGNI). Rationale: A tightly scoped todo app stays easy to reason about, test,
and extend deliberately rather than accumulating unplanned complexity.

### IV. Consistent UI & Accessibility
All user-facing UI MUST follow `docs/ui-guidelines.md`: the defined color palette and
typography for light/dark modes, the 8px spacing grid, single-column responsive layout, and
documented component patterns (todo card, input fields, buttons, confirmation dialog).
Interactive elements MUST be keyboard accessible, use properly associated form labels, and
provide descriptive titles/aria-labels for icon-only controls. Color contrast MUST meet
WCAG AA. Rationale: A consistent design system and accessibility baseline ensure the app is
usable and predictable for all users and easy to extend visually.

### V. Error Handling & Observability
Operations that can fail (API calls, data persistence) MUST be wrapped in explicit error
handling that surfaces meaningful, actionable feedback to the user and logs sufficient
context for debugging. Silent failures are prohibited. Rationale: A todo app is only useful
if users understand when and why an action didn't succeed, and developers can diagnose
issues from logs.

## Development Workflow

- Follow ESLint rules and fix all linting errors/warnings before opening a pull request; run
  `npm run lint` (and `npm run lint:fix` where applicable) as part of local development.
- Use feature branches for new work (e.g., `feature/todo-editing`) and open a pull request
  for review before merging; direct commits to shared branches are discouraged.
- Commits MUST be atomic (one logical change each) with clear messages explaining the "why".
- Run `npm test` across all packages before submitting a pull request.

## Additional Constraints

- Technology stack: React (frontend) and Node.js/Express.js (backend), organized as npm
  workspaces per `docs/project-overview.md`. Do not introduce alternate frameworks without
  amending this constitution.
- File organization MUST follow the structures documented in `docs/coding-guidelines.md`
  (`components/`, `services/`, colocated `__tests__/` for frontend; equivalent layered
  structure for backend).
- No database schema changes beyond basic todo storage unless the functional requirements
  are updated first.

## Governance

This constitution supersedes ad hoc practices for this repository. All pull requests and
code reviews MUST verify compliance with the Core Principles above; any deviation MUST be
justified in the PR description and, if it represents a lasting change, MUST be accompanied
by an amendment to this document. Amendments follow semantic versioning:
- **MAJOR**: Backward-incompatible removal or redefinition of a principle or governance rule.
- **MINOR**: A new principle or materially expanded guidance is added.
- **PATCH**: Clarifications, wording, or typo fixes with no semantic change.

Use `docs/coding-guidelines.md`, `docs/functional-requirements.md`, `docs/testing-guidelines.md`,
and `docs/ui-guidelines.md` as the detailed, runtime reference material underlying these
principles; keep them in sync with this constitution when either changes.

**Version**: 1.0.0 | **Ratified**: 2026-08-17 | **Last Amended**: 2026-08-17
