# RESTORE POINT: v1.1-F Phase P1 START

**Created:** 2026-01-23
**Phase:** v1.1-F — Admin Theme Regression Fix
**Sub-Phase:** P1 — GridJS Dark Theme Pagination Fix

---

## Purpose

Marks the beginning of Phase P1: Fixing the white ellipsis pagination button in GridJS tables during dark mode.

## Root Cause

The GridJS pagination ellipsis button is a `:disabled` button. In dark mode, the `:disabled` state uses `var(--bs-tertiary-bg)` which resolves to a light color, causing a white background.

## Scope

- Add explicit dark-theme styling for disabled pagination buttons
- Changes scoped to `[data-bs-theme="dark"]` selector only
- Light theme must remain unchanged

## Files To Be Modified

- `src/assets/scss/plugins/_gridjs.scss`

## Affected Modules

- Persons
- Households
- Subsidy Cases
- Housing Registrations
- Waiting List
- District Quotas
- Allocation Runs
- Decisions
- Assignments

## Rollback Procedure

If issues arise:
1. Remove the added dark-theme pagination styling from `_gridjs.scss`
2. Verify light theme pagination unchanged
3. Return to state before this restore point

## Governance Constraints

- Darkone SCSS patterns only
- No new UI components
- No Tailwind or custom CSS
- Admin dark theme fix only
- Public pages unaffected
