# Restore Point: v1.1-D D1 Empty State Start

**Created:** 2026-01-14  
**Phase:** Admin v1.1-D — D1: Empty State Standardization  
**Status:** START

## Scope

Add standardized empty state messages to:
1. Allocation Runs (RunTable.tsx)
2. Allocation Quotas (QuotaTable.tsx)
3. Dashboard Monthly Trends chart (Chart.tsx)

## Files to Modify

- `src/app/(admin)/allocation-runs/components/RunTable.tsx`
- `src/app/(admin)/allocation-quotas/components/QuotaTable.tsx`
- `src/app/(admin)/dashboards/components/Chart.tsx`

## Existing Pattern Reference

From PersonTable.tsx, HouseholdTable.tsx, CaseTable.tsx, RegistrationTable.tsx:
```tsx
{items.length === 0 ? (
  <p className="text-muted text-center py-4">No [items] found. Click "[Action]" to create one.</p>
) : (
  <Grid ... />
)}
```

## Environment

- Target: Preview URL
- No database changes
- No RLS changes
- No Edge Function changes

## Rollback

Revert the three files to their pre-modification state.
