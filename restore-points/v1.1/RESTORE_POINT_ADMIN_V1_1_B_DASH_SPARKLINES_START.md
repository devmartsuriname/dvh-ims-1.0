# Restore Point: Admin v1.1-B Dashboard Sparklines START

**Created:** 2026-01-09
**Phase:** Admin v1.1-B Step B2.3
**Status:** Implementation Starting

## Purpose

This restore point marks the beginning of Admin v1.1-B Step B2.3 — Implementing real sparkline data for Dashboard KPI cards.

## Scope

Replace static placeholder sparkline series in KPI cards with real, data-derived series that react to the shared dashboard TimeRange (ALL/1M/6M/1Y).

## Files To Be Modified

| File | Change |
|------|--------|
| `src/app/(admin)/dashboards/hooks/useDashboardData.ts` | Add `useSparklineData` hook |
| `src/app/(admin)/dashboards/data.ts` | Update `createCardsData` to accept sparklines |
| `src/app/(admin)/dashboards/components/Cards.tsx` | Accept `timeRange`, use `useSparklineData` |
| `src/app/(admin)/dashboards/page.tsx` | Pass `timeRange` to `Cards` component |

## Bucketing Rules

| TimeRange | Bucket Type | Count |
|-----------|-------------|-------|
| 1M | Daily | 30 points |
| 6M | Weekly | 26 points |
| 1Y / ALL | Monthly | 12 points |

## Data Sources

| KPI Card | Source Table | Timestamp Field | Filter |
|----------|--------------|-----------------|--------|
| Housing Registrations | `housing_registration` | `created_at` | None |
| Subsidy Applications | `subsidy_case` | `created_at` | None |
| Pending Applications | `subsidy_case` | `created_at` | `status IN ('received', 'pending_documents')` |
| Approved Applications | `subsidy_case` | `created_at` | `status = 'approved'` |

## Rollback Instructions

If rollback is needed, restore files from previous commit before this restore point was created.

## Guardian Rules Compliance

- Darkone Admin 1:1: YES (data-only change, no UI modifications)
- RLS-first: YES (all queries use authenticated client)
- No scope expansion: YES (only authorized files modified)
