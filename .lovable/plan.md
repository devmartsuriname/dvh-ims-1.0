

# DVH-IMS v1.8 — Phase 1B: Document Requirements Data Operations

## Current DB State

10 rows in `subsidy_document_requirement`. 3 already `is_active = false` (BUILDING_PERMIT, CONSTRUCTION_PLAN, COST_ESTIMATE). 7 active rows.

## Step 1: Schema Change (Migration)

Add 2 nullable columns:

```sql
ALTER TABLE public.subsidy_document_requirement
  ADD COLUMN category text,
  ADD COLUMN validation_group text;
```

Both nullable — no impact on existing rows.

## Step 2: Soft-Deprecate 5 Active Rows (Insert Tool)

Set `is_active = false` for:

| Code | Current Status |
|------|---------------|
| HOUSEHOLD_COMP | active, mandatory |
| FAMILY_EXTRACT | active, optional |
| CBB_EXTRACT | active, optional |
| INCOME_PROOF | active, mandatory |
| LAND_TITLE | active, mandatory |

No DELETE. Historical uploads remain visible (confirmed in prior analysis).

## Step 3: Insert 13 New Rows (Insert Tool)

Using the approved document list. `ID_COPY` and `BANK_STATEMENT` already exist — these will be UPDATED (set category, keep is_active = true) rather than re-inserted.

**Updates to existing rows (2):**

| Code | Set category | Set validation_group |
|------|-------------|---------------------|
| ID_COPY | identity | NULL |
| BANK_STATEMENT | financial | NULL |

**New inserts (11):**

| Code | Name | Mandatory | Category | validation_group |
|------|------|-----------|----------|-----------------|
| PAYSLIP | Loonstrook | false | income | income_proof |
| AOV_STATEMENT | AOV-verklaring | false | income | income_proof |
| PENSION_STATEMENT | Pensioenverklaring | false | income | income_proof |
| EMPLOYER_DECLARATION | Werkgeversverklaring | false | income | income_proof |
| PROPERTY_DEED | Grondbewijs / eigendomsbewijs | false | property | NULL |
| GLIS_EXTRACT | GLIS-uittreksel | false | property | NULL |
| PARCEL_MAP | Perceelkaart | false | property | NULL |
| NOTARIAL_DEED | Notariële akte | false | legal | NULL |
| PURCHASE_AGREEMENT | Koopovereenkomst | false | legal | NULL |
| ESTATE_PERMISSION | Boedelgrondverklaring | false | special | NULL |
| MORTGAGE_EXTRACT | Hypotheekuittreksel | false | special | NULL |
| VILLAGE_AUTHORITY | Verklaring dorpshoofd | false | special | NULL |

Wait — that's 12 new rows, not 11. Let me recount: PAYSLIP, AOV_STATEMENT, PENSION_STATEMENT, EMPLOYER_DECLARATION (4 income) + PROPERTY_DEED, GLIS_EXTRACT, PARCEL_MAP (3 property) + NOTARIAL_DEED, PURCHASE_AGREEMENT (2 legal) + ESTATE_PERMISSION, MORTGAGE_EXTRACT, VILLAGE_AUTHORITY (3 special) = 12 new inserts.

## Step 4: Verification Queries

After all operations:
- Confirm 8 rows `is_active = false` (3 old deprecated + 5 newly deprecated)
- Confirm 14 rows `is_active = true` (ID_COPY + BANK_STATEMENT existing + 12 new)
- Confirm total = 22 rows
- Confirm all new rows have category set
- Confirm 4 income rows have `validation_group = 'income_proof'`

## What This Does NOT Touch

- `housing_document_requirement` — zero changes
- Any frontend code — zero changes
- `household_member` — zero changes

## Deployment Sequence

1. Migration: add `category` + `validation_group` columns
2. Insert tool: soft-deprecate 5 rows
3. Insert tool: update 2 existing rows (ID_COPY, BANK_STATEMENT) with category
4. Insert tool: insert 12 new rows
5. Verification query

