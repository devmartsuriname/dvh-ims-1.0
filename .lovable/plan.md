# Phase 6 — Verification, Closure, and Freeze for DVH-IMS v1.8

## Anti-Drift Check

- **Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
- **Current Phase:** 6 — Verification & Closure
- **Last Restore Point:** `RESTORE_POINT_PHASE_5_V1_8_START.md`

## Code Verification Results (Static Analysis)

All V1.8 changes have been verified at the code and schema level. Below is the full assessment.

### 1. Children Workflow — VERIFIED


| Component                                            | Status | Evidence                                                                                        |
| ---------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------- |
| `types.ts` — `ChildInput` interface                  | PASS   | `age`, `gender`, `has_disability` fields defined                                                |
| `constants.ts` — `children: []` in INITIAL_FORM_DATA | PASS   | Present                                                                                         |
| `Step3Household.tsx` — dynamic add/remove rows       | PASS   | `addChild()`, `removeChild()`, `updateChild()` implemented                                      |
| `Step7Review.tsx` — children summary section         | PASS   | SectionCard with child list + "no children" fallback                                            |
| Edge function — `subsidy_household_child` inserts    | PASS   | Lines 528-549, loops with `sort_order`                                                          |
| Edge function — `children_count` in audit metadata   | PASS   | Line 568                                                                                        |
| Admin case detail — children table display           | PASS   | Lines 418-453, query on line 221-225                                                            |
| DB schema — `subsidy_household_child` table          | PASS   | Columns: `id`, `subsidy_case_id`, `gender`, `age`, `has_disability`, `sort_order`, `created_at` |
| i18n keys (en + nl)                                  | PASS   | 13 keys in both locale files                                                                    |


### 2. Document Requirements Expansion — VERIFIED


| Component                                  | Status | Evidence                                    |
| ------------------------------------------ | ------ | ------------------------------------------- |
| `documentRequirements.ts` — 14 active docs | PASS   | 6 categories, income_proof validation_group |
| `ID_COPY` + `BANK_STATEMENT` mandatory     | PASS   | `is_mandatory: true`                        |
| Income proof group (4 codes)               | PASS   | `validation_group: 'income_proof'`          |
| Step 6 categorized accordion               | PASS   | Previously verified in Phase 2              |


### 3. Server-Side Validation — VERIFIED


| Component                         | Status | Evidence                                               |
| --------------------------------- | ------ | ------------------------------------------------------ |
| Mandatory doc check               | PASS   | Lines 276-283                                          |
| Income proof check                | PASS   | Line 284                                               |
| Structured error codes            | PASS   | `INCOME_PROOF_REQUIRED`, `MANDATORY_DOCUMENTS_MISSING` |
| Audit log for blocked submissions | PASS   | Lines 296-309, action `SUBMISSION_VALIDATION_BLOCKED`  |
| Frontend error handling           | PASS   | Lines 75-80 in `page.tsx`                              |
| i18n error messages (en + nl)     | PASS   | Lines 555-556 in both locale files                     |


### 4. Existing Submission Flow — VERIFIED


| Component                                             | Status | Evidence                        |
| ----------------------------------------------------- | ------ | ------------------------------- |
| Case creation (`subsidy_case`)                        | PASS   | Lines 426-447                   |
| Document persistence (`subsidy_document_upload`)      | PASS   | Lines 480-525                   |
| Status initialization (`subsidy_case_status_history`) | PASS   | Lines 449-462                   |
| Receipt page (`Step8Receipt.tsx`)                     | PASS   | Displays reference, date, token |
| Public status access token                            | PASS   | Lines 465-478                   |


### 5. Boundary Verification — VERIFIED


| Boundary                                              | Status | Evidence                                      |
| ----------------------------------------------------- | ------ | --------------------------------------------- |
| Housing Registration — zero changes                   | PASS   | No Housing files in any V1.8 diff             |
| `household_member` table — unchanged                  | PASS   | Zero modifications                            |
| Admin workflow logic — unchanged                      | PASS   | Status transitions, review panels untouched   |
| Document requirement config — unchanged since Phase 2 | PASS   | `documentRequirements.ts` stable              |
| Deprecated document codes — no regression             | PASS   | `is_active = false` rows excluded from config |


## Runtime Test Requirement

Static code analysis confirms all implementations are correct. However, the test matrix (positive/negative/boundary cases) requires **runtime testing** via the edge function and browser. The implementation will:

1. Create the Phase 6 restore point
2. Log into the admin panel and navigate to an existing subsidy case to verify the Household Children section renders (currently showing "No children registered." for all existing cases — correct behavior since all cases predate Phase 5)
3. Test the edge function with curl for positive and negative validation scenarios
4. Produce the final closure report

## Files Modified Across V1.8 (Complete Diff Summary)


| File                                                           | Phases        |
| -------------------------------------------------------------- | ------------- |
| `src/config/documentRequirements.ts`                           | Phase 2       |
| `src/app/(public)/bouwsubsidie/apply/types.ts`                 | Phase 2, 5    |
| `src/app/(public)/bouwsubsidie/apply/constants.ts`             | Phase 2, 5    |
| `src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx` | Phase 2       |
| `src/app/(public)/bouwsubsidie/apply/steps/Step3Household.tsx` | Phase 5       |
| `src/app/(public)/bouwsubsidie/apply/steps/Step7Review.tsx`    | Phase 5       |
| `src/app/(public)/bouwsubsidie/apply/page.tsx`                 | Phase 3       |
| `supabase/functions/submit-bouwsubsidie-application/index.ts`  | Phase 3, 5    |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx`                  | Phase 5       |
| `src/i18n/locales/en.json`                                     | Phase 2, 3, 5 |
| `src/i18n/locales/nl.json`                                     | Phase 2, 3, 5 |


## Database Tables Used (No Schema Changes in V1.8)

- `subsidy_household_child` — reads/writes (table pre-existed)
- `subsidy_document_upload` — reads/writes (table pre-existed)
- `subsidy_document_requirement` — reads (table pre-existed, `category`/`validation_group` columns added in earlier migration)
- `audit_event` — writes (table pre-existed)
- All other tables unchanged

## NOTE — Phase 6 Scope Confirmation

Phase 6 is strictly a verification and closure phase.

Allowed actions:

- runtime validation tests

- admin UI verification

- edge function validation tests

- final closure report

Not allowed in this phase:

- adding new features

- modifying database schema

- expanding admin workflows

- changing document requirement logic

If any defect is discovered, report it in the closure report instead of fixing it in this phase.

Implementation freeze decision will be taken after the closure report.  
Plan

1. Create restore point `RESTORE_POINT_PHASE_6_VERIFICATION.md`
2. Test edge function server validation via curl (negative cases: missing mandatory docs, missing income proof)
3. Test edge function positive path via curl (minimal valid submission with children)
4. Navigate admin panel to verify children display on existing case
5. Produce final closure report with READY TO FREEZE or REMAINING DEFECTS recommendation