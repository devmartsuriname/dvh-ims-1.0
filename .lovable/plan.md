# DVH-IMS v1.7.x — Data-Layer Audit Execution Plan (Documentation Only)

## Scope

READ-ONLY audit. No DB writes, no code changes, no migrations. Output is 3 documentation files only.

## Audit Findings (from read-only DB queries + code inspection)

### Source of Truth Mapping -- CONFIRMED


| Consumer                       | Source File                                                             | Import Used                                             |
| ------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| Bouwsubsidie Wizard            | `src/app/(public)/bouwsubsidie/apply/constants.ts`                      | Local `REQUIRED_DOCUMENTS` (7 items, codes aligned)     |
| Housing Wizard                 | `src/app/(public)/housing/register/constants.ts`                        | Local `REQUIRED_DOCUMENTS` (6 items, codes aligned)     |
| Admin Subsidy Detail (sidebar) | `src/app/(admin)/subsidy-cases/[id]/page.tsx`                           | `BOUWSUBSIDIE_DOCUMENT_REQUIREMENTS` from shared config |
| Admin Housing Detail (sidebar) | `src/app/(admin)/housing-registrations/[id]/page.tsx`                   | `HOUSING_DOCUMENT_REQUIREMENTS` from shared config      |
| DirectorReviewPanel            | `src/app/(admin)/subsidy-cases/[id]/components/DirectorReviewPanel.tsx` | `BOUWSUBSIDIE_DOCUMENT_REQUIREMENTS` from shared config |


No fallback/hardcoded lists detected anywhere in `src/`.

### DB vs Shared Config Comparison

**Bouwsubsidie (`subsidy_document_requirement` -- 10 rows in DB, 7 in config):**


| document_code     | DB name                                   | Config name                               | Mandatory (DB) | Mandatory (Config) | Status               |
| ----------------- | ----------------------------------------- | ----------------------------------------- | -------------- | ------------------ | -------------------- |
| BANK_STATEMENT    | Bank Statement                            | Bank Statement                            | true           | true               | MATCH                |
| CBB_EXTRACT       | CBB uittreksel / Nationaliteit verklaring | CBB uittreksel / Nationaliteit verklaring | false          | false              | MATCH                |
| FAMILY_EXTRACT    | Gezinuittreksel                           | Gezinuittreksel                           | false          | false              | MATCH                |
| HOUSEHOLD_COMP    | Household Composition                     | Household Composition                     | true           | true               | MATCH                |
| ID_COPY           | Copy of ID                                | Copy of ID                                | true           | true               | MATCH                |
| INCOME_PROOF      | Inkomensverklaring (AOV/loonstrook)       | Inkomensverklaring (AOV/loonstrook)       | true           | true               | MATCH                |
| LAND_TITLE        | Land Title / Deed                         | Land Title / Deed                         | true           | true               | MATCH                |
| BUILDING_PERMIT   | Building Permit                           | --                                        | false          | --                 | DEPRECATED (DB only) |
| CONSTRUCTION_PLAN | Construction Plan                         | --                                        | false          | --                 | DEPRECATED (DB only) |
| COST_ESTIMATE     | Cost Estimate                             | --                                        | false          | --                 | DEPRECATED (DB only) |


**Housing (`housing_document_requirement` -- 6 rows in DB, 6 in config):**


| document_code      | DB name                    | Config name         | Mandatory Match | Name Match   |
| ------------------ | -------------------------- | ------------------- | --------------- | ------------ |
| ID_COPY            | Copy of ID                 | Copy of ID          | YES             | YES          |
| INCOME_PROOF       | Proof of Income            | Income Proof        | YES             | **MISMATCH** |
| RESIDENCE_PROOF    | Proof of Current Residence | Residence Proof     | YES             | **MISMATCH** |
| FAMILY_COMPOSITION | Family Composition         | Family Composition  | YES             | YES          |
| MEDICAL_CERT       | Medical Certificate        | Medical Certificate | YES             | YES          |
| EMERGENCY_PROOF    | Emergency Documentation    | Emergency Proof     | YES             | **MISMATCH** |


### Risk Register

1. **3 Housing label mismatches** -- DB `document_name` differs from shared config `document_name` for INCOME_PROOF, RESIDENCE_PROOF, EMERGENCY_PROOF. Impact: LOW (admin sidebar reads from config, not DB). Could cause confusion if archive views display DB names alongside config names.
2. **3 Bouwsubsidie deprecated DB rows** -- BUILDING_PERMIT, CONSTRUCTION_PLAN, COST_ESTIMATE persist in DB but are excluded from all UI. Impact: NONE currently. Recommended cleanup in future.
3. **Wizard constants duplication** -- Both wizard `constants.ts` files maintain separate `REQUIRED_DOCUMENTS` arrays (not importing from shared config). Codes and mandatory flags match, but lists are technically duplicated. Recommend future refactor to derive from shared config.

## Deliverables

### 1. Create: `docs/audits/v1.7/DATA_LAYER_AUDIT_DOCS_CONFIG_SYNC.md`

Full audit report containing:

- Source of truth mapping table
- DB query summaries (read-only) with exact column values
- Counts verification (Bouwsubsidie: 7 config / 10 DB; Housing: 6/6)
- Label mismatch detail table
- Risk register (3 items)
- Verification checklist (all items PASS except 2 WARNING)

### 2. Update: `docs/DVH-IMS-V1.0_1.1/architecture.md`

Add entry to Change History table at line 155:

- Date: 2026-02-27
- Change: Data-layer audit completed for document config sync
- Summary: 3 housing label mismatches (non-blocking), 3 bouwsubsidie deprecated DB rows (no UI impact)

### 3. Update: `docs/backend.md`

Add new section after the existing v1.7.x smoke test section:

- DB vs Config label mismatches (Housing: 3 items)
- Deprecated DB rows (Bouwsubsidie: 3 items)
- Recommended follow-ups (not executed)

## NOTE — Governance Guardrails for Data-Layer Audit  
1) Environment Restriction (Mandatory)  
All read-only queries and inspections must be executed against STAGING environment only.  
Production database access — including read-only queries — is NOT authorized for this audit.  
  
2) Hard Stop Rule  
After documentation deliverables are created/updated:  
- docs/audits/v1.7/DATA_LAYER_AUDIT_DOCS_CONFIG_[SYNC.md](http://SYNC.md)  
- docs/[backend.md](http://backend.md)  
- docs/DVH-IMS-V1.0_1.1/[architecture.md](http://architecture.md)  
  
You must STOP immediately.  
  
No schema changes.  
No DB updates.  
No data cleanup.  
No follow-up fixes.  
No refactors.  
  
Any remediation (e.g., label alignment or deprecated DB rows cleanup) requires a separate approved change request.  
  
Await explicit written instruction before proceeding beyond documentation.  
  
Constraints Confirmed

- No DB WRITE statements executed
- No source code modifications
- No migrations applied
- No RLS changes
- Documentation output only