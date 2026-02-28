# DVH-IMS v1.7.x — Phase 7: Deprecated Bouwsubsidie Docs Cleanup (STAGING ONLY)

## Preflight Findings (Step 0 — Complete)

### Table Structure

- **Table:** `subsidy_document_requirement`
- **Columns:** `id`, `document_code`, `document_name`, `description`, `is_mandatory`, `created_at`
- **No soft-delete flag exists** (no `is_active`, `is_deprecated`, `archived_at`, or `deleted_at`)

### Target Rows Confirmed (3 rows)


| document_code     | document_name     | is_mandatory | id           |
| ----------------- | ----------------- | ------------ | ------------ |
| BUILDING_PERMIT   | Building Permit   | false        | df8ae0c0-... |
| CONSTRUCTION_PLAN | Construction Plan | false        | 4eae22a8-... |
| COST_ESTIMATE     | Cost Estimate     | false        | 9138a3ae-... |


### FK Reference Check -- BLOCKING FINDING

- **FK constraint:** `subsidy_document_upload.requirement_id` references `subsidy_document_requirement.id`
- **9 existing uploads** reference these 3 deprecated requirement IDs (3 per document_code)
- **Hard DELETE is BLOCKED.** Deleting these rows would violate FK constraints and break historical upload records.

### Decision: SOFT-DEPRECATION via `is_active` column

Since no soft-delete flag exists, Phase 7 will:

1. Add `is_active BOOLEAN NOT NULL DEFAULT true` to `subsidy_document_requirement` (schema change)
2. Set `is_active = false` for the 3 deprecated rows (data change)
3. All existing 7 active rows remain `is_active = true` by default

## Execution Plan

### Step 1: Schema Migration

Add `is_active` column to `subsidy_document_requirement`:

```text
ALTER TABLE subsidy_document_requirement
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
```

This is a non-breaking additive change. All existing rows default to `is_active = true`.

### Step 2: Data Updates (3 individual statements)

```text
UPDATE subsidy_document_requirement SET is_active = false WHERE document_code = 'BUILDING_PERMIT';
UPDATE subsidy_document_requirement SET is_active = false WHERE document_code = 'CONSTRUCTION_PLAN';
UPDATE subsidy_document_requirement SET is_active = false WHERE document_code = 'COST_ESTIMATE';
```

Each must affect exactly 1 row. If not, ABORT.

### Step 3: Verification Queries

- Confirm 3 deprecated rows have `is_active = false`
- Confirm 7 active rows have `is_active = true`
- Confirm total row count = 10

### Step 4: Create Documentation Files

1. **Create:** `docs/migrations/v1.7/STAGING_DEPRECATED_SUBSIDY_DOCS_CLEANUP.sql` (forward migration)
2. **Create:** `docs/migrations/v1.7/STAGING_DEPRECATED_SUBSIDY_DOCS_CLEANUP_ROLLBACK.sql` (rollback: re-enable rows + drop column)
3. **Update:** `docs/audits/v1.7/DATA_LAYER_AUDIT_DOCS_CONFIG_SYNC.md` -- Add section "9B. Phase 7"
4. **Update:** `docs/backend.md` -- Add Phase 7 entry
5. **Update:** `docs/DVH-IMS-V1.0_1.1/architecture.md` -- Add Change History entry

### Step 5: UI Smoke Check (optional, admin sidebar reads from shared config not DB)

The admin sidebar already excludes these 3 docs because it reads from `src/config/documentRequirements.ts`. The `is_active` flag is for data hygiene and future-proofing any DB-driven queries.

## Rollback SQL

```text
UPDATE subsidy_document_requirement SET is_active = true WHERE document_code = 'BUILDING_PERMIT';
UPDATE subsidy_document_requirement SET is_active = true WHERE document_code = 'CONSTRUCTION_PLAN';
UPDATE subsidy_document_requirement SET is_active = true WHERE document_code = 'COST_ESTIMATE';
ALTER TABLE subsidy_document_requirement DROP COLUMN is_active;
```

## Risk Summary


| Risk                                           | Mitigation                                    |
| ---------------------------------------------- | --------------------------------------------- |
| FK blocks hard delete                          | Soft-deprecation chosen (is_active flag)      |
| 9 historical uploads reference deprecated rows | Rows preserved, only flagged inactive         |
| Admin sidebar already excludes these docs      | No UI change needed -- config-driven          |
| New column could break existing queries        | `DEFAULT true` ensures backward compatibility |


NOTE — Approval Gate for Phase 7 (Deprecated Subsidy Docs Cleanup)

You may proceed to APPROVE Phase 7 ONLY if the following two conditions are explicitly confirmed:

1) Schema Change Authorization (Staging Only)

The additive schema change (adding the `is_active` column to subsidy_document_requirement) is formally authorized for STAGING environment.

No production schema changes are authorized at this stage.

2) DB-Driven Rendering Confirmation

It is confirmed that no active UI module, reporting layer, export process, ETL job, or downstream consumer relies directly on the subsidy_document_requirement table without filtering.

Any future DB-driven requirement listing must explicitly filter:

    WHERE is_active = true

If either condition is NOT confirmed, do NOT proceed.

Return for scope adjustment before execution.

HARD RULE:

No production promotion.

No additional schema changes.

No scope expansion.

Await explicit confirmation before continuing.  
  
Constraints Confirmed

- Staging environment only
- No source code changes
- No config edits
- No housing table modifications
- HARD STOP after execution + documentation