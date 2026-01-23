# Restore Point: Admin v1.1-B Dashboard TimeRange Decouple — START

**Created:** 2026-01-09
**Phase:** Admin v1.1-B Bugfix
**Step:** TimeRange Per-Widget Decoupling

## Scope
Decouple shared dashboard TimeRange state into per-widget local states.

## Files to Modify
- src/app/(admin)/dashboards/page.tsx
- src/app/(admin)/dashboards/components/Chart.tsx
- src/app/(admin)/dashboards/components/SaleChart.tsx
- src/app/(admin)/dashboards/components/Cards.tsx

## Current State
- Single shared `timeRange` state in page.tsx
- All widgets update together when any TimeRange button is clicked

## Target State
- Monthly Trends: owns `trendsRange` (local)
- Cases-by-Status: owns `statusRange` (local)
- KPI Sparklines: use fixed '1Y' constant (decoupled)

## Rollback
Revert all files listed above to their state before this restore point.
