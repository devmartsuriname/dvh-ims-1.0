# RESTORE POINT — V1.4 Phase 1 Complete

- **ID:** V1.4_PHASE1_COMPLETE
- **Date:** 2026-02-07
- **Phase:** V1.4 Phase 1 — Control Queue & My Visits
- **Status:** IMPLEMENTED

## Files Created
- `restore-points/v1.4/RESTORE_POINT_V1.4_PHASE1_START.md`
- `src/hooks/useControlQueue.ts`
- `src/hooks/useMyVisits.ts`
- `src/app/(admin)/control-queue/page.tsx`
- `src/app/(admin)/my-visits/page.tsx`

## Files Modified
- `src/routes/index.tsx` — Added `/control-queue` and `/my-visits` routes
- `src/assets/data/menu-items.ts` — Added Control Queue + My Visits menu items; added `social_field_worker` and `technical_inspector` to `subsidy-cases` allowedRoles

## Governance Compliance
- No new database tables: COMPLIANT
- No new columns: COMPLIANT
- No RLS policy changes: COMPLIANT
- No workflow state changes: COMPLIANT
- No role changes: COMPLIANT
- Darkone Admin 1:1: ENFORCED
- Read-only pages: ENFORCED
- Bouwsubsidie only: ENFORCED
