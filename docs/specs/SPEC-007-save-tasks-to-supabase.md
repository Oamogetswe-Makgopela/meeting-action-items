# Save Tasks to Supabase Specification

**Status:** Draft
**Owner:** Oamogetswe Makgopela
**Created:** 2026-08-25
**Last Updated:** 2026-08-25

Issue: [#7 - Wire Save Tasks to persist confirmed items to Supabase](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/7)
ADR: [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md) (Decisions 3, 6)

## Overview

Implement the actual persistence step: when the user clicks "Save Tasks" in
the review list (#6), write the confirmed rows to the `tasks` table via the
Supabase client, tagged with the current user's id and the originating
`source_notes`, with a clear error surfaced if the write fails.

## Goals

- Persist the review list's current rows to the `tasks` table on "Save
  Tasks".
- Tag each saved row with the authenticated user's `user_id`.
- Include `source_notes` (the original meeting notes text) on each saved
  row for traceability.
- Surface a clear error if the save fails, without silently losing data.

## Non-Goals

- The review list UI itself (see #6).
- The saved task list display of persisted rows (see #8).
- Detailed error-message UX design (see #9) — this issue just needs to
  surface *that* a save failed and roughly why.

## User Stories

### As a user, I want my reviewed tasks to actually be saved when I click "Save Tasks", so that they persist across sessions

**Acceptance Criteria:**
- [ ] Saved rows appear in the `tasks` table with correct `user_id` and `source_notes`.

### As a user, I want to know if saving failed, so that I don't assume my tasks were saved when they weren't

**Acceptance Criteria:**
- [ ] Save failures show a useful error message and do not silently drop data.

## Technical Design

### Architecture

- A save function (e.g. `saveTasks(rows, sourceNotes)`) called from #6's
  "Save Tasks" handler:
  1. Reads the current authenticated user's id from the Supabase Auth
     session (established in #3).
  2. Maps each review-list row to a `tasks` insert payload, adding
     `user_id` and `source_notes`.
  3. Calls the Supabase client's insert (bulk insert of all rows in one
     call where possible).
  4. On success, returns the inserted rows (with server-assigned `id`,
     `created_at`, `updated_at`) so #8's task list can display them
     immediately without a full refetch.
  5. On failure, returns/throws an error that #6 (or a shared error-display
     mechanism, see #9) surfaces to the user; the review list rows are
     retained (not cleared) so the user doesn't lose their edits.

### Data Model

Insert payload per row (matches #2's `tasks` schema):
```json
{
  "user_id": "auth.uid()",
  "title": "string",
  "description": "string",
  "owner": "string",
  "due_date": "YYYY-MM-DD or null",
  "status": "todo",
  "source_notes": "original meeting notes text"
}
```
`id`, `created_at`, `updated_at` are server-assigned defaults.

### API Design

- Supabase client `insert()` call against the `tasks` table (relies on
  RLS's insert policy from #3 to enforce `user_id` correctness).

### UI/UX Design

- No new UI beyond what #6 already provides; this issue is the logic behind
  the "Save Tasks" button.
- On failure, the review list must remain populated with the user's
  edits — nothing should be cleared or lost.

## Implementation Plan

### Phase 1: Save function
- [ ] Implement `saveTasks` mapping review rows to insert payloads with `user_id` and `source_notes`.
- [ ] Wire it to Supabase client `insert()`.

### Phase 2: Wire to review list
- [ ] Connect #6's "Save Tasks" button to this function.
- [ ] On success, clear the review list and hand saved rows to the task list (#8).
- [ ] On failure, keep the review list intact and surface an error.

### Phase 3: Verification
- [ ] Confirm saved rows in Supabase have correct `user_id` and `source_notes` via the dashboard.
- [ ] Simulate a failure (e.g. temporarily break the insert) and confirm the review list is not cleared and an error shows.

## Testing Strategy

- Manual test: save a review list with 2-3 rows, confirm they appear in
  Supabase with correct `user_id`/`source_notes`/timestamps.
- Manual test: simulate a network/Supabase failure and confirm the review
  list persists and an error is shown rather than the app silently
  proceeding.
- Unit test the row-to-payload mapping function in isolation.

## Rollout Plan

- Requires #2 (schema) and #3 (auth/RLS) to be in place first; cannot be
  meaningfully tested without both.

## Metrics & Success Criteria

- Success = both acceptance criteria on issue #7 are met: correct data
  lands in Supabase, and failures are surfaced without data loss.

## Dependencies

- Depends on #2 (tasks table schema).
- Depends on #3 (auth session for `user_id`, RLS insert policy).
- Depends on #6 (review list providing the rows to save).
- Feeds #8 (saved task list needs these rows to display).

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Partial save (some rows insert, others fail) leaves an inconsistent state | Medium | Low | Prefer a single bulk insert call (atomic per Postgres statement) over per-row inserts where possible |
| `user_id` omitted or wrong due to a stale/missing session | High | Low | Read the session immediately before save and fail fast with a clear "please sign in again" error if no valid session exists, rather than attempting the insert |

## Open Questions

- [ ] Should a save failure offer a retry action, or is re-clicking "Save Tasks" (already possible since the review list is retained) sufficient for MVP?

## References

- [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md)
- [SPEC-002: Supabase Project and Tasks Table Schema](./SPEC-002-supabase-project-tasks-table.md)
- [SPEC-003: Supabase Auth and Row Level Security](./SPEC-003-auth-rls.md)
- [SPEC-006: Editable Action Item Review List](./SPEC-006-editable-review-list.md)
- [Issue #7](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/7)
