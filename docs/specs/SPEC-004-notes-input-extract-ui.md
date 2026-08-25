# Meeting Notes Input and Extract Action Items UI Specification

**Status:** Draft
**Owner:** Oamogetswe Makgopela
**Created:** 2026-08-25
**Last Updated:** 2026-08-25

Issue: [#4 - Build meeting notes input and Extract Action Items UI](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/4)
ADR: [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md) (Decision 1); app description Core Workflow

## Overview

Build the functional notes-input region of the app: a large text area for
pasting raw meeting notes, a meeting date field used to anchor relative date
resolution, and an "Extract Action Items" button that triggers extraction
and shows a loading state while it runs. This issue wires the UI and the
call to the extraction endpoint (#5); it does not build the extraction
endpoint itself.

## Goals

- Provide a large, comfortable text input for pasting raw meeting notes.
- Provide a meeting date field, defaulting to today, that the user can
  override.
- Provide an "Extract Action Items" button that calls the extraction
  endpoint (#5) with the notes and meeting date.
- Show a loading indicator while extraction is in flight.
- Hand extraction results off to the review list (#6) once returned.

## Non-Goals

- The extraction endpoint's internal logic/prompting (see #5).
- Editing of extracted results (see #6).
- Detailed error-state design beyond a basic "extraction failed" signal —
  full error-message UX is covered by #9.

## User Stories

### As a user, I want to paste raw meeting notes and specify (or accept the default) meeting date, so that the AI can correctly resolve relative dates like "next Friday"

**Acceptance Criteria:**
- [ ] User can paste notes and optionally set/override the meeting date.

### As a user, I want clear feedback that extraction is running, so that I don't wonder whether my click registered

**Acceptance Criteria:**
- [ ] Clicking "Extract Action Items" shows a loading indicator until results (or an error) return.

## Technical Design

### Architecture

- `NotesInput` component (scaffolded structurally in #1) becomes functional:
  - Controlled `<textarea>` for notes text.
  - Controlled date input for meeting date, defaulting to today's date on
    mount.
  - "Extract Action Items" button, disabled while notes are empty or while
    a request is in flight.
- On click, the component calls the extraction endpoint (#5) with
  `{ notes, meeting_date }` and tracks a simple `idle | loading | error`
  state locally (or lifted to `App` if `ReviewList` needs the result — see
  #6 for how results are consumed).
- On success, extraction results are passed up/out to whatever holds review
  list state (per #6's design) for the user to edit.
- On failure, a minimal inline error state is shown (full error UX detail
  in #9); the button returns to its idle, clickable state.

### Data Model

No schema involved. Request/response shape matches the `action_items` JSON
contract defined in ADR-001 / #5:

```json
{
  "notes": "raw meeting notes text",
  "meeting_date": "2026-08-25"
}
```

Response (on success, from #5):
```json
{
  "action_items": [
    { "title": "...", "description": "...", "owner": "...", "due_date": "...", "status": "todo" }
  ]
}
```

### API Design

- Calls the server-side extraction endpoint built in #5 (e.g.
  `POST /api/extract`) — exact route/contract owned by #5; this issue
  consumes it.

### UI/UX Design

- Meeting date field defaults to today but is editable, since the meeting
  may not have happened "today" from the app's perspective.
- Button is disabled when the notes textarea is empty, to avoid pointless
  extraction calls.
- Loading state: button shows a spinner/"Extracting..." label and is
  disabled for the duration of the request, per the acceptance criteria.

## Implementation Plan

### Phase 1: Static-to-functional notes input
- [ ] Wire the textarea and date field to component state (building on #1's static shell).
- [ ] Default meeting date to today; allow override.

### Phase 2: Extraction call
- [ ] Wire "Extract Action Items" to call the endpoint from #5 with notes + meeting date.
- [ ] Disable the button while notes are empty or a request is in flight.

### Phase 3: Loading/result handoff
- [ ] Show a loading indicator during the request.
- [ ] On success, hand results to the review list (#6).
- [ ] On failure, show a minimal error indicator (detailed UX deferred to #9).

## Testing Strategy

- Manual test: paste the MVP example notes, confirm the date defaults to
  today, override the date, click extract, confirm loading state appears
  and clears when the (mocked or real, depending on sequencing with #5)
  response returns.
- Unit test the button's disabled logic (empty notes, in-flight request).

## Rollout Plan

- Can be developed in parallel with #5 against a mocked response shape,
  then integrated once #5's real endpoint exists.

## Metrics & Success Criteria

- Success = both acceptance criteria on issue #4 are met: notes + date
  input works, and the loading indicator behaves correctly around the
  extraction call.

## Dependencies

- Depends on #1 (frontend scaffold) for the component shell to build on.
- Depends on #5 (extraction endpoint) to be fully functional end-to-end,
  though can be built against a mock/stub in parallel.
- Feeds #6 (review list) with extraction results.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Built against an assumed response shape that doesn't match #5's final contract | Medium | Medium | Align on the `action_items` JSON contract (already defined in ADR-001) before building; adjust quickly if #5 deviates |
| User submits extremely long notes causing a slow/hanging request with no feedback | Low | Medium | Loading state (in scope here) covers the "no feedback" risk; a request timeout is a stretch item, not required for MVP |

## Open Questions

- [ ] Should there be a client-side character/length limit on notes input, or is that unnecessary for MVP?

## References

- [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md)
- [SPEC-001: Scaffold Frontend App](./SPEC-001-scaffold-frontend-app.md)
- [Issue #4](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/4)
