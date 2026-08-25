# Responsive Layout Pass Specification

**Status:** Draft
**Owner:** Oamogetswe Makgopela
**Created:** 2026-08-25
**Last Updated:** 2026-08-25

Issue: [#10 - Responsive layout pass for desktop and mobile](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/10)
ADR: [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md) (Decision 1); app description UX requirements

## Overview

Verify and adjust the notes input, review list, and saved task list regions
so every core action is usable on both desktop and mobile viewport widths.
This is a hardening pass across features already built in #1, #4, #6, #8 —
not new functionality.

## Goals

- Confirm and adjust layout so all core actions work at mobile widths:
  extract, edit review rows, save, edit/status/delete saved tasks.
- Eliminate horizontal overflow at mobile widths.
- Ensure touch targets (buttons, inputs, selects) are usable on mobile.

## Non-Goals

- Visual redesign/branding beyond what's needed for responsiveness.
- New features — this issue only adjusts layout/interaction of existing
  functionality from #1, #4, #6, #8.
- Native mobile app packaging — this is a responsive web layout only.

## User Stories

### As a user on a phone, I want to paste notes, extract, review, save, and manage my tasks just as easily as on desktop, so that I'm not forced to use a laptop

**Acceptance Criteria:**
- [ ] All core actions (extract, edit review rows, save, edit/status/delete saved tasks) are usable on a mobile-width viewport.
- [ ] No horizontal overflow or unusable touch targets on mobile.

## Technical Design

### Architecture

- No new components; this is a CSS/layout pass over `NotesInput`,
  `ReviewList`, and `TaskList` (from #1, #4, #6, #8).
- Likely adjustments:
  - Row/card-based layouts (review list, task list) collapse from
    multi-column to stacked single-column at narrow widths.
  - Buttons and form controls sized for touch (adequate tap target size,
    sufficient spacing between adjacent actions like edit/delete).
  - Textarea and inputs sized to viewport width rather than fixed pixel
    widths.
- A small set of representative breakpoints should be tested rather than
  just "one mobile size and one desktop size," per the risk noted in
  SPEC-001.

### Data Model

None — layout-only change.

### API Design

None.

### UI/UX Design

- Target breakpoints (representative, not exhaustive): ~375px (small
  phone), ~768px (tablet/small laptop), ~1280px (desktop).
- Stacked layout below a chosen breakpoint (e.g. <768px): notes input,
  review list, task list each full-width, stacked vertically.
- Above that breakpoint, existing desktop layout from #1 applies.
- Ensure delete/edit controls on review and task rows remain distinguishable
  and tappable without accidental mis-taps at narrow widths.

## Implementation Plan

### Phase 1: Audit
- [ ] Manually walk through the full flow (extract → review/edit → save → manage saved tasks) at each target breakpoint, noting overflow or unusable controls.

### Phase 2: Fixes
- [ ] Apply responsive CSS fixes (flex/grid adjustments, stacking, sizing) to `NotesInput`, `ReviewList`, `TaskList`.
- [ ] Adjust touch target sizing/spacing for buttons and interactive controls.

### Phase 3: Re-verification
- [ ] Re-walk the full flow at each breakpoint to confirm no regressions and no remaining overflow/usability issues.

## Testing Strategy

- Manual test at each target breakpoint: complete the full MVP workflow
  (paste example notes, extract, edit a row, delete a row, add a row, save,
  edit a saved task, change its status, delete a saved task).
- Check for horizontal scroll/overflow at each breakpoint (should be none).
- Spot-check touch target sizing against common guidance (e.g. roughly
  44x44px minimum for primary actions), without necessarily treating this
  as a hard automated test.

## Rollout Plan

- Should be done after #1, #4, #6, #8 are functionally complete, since it's
  a hardening pass over their combined output rather than independent work.

## Metrics & Success Criteria

- Success = both acceptance criteria on issue #10 are met: full workflow
  usable at mobile width, no overflow or unusable touch targets.

## Dependencies

- Depends on #1, #4, #6, #8 being functionally complete enough to walk the
  full flow during testing.

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Fixes are validated only on one device/browser and miss issues elsewhere | Medium | Medium | Test via browser dev-tools responsive mode across the three target breakpoints at minimum; spot-check on an actual mobile device if available |
| Later feature changes (post-#10) reintroduce overflow or small touch targets | Low | Medium | Keep layout adjustments in shared/reusable styles rather than one-off fixes, so future changes inherit the responsive behavior |

## Open Questions

- [ ] Are there specific target devices/browsers to prioritize, or is "modern mobile browser, common phone widths" sufficient for MVP?

## References

- [ADR-001: Core Architecture](../adr/ADR-001-core-architecture.md)
- [SPEC-001: Scaffold Frontend App](./SPEC-001-scaffold-frontend-app.md)
- [SPEC-004: Meeting Notes Input and Extract Action Items UI](./SPEC-004-notes-input-extract-ui.md)
- [SPEC-006: Editable Action Item Review List](./SPEC-006-editable-review-list.md)
- [SPEC-008: Saved Task List UI](./SPEC-008-saved-task-list-ui.md)
- [Issue #10](https://github.com/Oamogetswe-Makgopela/meeting-action-items/issues/10)
