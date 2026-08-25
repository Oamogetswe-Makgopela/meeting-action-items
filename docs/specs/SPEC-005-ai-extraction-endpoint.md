# AI Extraction Endpoint Specification

**Status:** Draft
**Owner:** Oamogetswe Makgopela
**Created:** 2026-08-25
**Last Updated:** 2026-08-25

Issue: [#5 - Build AI extraction endpoint with structured JSON output and validation](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/5)
ADR: [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md) (Decision 2)

## Overview

Build the server-side endpoint that takes raw meeting notes and a meeting
date, calls an LLM to extract action items, and returns validated
structured JSON matching the `action_items` schema. This endpoint exists
server-side specifically to keep the model API key off the client, per
ADR-001.

## Goals

- Accept meeting notes text and a meeting date.
- Prompt the model to extract explicit/strongly-implied action items only,
  never inventing an owner or due date.
- Resolve relative dates ("next Friday", "in two weeks") to absolute dates
  anchored to the supplied meeting date.
- Force the model's response into the `action_items` JSON schema via
  structured output / JSON mode.
- Validate the returned JSON against the schema server-side before
  returning it to the client; surface a clear error on invalid/malformed
  output.

## Non-Goals

- Any client-side UI (see #4 for the calling UI, #6 for the review list).
- Persistence of results — this endpoint returns data for client-side
  review only; saving is #7.
- Support for input formats other than plain text notes (e.g. audio
  transcription) — out of scope for MVP.

## User Stories

### As a user, I want the extracted tasks to only include people/dates that were actually stated or clearly implied, so that I don't have to fact-check hallucinated assignments

**Acceptance Criteria:**
- [ ] Missing owner/due date are left empty, never guessed.

### As a user, I want relative dates like "next Friday" converted into a real calendar date, so that I don't have to do that math myself

**Acceptance Criteria:**
- [ ] Relative dates ("next Friday", "in two weeks") resolve to absolute dates based on the supplied meeting date.

### As a user, I want to get a clear error if extraction fails, rather than a broken or nonsensical result

**Acceptance Criteria:**
- [ ] Invalid/malformed model output surfaces as a handled error, not a crash or passthrough.

### As a developer verifying correctness, I want the MVP example notes to produce the documented expected output

**Acceptance Criteria:**
- [ ] Given the MVP example notes, output matches the expected action items (owner/date attribution correct, no invented fields).

## Technical Design

### Architecture

- A server-side endpoint (e.g. `POST /api/extract`) that:
  1. Accepts `{ notes: string, meeting_date: string }`.
  2. Builds a prompt instructing the model to:
     - Extract explicit and strongly implied action items only.
     - Extract owner only when mentioned; leave empty otherwise.
     - Extract/resolve due dates only when explicit or unambiguously
       inferable; resolve relative dates against `meeting_date`; leave
       empty otherwise.
     - Preserve enough context in `description` to make the task
       understandable standalone.
  3. Calls the model using structured output / JSON mode constrained to the
     `action_items` schema (see ADR-001 example).
  4. Validates the raw model response against the schema server-side
     (required fields present, correct types, `due_date` is a valid ISO
     date or empty, etc.).
  5. Returns `{ action_items: [...] }` on success, or a structured error
     response on validation failure.
- The model API key is held server-side only (env var), never sent to or
  read by the client — this is the reason this step is server-side per
  ADR-001.

### Data Model

No database involved. Contract:

Request:
```json
{ "notes": "string", "meeting_date": "YYYY-MM-DD" }
```

Success response:
```json
{
  "action_items": [
    {
      "title": "Send revised pricing proposal to Acme",
      "description": "Update the proposal with the pricing discussed in the meeting.",
      "owner": "Sarah",
      "due_date": "2026-09-01",
      "status": "todo"
    }
  ]
}
```

Error response (illustrative):
```json
{ "error": "extraction_failed", "message": "Model response did not match the expected schema." }
```

### API Design

- `POST /api/extract`
  - Body: `{ notes: string, meeting_date: string }`
  - 200: `{ action_items: [...] }`
  - 400: invalid request (e.g. missing/empty `notes`)
  - 502/500: model call failed or returned output that failed schema
    validation, with a message safe to surface to the user (no raw model
    internals or stack traces)

### UI/UX Design

None — this is a backend endpoint. Consumed by #4's UI.

## Implementation Plan

### Phase 1: Endpoint + prompt
- [ ] Build the endpoint accepting notes + meeting_date.
- [ ] Write the extraction prompt encoding all extraction rules from ADR-001 / app description.
- [ ] Configure structured output / JSON mode against the `action_items` schema.

### Phase 2: Validation
- [ ] Validate the model's JSON response against the schema (required fields, types, date format).
- [ ] Return a clear, safe error response on validation failure.

### Phase 3: Verification against MVP example
- [ ] Run the documented MVP example notes through the endpoint and confirm output matches the expected tasks (Sarah/John/Friday, Mike/demo/next week with no date if ambiguous, Priya/onboarding doc/no due date).

## Testing Strategy

- Unit tests for the schema validator (valid payload passes; missing field,
  wrong type, and malformed date each fail as expected).
- Integration test running the MVP example notes through the real (or
  recorded/mocked) model call and asserting on the resulting action items.
- Manual test of the "no owner/date invented" rule using notes that
  deliberately omit an owner or date for one item.
- Manual test of relative date resolution using a couple of different
  phrasings ("next Friday", "in two weeks") against a fixed meeting date.

## Rollout Plan

- Ships independently of the frontend calling it; can be tested via direct
  HTTP requests (e.g. curl/Postman) before #4 integrates it.

## Metrics & Success Criteria

- Success = all four acceptance criteria on issue #5 are met, including the
  MVP example producing the documented expected output.

## Dependencies

- None from other issues to start (can be built standalone and tested via
  direct requests).
- #4 depends on this endpoint's contract to integrate the UI.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Model occasionally invents a plausible-sounding owner or date despite instructions | High | Medium | Reinforce the rule in the prompt with explicit negative examples; validate that omitted fields are truly empty rather than trusting instructions alone; consider a post-processing check that owner/due_date only appear if traceable to notes text (stretch) |
| Ambiguous relative dates ("next week" with no specific day) resolved inconsistently | Medium | Medium | Per the app description's own example, "next week" with no specific day should be left as no due date rather than guessed — encode this explicitly in the prompt and test for it |
| Model API downtime or rate limiting causes extraction failures | Medium | Low | Return a clear, user-facing error (per #9) rather than a raw failure; no retry/backoff logic required for MVP |

## Open Questions

- [ ] Which model/provider is used for extraction, and does it support native JSON-mode/structured output, or does the endpoint need to enforce the schema itself post-hoc?
- [ ] Should the endpoint be rate-limited per user to control cost, or is that out of scope for MVP?

## References

- [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md)
- [SPEC-004: Meeting Notes Input and Extract Action Items UI](./SPEC-004-notes-input-extract-ui.md)
- [Issue #5](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/5)
