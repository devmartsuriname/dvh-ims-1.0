# Restore Point: ADMIN_V1_1_B_DASH_KPI_FIX_START

**Created:** 2026-01-09
**Phase:** Admin Upgrade v1.1-B (Dashboard KPI Correctness)
**Status:** PRE-IMPLEMENTATION

## Context

Two KPI correctness fixes authorized for Dashboard module.

## Issues to Fix

### A) Pending Applications KPI (#3)
- **Current:** Only counts `status = 'received'`
- **Fix:** Include both `received` AND `pending_documents` statuses
- **Impact:** KPI value only (not charts/tables)

### B) District Applications KPI (#9)
- **Current:** Direct code matching fails for alias codes (PAR vs PM)
- **Fix:** Deterministic alias mapping in aggregation layer
- **Impact:** District map/summary counts

## Files to Be Modified

- `src/app/(admin)/dashboards/hooks/useDashboardData.ts`

## Rollback Instructions

Restore original query logic:
1. Pending: `.eq('status', 'received')` (single status)
2. District: Direct `districtCounts[district.code]` lookup (no alias mapping)

## Previous Restore Point

`ADMIN_V1_1_TOASTIFY_CSS_FIX_COMPLETE`
