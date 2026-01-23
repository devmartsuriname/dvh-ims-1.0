# RESTORE POINT: v1.1-F Phase P2 START

**Created:** 2026-01-23
**Phase:** v1.1-F — Admin Theme Regression Fix
**Sub-Phase:** P2 — Demo Notification Cleanup

---

## Purpose

Marks the beginning of Phase P2: Removing hardcoded demo notification data from the admin topbar.

## Current State

- 5 hardcoded demo notifications in `topbar.ts` (Sally Bieber, Gloria Chambers, etc.)
- Hardcoded "5" badge on bell icon
- Hardcoded "Notifications (5)" header

## Scope

- Clear demo notification data from `topbar.ts`
- Add conditional badge rendering (hide when empty)
- Add dynamic count in header
- Add empty state message
- Do NOT implement a notification system (OUT OF SCOPE)

## Files To Be Modified

- `src/assets/data/topbar.ts`
- `src/components/layout/TopNavigationBar/components/Notifications.tsx`

## Rollback Procedure

If issues arise:
1. Restore original demo data to `topbar.ts`
2. Restore original badge and header rendering in `Notifications.tsx`
3. Return to state before this restore point

## Governance Constraints

- Cleanup only, no notification system implementation
- Darkone component patterns only
- No new UI components
- No Tailwind or custom CSS
