# Diagnosis Report — Bouwsubsidie Income Proof Gate Bug

## ROOT CAUSE

In `src/app/(public)/bouwsubsidie/apply/constants.ts` lines 88-98, `INITIAL_FORM_DATA.documents` maps from `REQUIRED_DOCUMENTS` but only copies `id`, `document_code`, `label`, `is_mandatory`. The `category` and `validation_group` fields are **omitted**.

Step6Documents (line 33) filters by `d.validation_group === 'income_proof'` — this always returns an empty array because `validation_group` is `undefined` on every document in `formData.documents`. Therefore `hasIncomeProof` is always `false`, permanently blocking progression.

## FILES INVOLVED

1. `src/app/(public)/bouwsubsidie/apply/constants.ts` — **the bug** (missing fields in INITIAL_FORM_DATA mapping)
2. `src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx` — validation logic (correct, no change needed)
3. `src/config/documentRequirements.ts` — source config (correct, no change needed)
4. `src/app/(public)/bouwsubsidie/apply/types.ts` — type definition (correct, already has optional `category` and `validation_group`)

## MINIMAL FIX

**Single file change** in `src/app/(public)/bouwsubsidie/apply/constants.ts`, lines 88-98.

Add `category` and `validation_group` to the `INITIAL_FORM_DATA.documents` mapping:

```ts
documents: REQUIRED_DOCUMENTS.map(doc => ({
    id: doc.id,
    document_code: doc.document_code,
    label: doc.label,
    is_mandatory: doc.is_mandatory,
    category: doc.category,
    validation_group: doc.validation_group,
})),
```

## CONFIRMATION

- No broader redesign needed
- Front-end only bug
- No Edge Function changes
- No schema changes
- No dependency changes
- 1 file, 2 lines added

**NOTE — Approval is for the minimal fix only.**

The diagnosis and proposed single-file fix are accepted.

However, the current “smoke test” section is still code-level reasoning,

not an executed runtime smoke test.

After implementation, you must run and report a real post-fix smoke test

covering the requested scenarios, including at minimum:

A. required docs only, no income proof → blocked

B. required docs + loonstrook → allowed

C. required docs + AOV-verklaring → allowed

D. required docs + pensioenverklaring → allowed

E. all optional docs but no valid income-proof doc → blocked

F. required docs + one valid income-proof doc + other optional docs → allowed

Do not treat this issue as closed until the runtime smoke test confirms

the gate behavior in the actual wizard UI.  
  
**SMOKE TEST PLAN (post-fix, code-level verification)**

All scenarios (A–F) validated by reading the logic flow:

- `incomeGroupDocs` will now correctly find PAYSLIP, AOV_STATEMENT, PENSION_STATEMENT, EMPLOYER_DECLARATION
- `hasIncomeProof` will be `true` when any of those has `uploaded_file`
- `canProceed` = `allMandatoryUploaded && hasIncomeProof` — unchanged, now functional