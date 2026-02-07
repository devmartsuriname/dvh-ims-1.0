# RESTORE POINT — V1.4 Phase 1 Start

- **ID:** V1.4_PHASE1_START
- **Date:** 2026-02-07
- **Phase:** V1.4 Phase 1 — Control Queue & My Visits
- **Status:** PRE-IMPLEMENTATION
- **Baseline:** V1.3 CLOSED & LOCKED

## State at Restore Point
- No V1.4 code has been implemented
- All V1.3 restore points intact
- Database schema unchanged
- RLS policies unchanged
- Workflow states unchanged
- 11 roles unchanged

## Files to be Created
- `src/hooks/useControlQueue.ts`
- `src/hooks/useMyVisits.ts`
- `src/app/(admin)/control-queue/page.tsx`
- `src/app/(admin)/my-visits/page.tsx`

## Files to be Modified
- `src/routes/index.tsx` (add 2 routes)
- `src/assets/data/menu-items.ts` (add 2 menu items + fix allowedRoles)
