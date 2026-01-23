# RESTORE POINT: Admin v1.1-B Dashboard Time Filters - COMPLETE

**Created:** 2026-01-09
**Phase:** Admin v1.1-B Step B2.2
**Track:** Dashboard KPI Correctness

## Purpose
Restore point created AFTER implementing time range filter functionality for Dashboard charts.

## Changes Implemented

### 1. TimeRange Type and Helper Function (`useDashboardData.ts`)
- Added `TimeRange` type: `'ALL' | '1M' | '6M' | '1Y'`
- Added `getTimeRangeCutoff()` helper function:
  - ALL = no constraint (returns null)
  - 1M = last 30 days
  - 6M = last 180 days
  - 1Y = last 365 days
  - Uses UTC timestamps

### 2. useMonthlyTrends Hook (`useDashboardData.ts`)
- Now accepts `timeRange` parameter (default: '1Y')
- Applies `.gte()` filter on:
  - `housing_registration.created_at`
  - `subsidy_case.created_at`
  - `allocation_decision.decided_at`
- Re-fetches when `timeRange` changes

### 3. useStatusBreakdown Hook (`useDashboardData.ts`)
- Now accepts `timeRange` parameter (default: '1Y')
- Applies `.gte()` filter on `subsidy_case.created_at`
- Re-fetches when `timeRange` changes

### 4. Dashboard Page (`page.tsx`)
- Added shared `timeRange` state with `useState<TimeRange>('1Y')`
- Passes state and setter to Chart component

### 5. Chart Component (`Chart.tsx`)
- Accepts `timeRange` and `onTimeRangeChange` props
- Wired buttons to call `onTimeRangeChange` on click
- Active button shows visual state

### 6. SaleChart Component (`SaleChart.tsx`)
- Accepts `timeRange` prop (read-only, synced with Monthly Trends)
- Buttons are disabled visual indicators showing current selection
- Hook receives timeRange for filtering

## What Was NOT Implemented (Per Authorization)
- Sparkline historical data (Step B2.3)
- New KPIs or cards
- Schema changes
- UI redesign

## Files Changed
- `src/app/(admin)/dashboards/page.tsx`
- `src/app/(admin)/dashboards/hooks/useDashboardData.ts`
- `src/app/(admin)/dashboards/components/Chart.tsx`
- `src/app/(admin)/dashboards/components/SaleChart.tsx`

## Rollback Instructions
To restore to before B2.2:
1. Revert to `RESTORE_POINT_ADMIN_V1_1_B_DASH_TIMEFILTERS_START.md` state
2. Remove TimeRange type and getTimeRangeCutoff helper
3. Restore hooks to parameterless versions
4. Remove timeRange state from page.tsx
5. Restore Chart.tsx and SaleChart.tsx to static button versions

## RLS Verification
- All queries use client-side Supabase
- No service-role or bypass queries
- RLS policies on housing_registration, subsidy_case, allocation_decision remain enforced
