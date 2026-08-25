# Supabase Project and Tasks Table Schema Specification

**Status:** Draft
**Owner:** Oamogetswe Makgopela
**Created:** 2026-08-25
**Last Updated:** 2026-08-25

Issue: [#2 - Provision Supabase project and tasks table schema](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/2)
ADR: [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md) (Decision 4)

## Overview

Provision the Supabase project that will act as the app's system of record
and create the `tasks` table with the columns needed to store extracted and
manually-added action items. This is a pure data-layer setup issue: no auth
policies (see #3), no client wiring, no UI.

## Goals

- Stand up a Supabase project for the app (dev environment).
- Create a `tasks` table with the full column set required by the app
  description and ADR-001: `id`, `title`, `description`, `owner`,
  `due_date`, `status`, `source_notes`, `created_at`, `updated_at`, plus
  `user_id` for the per-user isolation that #3 will enforce.
- Ensure `id` is a UUID primary key, and timestamps are populated
  automatically.

## Non-Goals

- Row Level Security policies and Supabase Auth setup (see #3).
- Any application code that reads/writes the table (see #7, #8).
- Production environment provisioning — this spec covers the dev/project
  Supabase instance only.

## User Stories

### As a developer, I want a `tasks` table with the correct schema already in place, so that later issues (auth/RLS, save, task list) can be built against a stable data model without renegotiating columns

**Acceptance Criteria:**
- [ ] `tasks` table exists with all required columns and correct types.
- [ ] `id` uses UUID as primary key.
- [ ] `created_at` / `updated_at` are populated automatically.

## Technical Design

### Architecture

- One Supabase project (Postgres + Auth + Storage, though only Postgres/Auth
  are used by this app) provisioned via the Supabase dashboard or CLI.
- Environment credentials (project URL, anon key) captured for later use by
  the frontend and extraction endpoint (issues #4, #5, #7, #8) — stored as
  environment variables, not committed to the repo.

### Data Model

`tasks` table:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `user_id` | `uuid` | Foreign key to `auth.users.id`; enforced by RLS in #3 |
| `title` | `text` | Required |
| `description` | `text` | Nullable |
| `owner` | `text` | Nullable — left empty when no owner is identifiable per ADR-001 extraction rules |
| `due_date` | `date` | Nullable — left empty when no due date is identifiable |
| `status` | `text` | e.g. `todo`, `in_progress`, `done`; consider a `check` constraint or enum |
| `source_notes` | `text` | Raw meeting notes text the task was extracted from (or null for manually-added tasks) |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()`, updated via trigger on row update |

### API Design

None — this issue is schema-only. The Supabase client/API surface is
consumed starting in #7 (save) and #8 (task list).

### UI/UX Design

None — no UI in this issue.

## Implementation Plan

### Phase 1: Project provisioning
- [ ] Create the Supabase project (or confirm one already exists for this app).
- [ ] Record project URL and anon/public key as environment variables for later issues.

### Phase 2: Schema
- [ ] Create the `tasks` table with the columns above.
- [ ] Add a `status` check constraint (e.g. limited to `todo`, `in_progress`, `done`) or confirm free-text is acceptable for MVP.
- [ ] Add an `updated_at` trigger to auto-update on row modification.

### Phase 3: Verification
- [ ] Manually insert/select/update/delete a test row via the Supabase SQL editor to confirm schema correctness.

## Testing Strategy

- Manual verification via Supabase SQL editor: insert a row with all fields
  populated and one with only required fields (owner/due_date/description
  null) to confirm nullability is correct.
- No automated tests required for schema-only setup; automated coverage
  begins once application code reads/writes the table (#7, #8).

## Rollout Plan

- Dev-only Supabase project for now. Production project creation and
  migration strategy (e.g. Supabase CLI migrations vs. dashboard changes) is
  an open question below, to be settled before the app ships beyond MVP.

## Metrics & Success Criteria

- Success = the three acceptance criteria on issue #2 are met, and #3, #7,
  #8 can build against this schema without needing column changes.

## Dependencies

- None — this can be done independently of #1 (frontend scaffold), though
  it should land before #7/#8 need a real table to write to.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| `status` values drift/typo across the app (e.g. "Done" vs "done") since it's free text | Medium | Medium | Add a check constraint or Postgres enum limiting allowed values |
| Schema needs a breaking change after #7/#8 are built against it | Medium | Low | Confirm the full column list against the app description and ADR-001 before starting implementation (already done in this spec) |

## Open Questions

- [ ] Should `status` be a Postgres enum/check constraint or plain text for MVP simplicity?
- [ ] Do we need a migrations workflow (e.g. Supabase CLI + SQL migration files checked into the repo) now, or is dashboard-driven schema acceptable for MVP?

## References

- [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md)
- [Issue #2](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/2)
