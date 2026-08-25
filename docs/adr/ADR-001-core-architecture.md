# ADR-001: Core Architecture for the Meeting Action Items App

**Status:** Proposed
**Date:** 2026-08-25
**Deciders:** Oamogetswe Makgopela
**Technical Story:** MVP build of the "meeting notes to action items" app

## Context

We need to build a web app where a user pastes raw meeting notes, an AI extracts
structured action items (title, description, owner, due date, status) as JSON,
the user reviews/edits those items before committing them, and confirmed tasks
are persisted per-user in a database with a saved task list the user can manage
afterward.

This requires decisions on:

- How the frontend is built and how it talks to an AI extraction step.
- What produces the structured JSON from unstructured notes, and how "do not
  invent owner/due date" and relative-date resolution ("next Friday" → an
  absolute date anchored to the meeting date) are enforced.
- Where task data is persisted, how it's modeled, and how per-user isolation
  and authentication are enforced.
- How review/edit-before-save is kept as an explicit, non-bypassable step in
  the flow, since the AI output must never be silently saved.

## Decision

We will build the MVP as follows:

1. **Frontend:** A single-page web app (React) with three regions on one main
   page: meeting notes input, an editable AI-generated action item review
   list, and a saved task list. All three are client-rendered from a single
   page component tree to keep the MVP simple and fast to ship.

2. **AI extraction:** A server-side extraction endpoint calls an LLM with a
   prompt that (a) passes the meeting notes and the meeting date, (b)
   instructs the model to only extract explicit or strongly implied action
   items, (c) forbids inventing an owner or due date, (d) instructs relative
   dates to be resolved to absolute dates against the supplied meeting date,
   and (e) forces the response into the `action_items` JSON schema via
   structured output / JSON mode (not free-form text parsing). The endpoint
   validates the returned JSON against the schema before returning it to the
   client; malformed responses are surfaced as extraction errors rather than
   passed through.

3. **Review-before-save:** Extraction results are held in client-side state
   only. The user can edit, delete, or add rows. Nothing is written to the
   database until the user explicitly clicks "Save Tasks." "Clear" discards
   the in-progress review list without touching saved data.

4. **Persistence:** Supabase (Postgres) is the system of record. A `tasks`
   table stores `id (uuid)`, `title`, `description`, `owner`, `due_date`,
   `status`, `source_notes`, `created_at`, `updated_at`, plus a `user_id`
   column tying each row to its owner.

5. **Auth & isolation:** Supabase Auth handles sign-in/sign-up. Row Level
   Security policies on `tasks` restrict all reads/writes to rows where
   `user_id = auth.uid()`, so isolation is enforced at the database layer
   rather than only in application code.

6. **Client-Supabase interaction:** The frontend uses the Supabase client
   directly (with RLS as the security boundary) for saving, listing, editing,
   and deleting tasks, avoiding a separate CRUD backend for the MVP. The AI
   extraction step is the one operation that requires a server-side call,
   since it needs a model API key that must not be exposed to the browser.

## Consequences

### Positive

- RLS makes per-user isolation a database-enforced guarantee instead of an
  application-level convention, reducing the risk of a code bug leaking one
  user's tasks to another.
- Structured/JSON-mode output plus schema validation removes the need for
  brittle free-text parsing of AI responses.
- Keeping extraction results client-side until explicit save gives a clean,
  simple implementation of "never auto-save AI output."
- Using the Supabase client directly for task CRUD avoids building and
  maintaining a separate backend for the MVP.

### Negative

- A server-side extraction endpoint is still required solely to protect the
  AI provider's API key, so the app isn't purely static despite most CRUD
  going straight to Supabase.
- Coupling to Supabase for both auth and data means migrating off Supabase
  later touches both the auth flow and the data layer, not just one.
- Schema validation of AI output adds a failure mode (valid JSON that fails
  schema checks) that must be surfaced to the user as an extraction error.

### Neutral

- The meeting date used to resolve relative dates must be captured
  explicitly (e.g., defaulting to "today" with the option to override),
  since the app has no other source of truth for when the meeting happened.

## Options Considered

### Option 1: LLM structured/JSON-mode output validated server-side (chosen)
- **Pros:** Reliable parsing, enforces the "don't invent owner/date" and
  date-anchoring rules directly in the prompt/schema, single request per
  extraction.
- **Cons:** Still probabilistic; requires schema validation and error
  handling for malformed or rule-violating output.

### Option 2: Free-form LLM text output parsed with regex/heuristics
- **Pros:** No dependency on a model's structured-output feature.
- **Cons:** Fragile parsing, higher risk of silently dropping or
  misattributing fields; harder to guarantee "no invented owner/date."

### Option 3: Rule-based NLP extraction (no LLM)
- **Pros:** Deterministic, no external API dependency or cost per request.
- **Cons:** Cannot reliably handle "strongly implied" action items or
  natural-language relative date resolution to the standard the MVP
  requires; would need significant custom NLP work for modest coverage.

### Option 4: Custom backend + Postgres + own auth, instead of Supabase
- **Pros:** Full control over schema, auth flow, and hosting; no vendor
  lock-in to Supabase specifically.
- **Cons:** Significantly more implementation and operational work (auth,
  session management, RLS-equivalent authorization logic, hosting) for no
  MVP-stage benefit; slower to ship.

### Option 5: Separate CRUD backend in front of Supabase, instead of client-direct access
- **Pros:** Centralizes business logic, easier to add server-side validation
  or rate limiting later.
- **Cons:** Extra service to build/host/maintain for the MVP when RLS already
  provides the required isolation guarantee directly against the database.

## Related Decisions

- None yet; this is the first ADR for the project.

## Notes

- The extraction endpoint needs the meeting date (explicit or defaulted to
  "today") as an input alongside the notes text, since relative-date
  resolution is anchored to it, not to the request timestamp.
- `source_notes` is retained on each task to preserve traceability back to
  the meeting notes that generated it, per the app description's persistence
  requirements.
- If the app later needs multi-user shared tasks (e.g., a team viewing each
  other's tasks), the RLS policy and `tasks` schema will need revisiting —
  out of scope for this MVP ADR.
