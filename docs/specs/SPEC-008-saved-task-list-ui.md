# Saved Task List UI Specification

**Status:** Draft
**Owner:** Oamogetswe Makgopela
**Created:** 2026-08-25
**Last Updated:** 2026-08-25

Issue: [#8 - Build saved task list UI (edit, status change, delete, overdue/completed indicators)](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/8)
ADR: [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md) (Decision 6); app description Task List section

## Overview

Build the persistent task list view: fetch the current user's saved tasks
from Supabase and display them with title, owner, due date, and status,
supporting inline edit, status change, and delete, with clear visual
indicators for overdue and completed tasks.

## Goals

- Fetch and display the authenticated user's saved tasks from the `tasks`
  table.
- Allow editing a task's fields, changing its status, and deleting it.
- Persist all changes back to Supabase immediately.
- Visually distinguish overdue tasks (past due date, not completed) and
  completed tasks.

## Non-Goals

- The review-list-to-save flow (see #6, #7) — this issue covers the
  already-saved task list only.
- Sorting/filtering/search features beyond what's needed for basic
  usability — not specified in the app description, so treated as
  out-of-scope unless trivial to include.
- Auth/RLS enforcement itself (see #3) — this issue relies on RLS already
  being correct.

## User Stories

### As a user, I want to see all my saved tasks in one place, so that I can track what's outstanding

**Acceptance Criteria:**
- [ ] Only the current user's tasks are shown (relies on RLS from the auth/RLS issue).

### As a user, I want to edit a task or change its status directly in the list, so that I can keep it up to date without re-extracting from notes

**Acceptance Criteria:**
- [ ] Edits, status changes, and deletes persist to Supabase and reflect immediately in the UI.

### As a user, I want overdue and completed tasks to stand out visually, so that I can quickly see what needs attention

**Acceptance Criteria:**
- [ ] Overdue tasks (past due_date, not completed) and completed tasks are visually distinct.

## Technical Design

### Architecture

- `TaskList` component (scaffolded in #1) fetches tasks on mount (and after
  #7 saves new ones) via the Supabase client, scoped implicitly to the
  current user by RLS.
- Each task renders title, owner, due date, status, with inline edit
  controls (similar interaction pattern to #6's review rows) and a delete
  button.
- Edits and status changes call Supabase `update()` on the specific row by
  `id`; deletes call Supabase `delete()`.
- Local state is updated optimistically or refetched after each successful
  mutation so the UI reflects changes immediately.
- Overdue = `due_date < today AND status != done`. Completed = `status ==
  done`. Both computed client-side from the fetched rows.

### Data Model

Reads/writes the `tasks` table (from #2), scoped by RLS (from #3) to the
current `user_id`. No schema changes.

### API Design

- Supabase client `select()` (list, scoped by RLS), `update()` (edit/status
  change), `delete()` (remove row) against the `tasks` table.

### UI/UX Design

- List/table or card layout showing title, owner, due date, status per
  task.
- Status likely a dropdown/select for quick changes.
- Overdue: e.g. red text/border or a warning badge on the due date.
- Completed: e.g. strikethrough title or muted/greyed row styling.
- Delete requires no special confirmation for MVP unless deemed necessary
  (see open questions).

## Implementation Plan

### Phase 1: Fetch + display
- [ ] Fetch saved tasks on mount via Supabase client.
- [ ] Render title/owner/due date/status per task.

### Phase 2: Edit/status/delete
- [ ] Implement inline edit for task fields, persisting via `update()`.
- [ ] Implement status change control, persisting via `update()`.
- [ ] Implement delete, persisting via `delete()`.

### Phase 3: Visual indicators
- [ ] Compute and apply overdue styling.
- [ ] Apply completed styling.

## Testing Strategy

- Manual test: save tasks via #7, confirm they appear in the list; edit a
  field, confirm it persists after a page refresh; change status to done,
  confirm completed styling applies; delete a task, confirm it's removed
  from both UI and Supabase.
- Manual test: set a task's due date in the past with status not done,
  confirm overdue styling applies; confirm it disappears if status is
  changed to done.
- Manual cross-account test (paired with #3's testing) confirming only the
  current user's tasks are listed.

## Rollout Plan

- Can be developed against mock/fixture data before #7 is complete, then
  switched to live Supabase reads once available.

## Metrics & Success Criteria

- Success = all three acceptance criteria on issue #8 are met.

## Dependencies

- Depends on #2 (schema) and #3 (auth/RLS) to fetch real, correctly-scoped
  data.
- Depends on #7 for tasks to exist to display (can use fixture data to
  develop in parallel).

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Local UI state drifts from Supabase state after a mutation (e.g. edit succeeds server-side but UI doesn't reflect it) | Medium | Medium | Refetch or use the mutation's returned row to update local state directly, rather than assuming optimistic update always matches server state |
| Overdue calculation uses client's local timezone inconsistently vs. `due_date` (stored as date only) | Low | Medium | Compare `due_date` to the client's local "today" as a date-only comparison, avoiding time-of-day/timezone edge cases |

## Open Questions

- [ ] Should delete require a confirmation step, given it's a destructive action?
- [ ] Should the list support sorting (e.g. by due date) for MVP, or is insertion/creation order acceptable?

## References

- [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md)
- [SPEC-002: Supabase Project and Tasks Table Schema](./SPEC-002-supabase-project-tasks-table.md)
- [SPEC-003: Supabase Auth and Row Level Security](./SPEC-003-auth-rls.md)
- [SPEC-007: Save Tasks to Supabase](./SPEC-007-save-tasks-to-supabase.md)
- [Issue #8](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/8)
