# Loading States and Error Handling Specification

**Status:** Draft
**Owner:** Oamogetswe Makgopela
**Created:** 2026-08-25
**Last Updated:** 2026-08-25

Issue: [#9 - Add loading states and error handling for extraction and Supabase operations](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/9)
ADR: [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md) (Consequences — Negative); app description UX requirements

## Overview

Consolidate and complete loading and error-handling UX across the app: AI
extraction (#4/#5) and all Supabase read/write operations (#7/#8), so that
failures always produce a specific, actionable message rather than a
generic or silent failure.

## Goals

- Ensure a consistent loading indicator is shown during AI extraction
  (building on #4's basic loading state).
- Provide specific, actionable error messages for extraction failures,
  including schema-validation failures from #5.
- Provide specific, actionable error messages for Supabase failures: save
  (#7), fetch/edit/status-change/delete (#8).

## Non-Goals

- Building new features — this issue hardens error/loading UX on top of
  functionality already built in #4, #5, #7, #8.
- Retry/backoff logic — out of scope for MVP unless trivial.
- Global error logging/monitoring infrastructure — not specified in the app
  description.

## User Stories

### As a user, when AI extraction fails, I want to know specifically what went wrong, so that I know whether to retry, rephrase my notes, or report a bug

**Acceptance Criteria:**
- [ ] Extraction errors (network, model, schema validation) show a specific, actionable message rather than a generic failure.

### As a user, when saving or editing tasks fails, I want a clear message, so that I know my data wasn't silently lost

**Acceptance Criteria:**
- [ ] Supabase read/write errors (save, edit, delete, fetch) show a specific, actionable message.

## Technical Design

### Architecture

- Define a small set of user-facing error categories mapped from
  underlying failures, e.g.:
  - Extraction: `network_error`, `model_error`, `schema_validation_error`
    (from #5's error response).
  - Supabase: `fetch_error`, `save_error`, `update_error`, `delete_error`.
- A shared error-display mechanism (e.g. a simple toast/banner component or
  inline message area per region) that #4, #6, #7, #8 all call into rather
  than each inventing its own error UI ad hoc.
- Loading state pattern (already established for extraction in #4) applied
  consistently: disable the triggering control and show a visible
  indicator for the duration of any async Supabase operation in #8 (edit,
  status change, delete) as well, not just extraction.

### Data Model

None directly. Consumes error shapes already defined:
- From #5: `{ error: "extraction_failed", message: "..." }`.
- From Supabase client calls: the client's error object (`{ message,
  details, hint, code }`), mapped to a user-facing message rather than
  displayed raw.

### API Design

No new endpoints. This issue defines how existing endpoint/Supabase error
responses are surfaced in the UI.

### UI/UX Design

- Error messages are specific enough to act on, e.g. "Couldn't extract
  action items — the AI response was invalid. Try again." rather than just
  "Error."
- Errors do not block the rest of the UI (e.g. a failed task edit shows an
  inline error on that row, not a full-page failure).
- Loading indicators are visually consistent across extraction and
  Supabase operations (same spinner/pattern reused).

## Implementation Plan

### Phase 1: Shared error display
- [ ] Build a small reusable error-message component/pattern (inline or toast).
- [ ] Define the mapping from known error categories to user-facing messages.

### Phase 2: Wire into extraction
- [ ] Replace #4's minimal error state with the shared pattern, distinguishing network vs. schema-validation failures where the endpoint (#5) provides that detail.

### Phase 3: Wire into Supabase operations
- [ ] Apply the shared pattern to #7's save failures.
- [ ] Apply the shared pattern to #8's fetch/edit/status/delete failures, plus loading indicators for those operations.

## Testing Strategy

- Manual test: simulate an extraction failure (e.g. malformed response) and
  confirm a specific message appears, not a generic one.
- Manual test: simulate a Supabase failure (e.g. temporarily revoke access
  or disconnect) for save, edit, and delete, confirming each shows a
  specific message.
- Manual test: confirm loading indicators appear and clear correctly for
  extraction and for each Supabase operation in the task list.

## Rollout Plan

- Applied as a pass across already-built features (#4, #5, #7, #8); should
  land after those are functionally complete, or in close coordination with
  them.

## Metrics & Success Criteria

- Success = both acceptance criteria on issue #9 are met across all
  extraction and Supabase operations, not just the save flow.

## Dependencies

- Depends on #4, #5 (extraction) and #7, #8 (Supabase operations) already
  existing in at least a basic functional form to hardn.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Error handling is added inconsistently per-feature since #4/#7/#8 were built independently | Medium | Medium | Build the shared error-display pattern first (Phase 1) and retrofit each feature to use it, rather than letting each keep its own ad hoc error UI |
| Raw Supabase/model error details (potentially technical or sensitive) are shown directly to users | Low | Medium | Always map underlying errors to a small set of predefined user-facing messages rather than displaying `error.message` directly |

## Open Questions

- [ ] Should errors use a toast/banner pattern (global) or inline-per-region messages? (Recommend inline per region for clarity on which action failed.)

## References

- [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md)
- [SPEC-004: Meeting Notes Input and Extract Action Items UI](./SPEC-004-notes-input-extract-ui.md)
- [SPEC-005: AI Extraction Endpoint](./SPEC-005-ai-extraction-endpoint.md)
- [SPEC-007: Save Tasks to Supabase](./SPEC-007-save-tasks-to-supabase.md)
- [SPEC-008: Saved Task List UI](./SPEC-008-saved-task-list-ui.md)
- [Issue #9](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/9)
