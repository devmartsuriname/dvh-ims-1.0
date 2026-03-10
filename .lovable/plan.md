# Phase 9E — Bouwsubsidie Wizard Screening Fixes: Impact Analysis & Safe Fix Plan

---

## 1. EXECUTIVE SUMMARY

10 requested changes spanning Step 0 (intro), Step 3 (household), Step 5 (application reason), and Step 6 (documents). 6 are copy-only i18n changes. 4 involve config/validation changes — most critically replacing BANK_STATEMENT with a new NATIONALITY_DECLARATION document code, which impacts the document requirements config, validation gating logic, Edge Function server-side validation, and error messages.

---

## 2. WEAK ASSUMPTIONS FOUND

- **Change #8 (replace Bankafschrift with Nationaliteitverklaring)**: This is NOT a simple text swap. BANK_STATEMENT is currently a **mandatory** document in config, gating logic, the Edge Function server-side validation, and the checklist UI. Replacing it requires coordinated changes across 5+ files.
- **Change #5 ("correct wording for gezinsamenstelling")**: The user says "correct wording" but the current label "Huishoudgrootte" has a specific meaning (total persons). The replacement must preserve that meaning while aligning with "Gezinsamenstelling" terminology. Proposed: "Gezinsgrootte".

---

## 3. MISSING CONSTRAINTS

