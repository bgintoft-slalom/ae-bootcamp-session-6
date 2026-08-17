# Feature Specification: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todo-items`

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "Support for Overdue Todo Items - As a todo application user, I want to easily identify and distinguish overdue tasks in my todo list, so that I can prioritize my work and quickly see which tasks are past their due date. Users need a clear, visual way to identify which todos have not been completed by their due date. This feature must include automated tests covering the overdue determination logic and its display, following the existing Jest patterns in the repository."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Spot Overdue Todos at a Glance (Priority: P1)

As a todo application user, I want todos that are past their due date and not yet completed to be visually distinguished in my list, so I can quickly identify which tasks need my attention first without manually comparing dates.

**Why this priority**: This is the entire value of the feature. Without a visible distinction, users must mentally compare every due date to today's date, which is slow and error-prone. This single story delivers the complete requested capability.

**Independent Test**: Populate the todo list with todos covering each due-date state (past, today, future, none) in both completed and incomplete status, then verify only incomplete todos with a past due date show the overdue treatment.

**Acceptance Scenarios**:

1. **Given** a todo with a due date earlier than today and not marked complete, **When** the todo list is displayed, **Then** that todo is visibly marked as overdue.
2. **Given** a todo with a due date earlier than today but marked complete, **When** the todo list is displayed, **Then** that todo is NOT marked as overdue.
3. **Given** a todo with a due date of today, **When** the todo list is displayed, **Then** that todo is NOT marked as overdue.
4. **Given** a todo with a due date in the future, **When** the todo list is displayed, **Then** that todo is NOT marked as overdue.
5. **Given** a todo with no due date set, **When** the todo list is displayed, **Then** that todo is NOT marked as overdue.

---

### User Story 2 - Overdue Status Updates Immediately with Todo Changes (Priority: P2)

As a todo application user, I want a todo's overdue indicator to update as soon as I complete it or change its due date, so the list always reflects accurate, current status without needing a page refresh.

**Why this priority**: Builds directly on User Story 1. Without this, users could be misled by a stale overdue indicator after taking action (e.g., marking a task complete), undermining trust in the feature.

**Independent Test**: With an overdue todo visible in the list, mark it complete and confirm the overdue indicator disappears immediately; edit its due date to a future date and confirm the same.

**Acceptance Scenarios**:

1. **Given** a todo currently displayed as overdue, **When** the user marks it complete, **Then** the overdue indicator is removed immediately without a page reload.
2. **Given** a todo currently displayed as overdue, **When** the user edits its due date to a present or future date, **Then** the overdue indicator is removed immediately without a page reload.

---

### Edge Cases

- A todo due exactly today is not treated as overdue (it becomes overdue starting the following day).
- A completed todo is never shown as overdue, regardless of its due date.
- A todo with no due date is never shown as overdue.
- Overdue status is re-evaluated each time the todo list is rendered, so a todo can transition from "not overdue" to "overdue" simply due to the passage of time (no due-date or completion change required).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST determine a todo to be overdue only when it has a due date earlier than the current date AND is not marked complete.
- **FR-002**: System MUST NOT classify a todo as overdue if it has no due date set.
- **FR-003**: System MUST NOT classify a completed todo as overdue, regardless of its due date.
- **FR-004**: System MUST treat a todo whose due date is the current date as not overdue.
- **FR-005**: The todo list MUST visually distinguish overdue todos from all other todos.
- **FR-006**: The overdue indicator MUST convey status through a means other than color alone (e.g., a text label or icon with an accessible name), so the status is perceivable without relying on color vision.
- **FR-007**: Overdue status MUST be re-evaluated automatically whenever the todo list is displayed, based on the current date, without requiring manual user action.
- **FR-008**: Overdue status MUST update immediately when a todo's completion state or due date changes, without requiring a page reload.
- **FR-009**: The overdue determination logic MUST be covered by automated tests validating past-due, due-today, future-due, no-due-date, and completed-but-past-due scenarios.
- **FR-010**: The display of the overdue indicator MUST be covered by automated tests confirming it appears and disappears correctly for the scenarios in FR-009.

### Key Entities

- **Todo Item**: The existing todo entity (title, due date, completion status). "Overdue" is a derived state computed from the existing due date and completion status; it is not a new persisted attribute.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify every overdue todo in their list at a glance, without checking any date against today's date manually.
- **SC-002**: 100% of todos that are incomplete with a past due date display the overdue indicator, verified through automated tests.
- **SC-003**: 0% of todos that are completed, not yet due, or without a due date incorrectly display the overdue indicator, verified through automated tests.
- **SC-004**: The overdue determination logic and its display reach the project's standard automated test coverage expectations (80%+).

## Assumptions

- "Overdue" is defined as: due date strictly before today's date, and the todo is not completed. A todo due today is not yet overdue.
- Overdue status is a computed/derived property based on existing `due date` and `completed` fields; no new field needs to be persisted or added to the data model.
- No notifications, reminders, sorting, filtering, or counting by overdue status are in scope for this feature, consistent with existing functional requirements and the project constitution.
- The visual treatment for overdue todos will use the existing color palette and typography defined in the UI guidelines rather than introducing new design elements.
- "Current date" is determined using the date on the device displaying the todo list.
