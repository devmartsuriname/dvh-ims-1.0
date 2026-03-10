# Restore Point — Phase 9E: Bouwsubsidie Wizard Screening Fixes

**Restore Point ID:** 9E-SCREENING-FIXES  
**Audit Reference:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B  
**Date:** 2026-03-10

## Changes Applied

### Batch A — Copy-Only i18n (nl.json + en.json)

| # | Change |
|---|--------|
| 1 | "gecontacteerd" → "geïnformeerd" in step0 + step8 |
| 2 | Intro doc2: bankafschrift → nationaliteitverklaring |
| 3a | Important notice: previous subsidy exclusion clause added |
| 3b | Important notice: unemployed must report in person |
| 4 | "Huishoudgegevens" → "Gezinsamenstelling" (title, review, wizard steps, phases) |
| 5 | "Huishoudgrootte" → "Gezinsgrootte" (field + validation messages) |
| 6 | "Nieuwbouw" → "Afbouw woning" |
| 7 | Step 6 info: unclear docs warning added |
| 10 | Step 6 info: documents must be in applicant's own name |

### Batch B — Document Config Swap

| File | Change |
|------|--------|
| `src/config/documentRequirements.ts` | BANK_STATEMENT → NATIONALITY_DECLARATION (mandatory, category: identity) |
| `src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx` | bankStatementUploaded → nationalityDeclarationUploaded, checklist key updated |
| `supabase/functions/submit-bouwsubsidie-application/index.ts` | MANDATORY_DOCUMENT_CODES updated |
| `nl.json` / `en.json` | checkBankStatement → checkNationalityDeclaration, NATIONALITY_DECLARATION label added, error messages updated |

### DB Migration Required (NOT yet applied)

The `subsidy_document_requirement` table needs:
1. `BANK_STATEMENT` row: set `is_active = false`
2. New row: `NATIONALITY_DECLARATION`, `is_mandatory = true`, `category = 'identity'`, `is_active = true`

## Files Modified

- `src/i18n/locales/nl.json`
- `src/i18n/locales/en.json`
- `src/config/documentRequirements.ts`
- `src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx`
- `supabase/functions/submit-bouwsubsidie-application/index.ts`

## Income Proof Logic

UNCHANGED. validation_group === 'income_proof' remains intact for PAYSLIP, AOV_STATEMENT, PENSION_STATEMENT, EMPLOYER_DECLARATION.
