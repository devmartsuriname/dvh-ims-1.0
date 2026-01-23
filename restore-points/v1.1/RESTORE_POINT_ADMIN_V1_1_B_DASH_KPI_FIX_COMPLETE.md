# Restore Point: ADMIN_V1_1_B_DASH_KPI_FIX_COMPLETE

**Created:** 2026-01-09
**Phase:** Admin Upgrade v1.1-B (Dashboard KPI Correctness)
**Status:** COMPLETE

## Changes Implemented

### A) Pending Applications KPI Fix
- **Before:** `.eq('status', 'received')` — counted only 24 cases
- **After:** `.in('status', ['received', 'pending_documents'])` — counts 29 cases
- **Impact:** KPI value only (charts/tables unchanged)

### B) District Applications KPI Fix
- **Before:** Direct lookup `districtCounts[district.code]`
- **After:** Alias mapping normalizes 3-letter DB codes to 2-letter UI codes
- **Mapping:** PAR→PM, WAA→WA, NIC→NI, COR→CO, SAR→SA, COM→CM, MAR→MA, PAB→PA, BRO→BR, SIP→SI
- **Impact:** District map now correctly aggregates all records

## File Modified

- `src/app/(admin)/dashboards/hooks/useDashboardData.ts`
  - Lines 70-75: Pending query uses `.in()` instead of `.eq()`
  - Lines 176-207: Added `DISTRICT_CODE_ALIASES` and `normalizeCode()` function

## NOT Implemented (Deferred)

- Time range filters (ALL/1M/6M/1Y) — NOT authorized
- Sparkline real historical data — NOT authorized
- No UI/layout changes — Darkone 1:1 preserved

## Verification Required

1. Dashboard loads without console errors
2. Pending Applications = 29 (24 received + 5 pending_documents)
3. District Applications map shows all records (no drops)
4. Smoke check: /subsidy-cases, /housing-registrations, /allocation-runs, /audit-log

## Rollback Instructions

Restore original logic in `useDashboardData.ts`:
1. Line 70-75: Change `.in('status', [...])` back to `.eq('status', 'received')`
2. Lines 176-207: Remove alias mapping, restore direct lookup

## Previous Restore Point

`ADMIN_V1_1_B_DASH_KPI_FIX_START`
