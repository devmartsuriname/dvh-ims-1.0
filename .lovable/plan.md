# DVH-IMS V1.5 — Bouwsubsidie Document Requirements Update

## Inventory (Step 1)

Changes are required in **4 layers**:


| Layer                        | Location                                                      | Current State                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A) Frontend wizard**       | `src/app/(public)/bouwsubsidie/apply/constants.ts`            | 6 mandatory (ID_COPY, INCOME_PROOF, LAND_TITLE, CONSTRUCTION_PLAN, COST_ESTIMATE, BUILDING_PERMIT) + 2 optional (BANK_STATEMENT, HOUSEHOLD_COMP) |
| **B) i18n labels**           | `src/i18n/locales/en.json` + `nl.json`                        | Labels for all 8 doc types                                                                                                                       |
| **C) Database config**       | `subsidy_document_requirement` table                          | Same 8 rows seeded in initial migration                                                                                                          |
| **D) Backend edge function** | `supabase/functions/submit-bouwsubsidie-application/index.ts` | No server-side mandatory check — maps by `document_code` from DB lookup; no validation changes needed                                            |
| **E) Admin completeness**    | `DirectorReviewPanel.tsx`                                     | Reads `is_mandatory` from DB `subsidy_document_requirement` — driven by DB, no code change needed                                                |


The edge function and admin panel both read requirements dynamically from the `subsidy_document_requirement` table. Changing the DB rows will automatically update backend mapping and admin completeness checks.

---

## New Canonical Document Map


| #   | Label (NL)                                | document_code     | is_mandatory | Action                                               |
| --- | ----------------------------------------- | ----------------- | ------------ | ---------------------------------------------------- |
| 1   | Kopie ID-kaart (voor- en achterkant)      | ID_COPY           | true         | Keep                                                 |
| 2   | Inkomensverklaring (AOV/loonstrook)       | INCOME_PROOF      | true         | Update label                                         |
| 3   | Grondbewijs of erfpachtovereenkomst       | LAND_TITLE        | true         | Keep                                                 |
| 4   | Bankafschrift (laatste 3 maanden)         | BANK_STATEMENT    | **true**     | Change to mandatory                                  |
| 5   | Huishoudsamenstelling                     | HOUSEHOLD_COMP    | **true**     | Change to mandatory                                  |
| 6   | Bouwplan of tekening                      | CONSTRUCTION_PLAN | **false**    | Deprecate (hide from wizard, set not required in DB) |
| 7   | Gedetailleerde kostenbegroting            | COST_ESTIMATE     | **false**    | Deprecate (hide from wizard, set not required in DB) |
| 8   | Bouwvergunning                            | BUILDING_PERMIT   | **false**    | Deprecate (hide from wizard, set not required in DB) |
| 9   | CBB uittreksel / Nationaliteit verklaring | CBB_EXTRACT       | false        | **NEW** — add to DB + wizard                         |
| 10  | Gezinuittreksel                           | FAMILY_EXTRACT    | false        | **NEW** — add to DB + wizard                         |


---

## Implementation Steps

### Step 0 — Restore Point

Create `/restore-points/DVH-IMS-V1.5-doc-requirements-change.md` with current state documentation.

### Step 1 — Database Migration (non-breaking, additive)

Single SQL migration:

- UPDATE `CONSTRUCTION_PLAN`, `COST_ESTIMATE`, `BUILDING_PERMIT` to `is_mandatory = false`
- UPDATE `BANK_STATEMENT`, `HOUSEHOLD_COMP` to `is_mandatory = true`
- UPDATE `INCOME_PROOF` document_name/description to reflect "AOV/loonstrook"
- INSERT two new rows: `CBB_EXTRACT` and `FAMILY_EXTRACT` (both `is_mandatory = false`)
- No deletions, no enum removals

### Step 2 — Frontend Constants Update

Update `src/app/(public)/bouwsubsidie/apply/constants.ts`:

- Remove CONSTRUCTION_PLAN, COST_ESTIMATE, BUILDING_PERMIT from `REQUIRED_DOCUMENTS` array (they stay in DB but are hidden from wizard)
- Change BANK_STATEMENT and HOUSEHOLD_COMP to `is_mandatory: true`
- Add CBB_EXTRACT and FAMILY_EXTRACT as `is_mandatory: false`
- Result: 5 mandatory + 2 optional = 7 wizard slots

### Step 3 — i18n Label Updates

Update both `en.json` and `nl.json`:

- Update INCOME_PROOF label to include "AOV/loonstrook"
- Add CBB_EXTRACT and FAMILY_EXTRACT labels
- Keep deprecated doc labels (they may appear in historical admin views)

### Step 4 — Documentation Updates

- Update `/docs/backend.md` and `/docs/architecture.md` with mapping table and change summary

  
Note:  
🔎 Extra Verification Note (Mandatory Before Finalizing)

To ensure full alignment between frontend and database requirements, the following verification steps must be added and executed before closing this task:

1️⃣ Database Verification (Post-Migration)

After running the migration, execute:

SELECT document_code, is_mandatory

FROM subsidy_document_requirement

ORDER BY document_code;

- Confirm exactly 5 mandatory documents.

- Confirm deprecated document types remain in DB but are set to is_mandatory = false.

- Provide screenshot of result in final report.

---

2️⃣ Frontend Validation Alignment Check

Explicitly confirm in the final report:

- The wizard submit guard does NOT rely on outdated hardcoded REQUIRED_DOCUMENTS.

- Progress counter correctly shows 5 required documents.

- Submission succeeds only when the 5 mandatory documents are uploaded.

- Optional documents never block submission.

Include confirmation statement:

“Frontend validation and submit guard fully align with updated DB requirements.”

---

3️⃣ End-to-End Smoke Test Confirmation

Confirm and document:

- Fresh application test completed

- All 5 required documents uploaded

- Successful submission

- Admin completeness reflects new required logic

- No hidden reference to deprecated document types in UI

---

Do NOT proceed to UI polish or any further changes until this verification is completed and documented.  
  
  
What Does NOT Change

- No edge function code changes (it reads from DB dynamically)
- No admin UI code changes (DirectorReviewPanel reads `is_mandatory` from DB)
- No type changes
- No enum removals
- No schema changes (columns stay intact)
- No storage path changes
- Existing uploaded documents remain linked and visible

### Files Modified

1. `restore-points/DVH-IMS-V1.5-doc-requirements-change.md` (new)
2. `supabase/migrations/[timestamp].sql` (new — DB data update)
3. `src/app/(public)/bouwsubsidie/apply/constants.ts` (updated)
4. `src/i18n/locales/en.json` (updated)
5. `src/i18n/locales/nl.json` (updated)
6. `docs/backend.md` (updated, if exists)
7. `docs/architecture.md` (updated, if exists)