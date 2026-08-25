# Frontend App Scaffold Specification

**Status:** Draft
**Owner:** Oamogetswe Makgopela
**Created:** 2026-08-25
**Last Updated:** 2026-08-25

Issue: [#1 - Scaffold frontend app (notes input, review list, saved task list layout)](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/1)
ADR: [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md) (Decision 1)

## Overview

Stand up the initial React single-page app for the Meeting Action Items tool.
This scaffold establishes the main page shell with three regions — meeting
notes input, an editable AI-generated review list, and a saved task list —
as static/mock UI. No AI extraction or Supabase wiring is included; this spec
covers structure and layout only, as the foundation later issues (#2-#10)
build on.

## Goals

- Initialize a React project with a clean, conventional structure.
- Build a main page component that renders the three required regions in the
  layout described in ADR-001.
- Establish a responsive layout shell usable on both desktop and mobile.
- Establish placeholder component boundaries (`NotesInput`, `ReviewList`,
  `TaskList`) that later issues can fill in without restructuring the page.

## Non-Goals

- AI extraction logic or calls to any extraction endpoint (see #5).
- Supabase client setup, auth, or data persistence (see #2, #3, #7).
- Real editing behavior on review rows or saved tasks (see #6, #8).
- Loading states and error handling for async operations (see #9).
- Final visual design/branding — this is a structural scaffold, not a
  polished UI pass.

## User Stories

### As a developer, I want a running React project with the main page shell in place, so that I can build each feature (extraction, review, persistence) into an established layout without re-plumbing the page structure each time

**Acceptance Criteria:**
- [ ] Project builds and runs locally.
- [ ] Main page renders the three regions in the layout described in the ADR.
- [ ] Layout is responsive (usable on desktop and mobile) per UX requirements.

### As a user opening the app for the first time, I want to see the notes input, an (empty) review area, and an (empty) saved task list, so that the app's purpose and workflow are immediately clear even before any data exists

**Acceptance Criteria:**
- [ ] Notes input region is visible and usable (accepts pasted text) even though nothing downstream consumes it yet.
- [ ] Review list and saved task list regions render an empty/placeholder state rather than being blank or broken.

## Technical Design

### Architecture

- Single-page React app (per ADR-001, Decision 1), built with Vite for a
  minimal, fast local dev setup.
- One top-level `App` component composing three presentational regions,
  stacked vertically in source/DOM order to match the ADR-specified page
  layout:
  1. `NotesInput` — meeting notes textarea + meeting date field + "Extract
     Action Items" button (non-functional placeholder in this scaffold).
  2. `ReviewList` — container for editable action-item rows; renders an
     empty-state message until #5/#6 wire it up.
  3. `TaskList` — container for saved tasks; renders an empty-state message
     until #7/#8 wire it up.
- No routing library needed — the app is a single route/page per the MVP
  scope.
- No state management library needed yet; local component state is
  sufficient until extraction/save logic (later issues) requires lifting
  state to `App`.

### Data Model

None — no data is read or persisted in this scaffold. Component props are
limited to static/mock placeholders where needed for layout purposes.

### API Design

None — no network calls in this scaffold. The "Extract Action Items" button
renders but is disabled or a visual no-op until #5 exists.

### UI/UX Design

- Vertical layout on mobile: notes input on top, review list below it, saved
  task list below that.
- Wider viewports (desktop) may show notes input full-width above the fold,
  with review list and saved task list stacked or side-by-side — exact
  breakpoint behavior is left to implementation but must satisfy "usable on
  desktop and mobile" from the acceptance criteria.
- Empty states:
  - Review list: e.g. "No action items yet — paste meeting notes and click
    Extract Action Items."
  - Saved task list: e.g. "No saved tasks yet."
- No color/branding decisions are in scope here; use minimal, readable
  default styling.

## Implementation Plan

### Phase 1: Project init
- [ ] Initialize React + Vite project.
- [ ] Set up base project structure (`src/components/`, `src/App.jsx`, etc.).
- [ ] Confirm local dev server runs and hot-reloads.

### Phase 2: Page shell
- [ ] Build `NotesInput` component (textarea, meeting date field, disabled/placeholder "Extract Action Items" button).
- [ ] Build `ReviewList` component with empty state.
- [ ] Build `TaskList` component with empty state.
- [ ] Compose all three into `App` in the ADR-specified layout order.

### Phase 3: Responsiveness
- [ ] Apply responsive layout (flex/grid + breakpoints) so all three regions are usable at mobile width.
- [ ] Manually verify at common desktop and mobile viewport widths.

## Testing Strategy

- No unit/integration tests required for this structural scaffold beyond a
  basic render smoke test per component (renders without throwing).
- Manual verification: run the dev server, resize the viewport between
  desktop and mobile widths, confirm all three regions remain visible and
  usable with no horizontal overflow.
- E2E and performance testing are out of scope until functional behavior
  exists (later issues).

## Rollout Plan

- Resolved 2026-08-25: deploy to Vercel — it serves the Vite static build
  and the `api/extract.js` serverless function (see SPEC-005) from one
  project/deploy, so no separate hosting decision is needed for the
  frontend. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and
  `ANTHROPIC_API_KEY` need to be set as Vercel project environment
  variables before deploying.

## Metrics & Success Criteria

- Success = the three acceptance criteria on issue #1 are met: project runs
  locally, the ADR-specified three-region layout renders, and the layout is
  usable on both desktop and mobile.

## Dependencies

- None from other issues — this is the first implementation issue and other
  feature issues (#2-#10) depend on it, not the other way around.
- Requires deciding/confirming the build tool (Vite) and package manager
  before starting.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Component boundaries chosen here don't fit the state/data needs of later issues (e.g. #6, #7) | Medium | Low | Keep components presentational and prop-driven; avoid premature internal state that later issues would need to rip out |
| Responsive layout works on the two viewport sizes tested but breaks at other common widths | Low | Medium | Test at a small set of representative breakpoints (e.g. ~375px, ~768px, ~1280px) rather than just one mobile and one desktop size |

## Open Questions

- [ ] Confirm build tooling: Vite (assumed) vs. an alternative, if the team has a preference.
- [ ] Confirm whether "Extract Action Items" should be rendered disabled or simply non-functional (visually enabled but a no-op) in this scaffold.

## References

- [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md)
- [Issue #1](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/1)
