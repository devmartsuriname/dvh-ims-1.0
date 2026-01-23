# Restore Point: ADMIN_V1_1_A_FIXES_START

**Created:** 2026-01-09
**Phase:** v1.1-A Minor Fixes
**Status:** Pre-Implementation

## Purpose

Restore point before applying two authorized minor UX fixes:
1. Households - Add View button formatter to Actions column
2. Allocation Quotas - Fix Edit button event listener timing

## Files to be Modified

- `src/app/(admin)/households/components/HouseholdTable.tsx`
- `src/app/(admin)/allocation-quotas/components/QuotaTable.tsx`

## Rollback Instructions

If issues occur, revert to this restore point via Lovable History.

## Scope Constraints

- NO new features
- NO refactors
- NO new hooks or utilities
- Fix existing code ONLY
