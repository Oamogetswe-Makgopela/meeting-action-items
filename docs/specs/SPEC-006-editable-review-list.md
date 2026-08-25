# Editable Action Item Review List Specification

**Status:** Draft
**Owner:** Oamogetswe Makgopela
**Created:** 2026-08-25
**Last Updated:** 2026-08-25

Issue: [#6 - Build editable action item review list (add/edit/delete before save)](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/6)
ADR: [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md) (Decision 3)

## Overview

Build the review step between AI extraction and persistence: extracted
action items are rendered as editable rows the user can modify, delete, or
add to, with explicit "Save Tasks" and "Clear" actions. Nothing reaches the
database until the user clicks "Save Tasks" — this is the mechanism that
satisfies ADR-001's "never auto-save AI output" requirement.

## Goals

- Render each extracted action item as an editable row/card (title,
  description, owner, due date, status, delete button).
- Provide "Add Task" to manually add a row.
- Provide "Save Tasks" and "Clear" actions.
- Keep all of this in client-side state only until "Save Tasks" is clicked.
- Ensure "Clear" discards the in-progress list without touching already-
  saved data.

## Non-Goals

- The actual Supabase write on save (see #7).
- The saved task list display (see #8) — this is only the pre-save review
  step.
- The extraction call itself (see #4, #5) — this issue consumes extraction
  results as input.

## User Stories

### As a user, I want to review and correct AI-extracted tasks before they're saved, so that mistakes never end up silently persisted

**Acceptance Criteria:**
- [ ] User can edit any field on any row before saving.
- [ ] Nothing is written to Supabase until "Save Tasks" is clicked.

### As a user, I want to remove incorrect items or add ones the AI missed, so that the saved list is accurate

**Acceptance Criteria:**
- [ ] User can delete a row or add a new manual row.

### As a user, I want to discard a bad extraction and start over without affecting my previously saved tasks

**Acceptance Criteria:**
- [ ] "Clear" resets the review list without affecting previously saved tasks.

## Technical Design

### Architecture

- `ReviewList` component (scaffolded in #1) holds an array of row objects in
  local/lifted state, seeded from the extraction result handed off by #4.
- Each row renders editable fields: title (text), description (textarea),
  owner (text), due date (date input), status (select), plus a delete
  button.
- "Add Task" appends a new blank row (empty title/description/owner/
  due_date, default status e.g. `todo`) to the array.
- "Save Tasks" hands the current row array off to the persistence logic in
  #7 and, on success, clears the review list.
- "Clear" resets the row array to empty without calling any persistence
  logic.
- State is entirely local to this review flow — it does not touch the
  `tasks` table until #7's save call succeeds.

### Data Model

Row shape (client-side only until saved):
```json
{
  "title": "string",
  "description": "string",
  "owner": "string",
  "due_date": "YYYY-MM-DD or empty",
  "status": "todo | in_progress | done"
}
```
No `id`/`user_id`/timestamps yet — those are assigned at save time (#7).

### API Design

None directly — this component calls into #7's save function/hook, which
owns the actual Supabase write.

### UI/UX Design

- Rows displayed as cards or table rows, each with inline-editable fields.
- Delete button per row, clearly separated from other actions to avoid
  accidental deletion.
- "Add Task", "Save Tasks", and "Clear" as distinct, clearly-labeled
  buttons per the app description.
- Empty review list (e.g. after Clear, or before any extraction) shows the
  empty state already established in #1.

## Implementation Plan

### Phase 1: Render + edit
- [ ] Render extraction results (from #4) as editable rows.
- [ ] Wire field edits to local state.

### Phase 2: Add/delete
- [ ] Implement "Add Task" (new blank row).
- [ ] Implement per-row delete.

### Phase 3: Save/Clear
- [ ] Wire "Save Tasks" to call #7's persistence logic with the current rows.
- [ ] Wire "Clear" to reset the review list without any persistence call.
- [ ] On successful save, clear the review list (rows now live in the saved task list, #8).

## Testing Strategy

- Manual test: extract the MVP example notes, edit a field, delete a row,
  add a manual row, confirm all changes reflect in the UI before saving.
- Manual test: click "Clear" and confirm the review list empties and no
  Supabase call was made (verify via network tab / mocked save function).
- Unit tests for the add/delete/edit reducer or state logic in isolation.

## Rollout Plan

- Can be built against a mocked/hardcoded extraction result before #4/#5
  are complete, then wired to real extraction output once available.

## Metrics & Success Criteria

- Success = all four acceptance criteria on issue #6 are met, most
  importantly that no data reaches Supabase before explicit "Save Tasks".

## Dependencies

- Depends on #1 (scaffold) for the component shell.
- Consumes output from #4/#5 (extraction) as input, though can be developed
  against mock data in parallel.
- Feeds #7 (save to Supabase) with the confirmed row list.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| A bug causes rows to be saved automatically on extraction rather than only on explicit "Save Tasks" click | High | Low | Keep the save call wired to exactly one handler (the Save Tasks button's onClick) with no side-effect-triggering `useEffect` on the row state |
| "Clear" accidentally clears saved tasks instead of just the review list, due to shared state | Medium | Low | Keep review-list state and saved-task-list state (#8) in clearly separate state containers/hooks, not a single shared array |

## Open Questions

- [ ] Should "Add Task" prefill `status` to a default (`todo`) or require the user to pick one explicitly?

## References

- [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md)
- [SPEC-004: Meeting Notes Input and Extract Action Items UI](./SPEC-004-notes-input-extract-ui.md)
- [Issue #6](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/6)
