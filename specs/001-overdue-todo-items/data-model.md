# Data Model: Support for Overdue Todo Items

No new persisted entities, fields, or schema changes are introduced by this feature.
"Overdue" is a **derived, computed value** — not stored — based on fields the Todo Item
already has.

## Todo Item (existing entity, unchanged)

| Field       | Type            | Notes                                              |
|-------------|-----------------|-----------------------------------------------------|
| `id`        | number          | Existing primary key, unchanged                     |
| `title`     | string          | Existing, unchanged                                  |
| `dueDate`   | string \| null  | Existing ISO date string or `null`, unchanged        |
| `completed` | 0 \| 1 (boolean)| Existing completion flag, unchanged                  |
| `createdAt` | string          | Existing, unchanged                                  |

## Derived Value: `overdue`

Not persisted or added to the entity — computed at render time from `dueDate` and
`completed`.

**Definition** (`isOverdue(todo, referenceDate = new Date())`):

```
overdue = todo.completed !== true/1
          AND todo.dueDate is present
          AND todo.dueDate < startOfDay(referenceDate)
```

### Truth table (from spec Acceptance Scenarios / Edge Cases)

| `dueDate`        | `completed` | `overdue` |
|------------------|-------------|-----------|
| yesterday        | false       | `true`    |
| yesterday        | true        | `false`   |
| today            | false       | `false`   |
| tomorrow         | false       | `false`   |
| `null`/unset     | false       | `false`   |

### Validation rules

- Comparison MUST be at day granularity: a due date equal to the current date is NOT
  overdue (FR-004). Time-of-day components of `dueDate`/`referenceDate` must not cause a
  same-day due date to be misclassified as overdue.
- A missing/`null`/unparseable `dueDate` MUST yield `overdue = false` rather than throwing
  (FR-002, Principle V — no silent crashes on bad data).
- Completed todos MUST always yield `overdue = false` regardless of `dueDate` (FR-003).

## State Transitions (derived, not persisted)

`overdue` is not a stored state and has no transition history; it is recomputed from
scratch on every evaluation. It can flip from `false` → `true` purely due to elapsed time
(midnight rollover, detected via the periodic re-check, FR-007), and flips `true` → `false`
immediately when the user completes the todo or edits `dueDate` to today/future (FR-008),
since those actions already trigger a re-render via existing state updates.
