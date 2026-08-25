# Supabase Auth and Row Level Security Specification

**Status:** Draft
**Owner:** Oamogetswe Makgopela
**Created:** 2026-08-25
**Last Updated:** 2026-08-25

Issue: [#3 - Implement Supabase Auth and Row Level Security for per-user task isolation](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/3)
ADR: [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md) (Decision 5)

## Overview

Add authentication (sign-up/sign-in via Supabase Auth) and enforce per-user
task isolation at the database layer using Row Level Security on the
`tasks` table. This makes isolation a guarantee of the database rather than
an application-code convention, per ADR-001.

## Goals

- Enable users to sign up and sign in via Supabase Auth.
- Enable RLS on the `tasks` table.
- Add RLS policies so a user can only select/insert/update/delete their own
  rows (`user_id = auth.uid()`).
- Verify isolation holds with two distinct test accounts.

## Non-Goals

- Password reset, email verification flows, or social login providers —
  basic email/password auth is sufficient for MVP unless otherwise decided.
- Any task-list or review-list UI (see #6, #8) — this issue covers the auth
  screens and the database policies only.
- Team/shared-task access — out of scope per ADR-001 Notes (flagged as a
  future revisit).

## User Stories

### As a user, I want to sign up and log in, so that my tasks are private to me

**Acceptance Criteria:**
- [ ] Unauthenticated users cannot read or write tasks.
- [ ] RLS policies are in place for select, insert, update, delete.

### As a user, I want to be certain another user can never see or modify my tasks, so that I can trust the app with real meeting content

**Acceptance Criteria:**
- [ ] A logged-in user can only see/edit/delete their own tasks (verified with two test accounts).

## Technical Design

### Architecture

- Supabase Auth (email/password) handles sign-up/sign-in and session
  management; the Supabase client SDK on the frontend manages the session
  token.
- The `tasks` table (from #2) gets RLS enabled with four policies (select,
  insert, update, delete), each scoped to `user_id = auth.uid()`.
- On insert, the client (or a default column value) must set `user_id` to
  the authenticated user's id — enforced by the insert policy's `with
  check` clause so a client cannot insert rows on another user's behalf.

### Data Model

No schema changes beyond what #2 already defines; `user_id` (already part
of the `tasks` schema) is the column RLS policies key off.

Example policy shape (illustrative, not final SQL):
- `select`: `USING (user_id = auth.uid())`
- `insert`: `WITH CHECK (user_id = auth.uid())`
- `update`: `USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())`
- `delete`: `USING (user_id = auth.uid())`

### API Design

- Supabase Auth endpoints (sign up, sign in, sign out, get session) via the
  Supabase JS client — no custom backend auth endpoints needed.

### UI/UX Design

- Minimal sign-up/sign-in screen (email + password fields, submit button,
  toggle between sign-up and sign-in, error display).
- App main content (notes input, review list, task list) is only reachable
  once authenticated; unauthenticated visitors see the auth screen.

## Implementation Plan

### Phase 1: Auth UI
- [ ] Build sign-up/sign-in form using Supabase Auth client methods.
- [ ] Gate the main app content behind an authenticated-session check.
- [ ] Add sign-out.

### Phase 2: RLS policies
- [ ] Enable RLS on `tasks`.
- [ ] Add select/insert/update/delete policies scoped to `auth.uid()`.

### Phase 3: Verification
- [ ] Create two test accounts; confirm each only sees/can modify its own rows.
- [ ] Confirm unauthenticated requests (e.g. via anon key without a session) are rejected for read and write.

## Testing Strategy

- Manual cross-account verification: sign in as user A, create a task; sign
  in as user B, confirm user A's task is not visible and cannot be
  fetched/updated/deleted by id.
- Manual verification that an unauthenticated client cannot read or write
  `tasks`.
- Automated integration tests (if a test harness exists) covering the same
  scenarios are a stretch goal, not required for MVP.

## Rollout Plan

- Ships alongside #2 (schema must exist first) and before #7/#8 (which
  depend on an authenticated session and RLS being in place to be
  meaningful).

## Metrics & Success Criteria

- Success = all three acceptance criteria on issue #3 are met, confirmed
  with the two-account manual test.

## Dependencies

- Depends on #2 (tasks table with `user_id` column must exist first).
- Blocks #7 and #8 from being meaningfully tested for isolation.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| RLS policy misconfigured (e.g. missing `WITH CHECK` on insert/update) allows cross-user writes | High | Low | Explicitly test insert/update with a mismatched `user_id` payload and confirm rejection, not just default-flow testing |
| Forgetting to enable RLS at all (table stays open) | High | Low | Verify via Supabase dashboard that RLS is "Enabled" on `tasks`, not just that policies exist |

## Open Questions

- [ ] Is email/password sufficient for MVP, or is a specific provider (Google, etc.) required?
- [ ] Should sign-up require email confirmation before use, or is that unnecessary friction for MVP/training purposes?

## References

- [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md)
- [SPEC-002: Supabase Project and Tasks Table Schema](./SPEC-002-supabase-project-tasks-table.md)
- [Issue #3](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/3)
