# RESTORE POINT: v1.1-D5-C COMPLETE

**Created:** 2026-01-23
**Phase:** v1.1-D5-C (Final Admin Demo Cleanup)
**Status:** COMPLETE

## Executed Actions

### 1. ComingSoon.tsx Branding Update (src/components/ComingSoon.tsx)
- Changed default subName: `'Darkone'` → `'VolksHuisvesting IMS'`

### 2. Demo Data Files Deleted
- `src/assets/data/other.ts` (549 lines) - pricing, projects, dataTable records
- `src/assets/data/social.ts` (483 lines) - email, group data

### 3. Demo Helper File Deleted
- `src/helpers/data.ts` (103 lines) - unused helper functions

## Files Modified (1)
- src/components/ComingSoon.tsx

## Files Deleted (3)
- src/assets/data/other.ts
- src/assets/data/social.ts
- src/helpers/data.ts

## Files Kept (1)
- src/assets/data/topbar.ts — Required by Notifications.tsx

## Governance Confirmation

| Constraint | Status |
|------------|--------|
| No DB changes | ✓ CONFIRMED |
| No RLS changes | ✓ CONFIRMED |
| No Edge Function changes | ✓ CONFIRMED |
| No Public Wizard changes | ✓ CONFIRMED |
| Admin scope only | ✓ CONFIRMED |

## Verification

- Build passes without errors
- No broken imports
- Notifications bell still functional
- ComingSoon component displays correct branding

## v1.1 Admin Cleanup Summary

v1.1-D5-A through v1.1-D5-C COMPLETE:
- 39 demo routes removed
- 43+ demo page files deleted
- 3 demo data/helper files deleted
- Sidebar demo module removed
- ProfileDropdown demo items removed
- All "Darkone" branding replaced with "VolksHuisvesting IMS"
- GridJS pagination dark theme bug fixed
