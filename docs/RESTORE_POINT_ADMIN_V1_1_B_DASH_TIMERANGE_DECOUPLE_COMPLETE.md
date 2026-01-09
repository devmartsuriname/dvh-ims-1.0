# Restore Point: Admin v1.1-B Dashboard TimeRange Decouple — COMPLETE

**Created:** 2026-01-09
**Phase:** Admin v1.1-B Bugfix
**Step:** TimeRange Per-Widget Decoupling

## Summary

Successfully decoupled dashboard TimeRange controls to be per-widget instead of globally shared.

## State Ownership (Post-Fix)

| Widget | State Variable | Location | Default | Controlled By |
|--------|----------------|----------|---------|---------------|
| Monthly Trends | `trendsRange` | Chart.tsx (local) | `'1Y'` | Own buttons |
| Cases-by-Status | `statusRange` | SaleChart.tsx (local) | `'1Y'` | Own buttons |
| KPI Sparklines | `SPARKLINE_TIME_RANGE` | Cards.tsx (constant) | `'1Y'` | None (stable) |

## Behavior

- Clicking Monthly Trends TimeRange buttons → ONLY Monthly Trends updates
- Clicking Cases-by-Status TimeRange buttons → ONLY Cases-by-Status updates
- KPI card sparklines are decoupled and do NOT change when chart buttons are clicked

## Files Modified

| File | Change |
|------|--------|
| `src/app/(admin)/dashboards/page.tsx` | Removed shared `timeRange` state and props |
| `src/app/(admin)/dashboards/components/Chart.tsx` | Added local `trendsRange` state, removed props |
| `src/app/(admin)/dashboards/components/SaleChart.tsx` | Added local `statusRange` state, removed prop |
| `src/app/(admin)/dashboards/components/Cards.tsx` | Removed `timeRange` prop, uses fixed `'1Y'` constant |
| `docs/backend.md` | Documented per-widget state ownership |
| `docs/architecture.md` | Updated data flow diagrams |

## Verification

- [x] Click Monthly Trends TimeRange buttons → ONLY Monthly Trends updates
- [x] Click Cases-by-Status TimeRange buttons → ONLY Cases-by-Status updates
- [x] KPI cards/sparklines do NOT change when chart buttons are clicked
- [x] No console errors
- [x] RLS remains enforced
- [x] Visual styling unchanged

## Rollback

To revert, restore the following files from the START restore point:
- `src/app/(admin)/dashboards/page.tsx`
- `src/app/(admin)/dashboards/components/Chart.tsx`
- `src/app/(admin)/dashboards/components/SaleChart.tsx`
- `src/app/(admin)/dashboards/components/Cards.tsx`
