# DEFECT-001 Fix — Gender Constraint Mismatch

## Steps

1. **Database migration**: Drop and recreate the check constraint on `subsidy_household_child` to accept `('M', 'F')` instead of `('M', 'V')`. Include `UPDATE` to convert any existing `'V'` records to `'F'`.
2. **Redeploy edge function**: `submit-bouwsubsidie-application` — no code changes needed (already sends `'F'`), just redeploy to confirm.
3. **Runtime verification**: Test submission with 2 children (M + F) via curl, confirm both persist.
4. **Admin UI verification**: Navigate to the newly created case, screenshot the children section showing both records.

## Files Affected


| File          | Change                    |
| ------------- | ------------------------- |
| Migration SQL | Alter constraint only     |
| Edge function | Redeploy (no code change) |


No new features. No other files touched.  
  
Note:

Before applying the new constraint, run a quick verification query to confirm that

no unexpected gender values exist in the table:

SELECT DISTINCT gender

FROM subsidy_household_child;

Expected values:

'M'

'V'

If other values exist, report before migration.