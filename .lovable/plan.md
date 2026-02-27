

# DVH-IMS v1.7.x — Phase 6: DB Label Alignment (Housing Only)

## Scope

Align 3 `housing_document_requirement` label mismatches identified in audit 8F42B1C3. Staging only. No structural changes, no deletions, no config edits, no UI changes.

## Changes

### 1. Create: `docs/migrations/v1.7/STAGING_LABEL_ALIGNMENT_HOUSING.sql`

Three individual UPDATE statements:

```text
UPDATE housing_document_requirement
SET document_name = 'Income Proof'
WHERE document_code = 'INCOME_PROOF';

UPDATE housing_document_requirement
SET document_name = 'Residence Proof'
WHERE document_code = 'RESIDENCE_PROOF';

UPDATE housing_document_requirement
SET document_name = 'Emergency Proof'
WHERE document_code = 'EMERGENCY_PROOF';
```

Each statement targets exactly one row by `document_code`. No `is_mandatory` touched. No bulk operations.

### 2. Create: `docs/migrations/v1.7/STAGING_LABEL_ALIGNMENT_HOUSING_ROLLBACK.sql`

Three individual rollback statements restoring original DB names:

```text
UPDATE housing_document_requirement
SET document_name = 'Proof of Income'
WHERE document_code = 'INCOME_PROOF';

UPDATE housing_document_requirement
SET document_name = 'Proof of Current Residence'
WHERE document_code = 'RESIDENCE_PROOF';

UPDATE housing_document_requirement
SET document_name = 'Emergency Documentation'
WHERE document_code = 'EMERGENCY_PROOF';
```

### 3. Update: `docs/audits/v1.7/DATA_LAYER_AUDIT_DOCS_CONFIG_SYNC.md`

Append a new section before the Conclusion (section 10):

- Section title: "9A. Phase 6 — DB Label Alignment (Housing)"
- Documents the 3 updates applied to staging
- References migration and rollback SQL file paths
- Notes that production promotion requires separate approval
- Updates the Risk Register item 1 status from WARNING to RESOLVED (staging)

### 4. Execute the 3 UPDATE statements against Staging DB

Using the Supabase data update tool (not migration tool -- these are data updates, not schema changes). Three separate statements, one per record.

## Constraints Confirmed

- Staging environment only
- No schema changes
- No config/source code modifications
- No subsidy table modifications
- No deprecated row modifications
- No production promotion
- HARD STOP after documentation + staging execution