- No explicit Dutch wording provided for the new "Belangrijke mededeling" additions (changes #3a/#3b). Will need to draft appropriate NL text.
- No explicit English translations provided. Will need to create EN equivalents for all new copy.
- Change #8: No `document_code` specified for "Nationaliteitverklaring". Proposed: `NATIONALITY_DECLARATION`. Must also confirm whether this needs a DB migration in `subsidy_document_requirement`.

---

## 4. CHANGE INVENTORY


| #   | Change                                               | Files                                                                                                                | Impact Type                       | Risk                |
| --- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------- |
| 1   | Process step 3 text: replace "gecontacteerd"         | `nl.json` (step0.process3Text, noticeText), `en.json`                                                                | Copy-only, i18n                   | Low                 |
| 2   | Remove bankafschrift from intro docs list            | `nl.json` (step0.doc2), `en.json`                                                                                    | Copy-only, i18n                   | Low                 |
| 3a  | Important notice: previous subsidy exclusion         | `nl.json` (step0.noticeText), `en.json`                                                                              | Copy-only, i18n                   | Low                 |
| 3b  | Important notice: unemployed must report in person   | `nl.json` (step0.noticeText), `en.json`                                                                              | Copy-only, i18n                   | Low                 |
| 4   | Rename "Huishoudgegevens" → "Gezinsamenstelling"     | `nl.json` (step3.title, step7.sectionHousehold, wizard.steps.household, wizard.phases.household), `en.json`          | Copy-only, i18n                   | Low                 |
| 5   | Rename "Huishoudgrootte" → "Gezinsgrootte"           | `nl.json` (step3.householdSize + related), `en.json`, validation keys                                                | Copy-only, i18n                   | Low                 |
| 6   | Replace "Nieuwbouw" → "Afbouw woning"                | `nl.json` (reasons.new_construction), `en.json`                                                                      | Copy-only, i18n                   | Low                 |
| 7   | Add unclear docs warning to Step 6 info text         | `nl.json` (step6.infoText), `en.json`                                                                                | Copy-only, i18n                   | Low                 |
| 8   | Replace BANK_STATEMENT with NATIONALITY_DECLARATION  | `documentRequirements.ts`, `constants.ts`, `Step6Documents.tsx`, Edge Function, `nl.json`, `en.json`, error messages | **Config + Validation + Backend** | **HIGH**            |
| 9   | Update "Vereisten om door te gaan" checklist         | `Step6Documents.tsx` (lines 173-179), `nl.json` (checkBankStatement), `en.json`                                      | Config + UI                       | Medium (tied to #8) |
| 10  | Add "documents must be in applicant's own name" note | `nl.json` (step6 or docsNote), `en.json`                                                                             | Copy-only, i18n                   | Low                 |


---

## 5. AFFECTED WIZARD STEPS


| Step                         | Changes                                           |
| ---------------------------- | ------------------------------------------------- |
| Step 0 (Introduction)        | #1, #2, #3a, #3b                                  |
| Step 3 (Household)           | #4, #5                                            |
| Step 5 (Application context) | #6                                                |
| Step 6 (Documents)           | #7, #8, #9, #10                                   |
| Step 7 (Review)              | #4, #5 (section labels reference same i18n keys)  |
| Step 8 (Receipt)             | #1 (step8.nextStep3Text also has "gecontacteerd") |


---

## 6. DOCUMENT LOGIC IMPACT

**Change #8 is the critical one.** Current state:

```text
MANDATORY docs: ID_COPY (identity), BANK_STATEMENT (financial)
GROUP-MANDATORY: PAYSLIP | AOV_STATEMENT | PENSION_STATEMENT | EMPLOYER_DECLARATION
```

After change #8:

```text
MANDATORY docs: ID_COPY (identity), NATIONALITY_DECLARATION (identity)
GROUP-MANDATORY: unchanged
```

**Files requiring coordinated update:**

1. `src/config/documentRequirements.ts` — replace BANK_STATEMENT entry with NATIONALITY_DECLARATION, `is_mandatory: true`, category: `identity`
2. `src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx` — rename `bankStatementUploaded` variable to `nationalityDeclarationUploaded`, update document_code check
3. `supabase/functions/submit-bouwsubsidie-application/index.ts` — update `MANDATORY_DOCUMENT_CODES` array from `['ID_COPY', 'BANK_STATEMENT']` to `['ID_COPY', 'NATIONALITY_DECLARATION']`
4. `nl.json` / `en.json` — update document label, checklist label, error messages
5. `nl.json` `errors.mandatoryDocumentsMissing` — remove bankafschrift reference

**Income proof validation is NOT affected** — that logic filters by `validation_group === 'income_proof'` which remains unchanged.

---

## 7. COPY-ONLY CHANGES (Safe Batch)

Changes #1, #2, #3a, #3b, #4, #5, #6, #7, #10 — all i18n text updates in `nl.json` and `en.json`. Zero logic impact.

---

## 8. CONFIG / VALIDATION CHANGES (Careful Batch)

Changes #8 and #9 — require synchronized updates across:

- `documentRequirements.ts` (source of truth)
- `Step6Documents.tsx` (gating UI)
- Edge Function (server-side validation)
- i18n files (labels + error messages)

---

## 9. ADMIN / REVIEW / RECEIPT IMPACT

- **Step 7 (Review)**: Section header "Huishoudgegevens" → "Gezinsamenstelling" is automatic (same i18n key).
- **Step 7 document list**: Renders from `formData.documents` using `t(doc.label)` — will automatically pick up the new document label once i18n key is updated.
- **Step 8 (Receipt)**: `step8.nextStep3Text` also contains "gecontacteerd" — must also be updated for change #1.
- **Admin case detail**: Uses DB document_code values. If existing applications used `BANK_STATEMENT`, those remain valid in DB. New applications will use `NATIONALITY_DECLARATION`. No admin code change needed — admin reads from DB, not from frontend config.

---

## 10. SAFE IMPLEMENTATION PLAN

### Batch A — Copy-Only i18n (7 changes, 2 files)

Scope: `nl.json`, `en.json` only. Zero code/config changes.


| Change | i18n keys affected                                                                                                                                                         |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #1     | `step0.process3Text`, `step0.noticeText`, `step8.nextStep3Text`                                                                                                            |
| #2     | `step0.doc2` (remove bankafschrift mention, replace with nationaliteitverklaring)                                                                                          |
| #3a    | `step0.noticeText` (append exclusion clause)                                                                                                                               |
| #3b    | `step0.noticeText` (append unemployed in-person clause)                                                                                                                    |
| #4     | `step3.title`, `step3.description`, `step7.sectionHousehold`, `wizard.steps.household`, `wizard.phases.household`, `step7.sectionChildren` (update "huishouden" → "gezin") |
| #5     | `step3.householdSize`, `step3.householdSizePlaceholder`, `step3.householdSizeHelp`, `validation.householdSizeRequired/Min/Max`                                             |
| #6     | `reasons.new_construction`                                                                                                                                                 |
| #7     | `step6.infoText` (append clarity warning)                                                                                                                                  |
| #10    | `step6.infoText` or new key (append own-name requirement)                                                                                                                  |


### Batch B — Document Config Change (3 changes, 4-5 files)

Scope: Replace BANK_STATEMENT with NATIONALITY_DECLARATION

1. `src/config/documentRequirements.ts` — swap entry
2. `src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx` — update variable + document_code
3. `supabase/functions/submit-bouwsubsidie-application/index.ts` — update MANDATORY_DOCUMENT_CODES
4. `nl.json` / `en.json` — update `checkBankStatement` → `checkNationalityDeclaration`, `documents.NATIONALITY_DECLARATION`, `errors.mandatoryDocumentsMissing`

---

## 11. RISKS IF IMPLEMENTED INCORRECTLY


| Risk                                                           | Consequence                                                 |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| BANK_STATEMENT removed from config but not from Edge Function  | Server rejects all submissions                              |
| New doc code added to Edge Function but not to frontend config | Gate never satisfies for new doc                            |
| Income proof validation accidentally broken                    | Regression to the bug just fixed                            |
| i18n key mismatch between label and document_code              | Document shows raw key instead of translated label          |
| DB migration missed for new document_code                      | Admin "Required Documents" panel may not recognize new code |


---

**NOTE — Approved as analysis and safe execution baseline, with these constraints:**

1. Batch A (copy-only i18n) may proceed first.

2. Before Batch B is implemented, verify whether subsidy_document_requirement

   requires an active-record update / insert for NATIONALITY_DECLARATION and

   deactivation of BANK_STATEMENT.

3. Do not assume this is frontend-only.

   Batch B must preserve exact alignment across:

   - documentRequirements config

   - Step6 gating logic

   - Edge Function mandatory document validation

   - i18n document labels and checklist labels

   - admin readability of old and new document codes

4. Preserve the already-fixed income proof logic.

   NATIONALITY_DECLARATION must replace BANK_STATEMENT only as the second mandatory document.

   Income proof documents (loonstrook, AOV, pensioenverklaring, werkgeversverklaring) must remain unchanged.

5. After implementation, run a targeted smoke test for:

   - Step 0 copy

   - Step 3 terminology

   - Step 5 dropdown option

   - Step 6 document gate

   - Step 7 review labels

   - Step 8 receipt wording

Stop after the implementation report and smoke test.

Do not continue to Phase 10 automatically.  
  
1**2. RECOMMENDED EXECUTION ORDER**

1. **Batch A first** — all copy-only i18n changes (zero risk)
2. **Batch B second** — document config swap (coordinated, higher risk)
3. **Post-implementation verification** — walk through Steps 0, 3, 5, 6, 7 confirming labels and gating

**DB consideration for Batch B:** The `subsidy_document_requirement` table may need `BANK_STATEMENT` set to `is_active = false` and `NATIONALITY_DECLARATION` inserted. This should be verified before Batch B implementation.