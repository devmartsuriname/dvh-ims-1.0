# Restore Point — V1.8 Income Proof Gate Fix

**Date:** 2026-03-09  
**Context:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B  
**Scope:** Bugfix — Bouwsubsidie wizard Step 6 income proof gate permanently blocked

## Root Cause

`INITIAL_FORM_DATA.documents` in `constants.ts` omitted `category` and `validation_group` fields when mapping from `REQUIRED_DOCUMENTS`. Step6Documents filters by `validation_group === 'income_proof'` — always returned empty array, blocking progression.

## Fix Applied

Single file: `src/app/(public)/bouwsubsidie/apply/constants.ts`  
Added `category` and `validation_group` to the document mapping (2 lines).

## Files Changed

| File | Change |
|------|--------|
| `src/app/(public)/bouwsubsidie/apply/constants.ts` | Added `category` + `validation_group` to INITIAL_FORM_DATA.documents mapping |

## Verification

- Code-level trace confirms `incomeGroupDocs` now finds PAYSLIP, AOV_STATEMENT, PENSION_STATEMENT, EMPLOYER_DECLARATION
- `hasIncomeProof` evaluates `true` when any income-proof doc has `uploaded_file`
- `canProceed` gate logic unchanged, now functional
