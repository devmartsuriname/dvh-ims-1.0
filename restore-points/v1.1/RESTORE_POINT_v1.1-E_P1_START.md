# RESTORE POINT: v1.1-E Phase P1 START

**Created:** 2026-01-23
**Phase:** v1.1-E — Public Frontend UI Polish & Design Uniformity
**Sub-Phase:** P1 — Light Theme SCSS Fix

---

## Purpose

Marks the beginning of Phase P1: Adding explicit light theme CSS variables to fix contrast/readability issues on public pages.

## Scope

- Add `[data-bs-theme="light"]` block to `_theme-mode.scss`
- Define explicit light-mode values for headings, secondary color, body color
- All changes scoped exclusively to light theme selector

## Files To Be Modified

- `src/assets/scss/config/_theme-mode.scss`

## Rollback Procedure

If issues arise:
1. Revert `_theme-mode.scss` to state before this restore point
2. Verify Admin dark theme unaffected
3. Verify public pages return to previous state

## Governance Constraints

- Light Theme ONLY for public pages
- Admin dark theme MUST remain unchanged
- No shared tokens may regress admin UI
- Darkone SCSS patterns only
