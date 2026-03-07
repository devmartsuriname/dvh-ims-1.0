# Restore Point: Phase 6 — Verification & Closure

**Created:** 2026-03-07
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Phase:** 6 — Verification, Closure, and Freeze
**Status:** V1.8 FROZEN — ALL TESTS PASS

---

## DEFECT-001 Resolution

**Migration:** `fix_subsidy_household_child_gender_constraint`
- Dropped constraint `subsidy_household_child_gender_check` (was `('M','V')`)
- Recreated as `CHECK (gender IN ('M', 'F'))`
- No data conversion needed (only `'M'` records existed)

**Edge Function:** `submit-bouwsubsidie-application` redeployed (no code changes)

**Verification:** Case BS-2026-000009 created with 2 children:
- Child 1: M, age 5, no disability ✅
- Child 2: F, age 3, has disability ✅

**Rollback:** `ALTER TABLE public.subsidy_household_child DROP CONSTRAINT subsidy_household_child_gender_check; ALTER TABLE public.subsidy_household_child ADD CONSTRAINT subsidy_household_child_gender_check CHECK (gender IN ('M', 'V'));`

---

## Full Smoke Test Report — DVH-IMS V1.8

### A. Edge Function Validation (submit-bouwsubsidie-application)

| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| NEG-1: Missing ID_COPY | BANK_STATEMENT + PAYSLIP only | MANDATORY_DOCUMENTS_MISSING | MANDATORY_DOCUMENTS_MISSING | **PASS** |
| NEG-2: Missing income proof | ID_COPY + BANK_STATEMENT only | INCOME_PROOF_REQUIRED | INCOME_PROOF_REQUIRED | **PASS** |
| POS-1: Full valid + 3 children | ID_COPY + BANK_STATEMENT + PAYSLIP, 3 children (M/F/F) | Case created | BS-2026-000010 created | **PASS** |

### B. Database Persistence

| Table | Verification | Status |
|-------|-------------|--------|
| `subsidy_case` | BS-2026-000010 exists, status=received, district=PAR | **PASS** |
| `subsidy_document_upload` | 3 documents persisted (ID_COPY, BANK_STATEMENT, PAYSLIP) | **PASS** |
| `subsidy_household_child` | 3 children: (10,M,no), (6,F,no), (2,F,yes) with sort_order 1,2,3 | **PASS** |
| `audit_event` | `public_submission` with `children_count:3` + 2x `SUBMISSION_VALIDATION_BLOCKED` | **PASS** |
| Gender distinct values | M, F — both present and valid | **PASS** |

### C. Admin Panel (Browser Verified)

| Test | Result | Status |
|------|--------|--------|
| Login with provided credentials | Dashboard loaded successfully | **PASS** |
| Dashboard | Shows 10 subsidy applications, charts render | **PASS** |
| Subsidy Cases list | All 10 cases displayed with correct data | **PASS** |
| Case detail BS-2026-000010 | Case info, applicant "Smoke FullValid", household size 4 | **PASS** |
| Household Children section | 3 rows: #1 Age 10 Male No, #2 Age 6 Female No, #3 Age 2 Female Yes | **PASS** |
| Documents tab | 3 uploaded docs, all Pending. Required Documents checklist with green indicators | **PASS** |

### D. Document Validation

| Test | Result | Status |
|------|--------|--------|
| Missing mandatory doc → rejection | `MANDATORY_DOCUMENTS_MISSING` returned | **PASS** |
| Missing income proof → rejection | `INCOME_PROOF_REQUIRED` returned | **PASS** |
| Valid document set → accepted | Case BS-2026-000010 created | **PASS** |
| Audit log for blocked submissions | 2 `SUBMISSION_VALIDATION_BLOCKED` entries with correct error codes | **PASS** |

### E. Children Module

| Test | Status |
|------|--------|
| Multiple children submission (3 children) | **PASS** |
| Gender M persists | **PASS** |
| Gender F persists (DEFECT-001 fixed) | **PASS** |
| has_disability=true persists | **PASS** |
| has_disability=false persists | **PASS** |
| sort_order preserved (1, 2, 3) | **PASS** |
| Admin UI displays all children correctly | **PASS** |
| Pre-Phase 5 cases show 0 children | **PASS** |

### F. Boundary Verification

| Boundary | Evidence | Status |
|----------|----------|--------|
| Housing Registration unchanged | 5 recent registrations intact (WR-2026-002967 to WR-2026-002971) | **PASS** |
| Historical subsidy cases readable | BS-2026-000001 through BS-2026-000007 intact | **PASS** |
| `household_member` table unchanged | Zero V1.8 modifications | **PASS** |
| Document requirement configuration stable | No changes since Phase 2 | **PASS** |
| Deprecated document codes | No regression | **PASS** |

---

## Cases Created During Testing

| Case Number | Purpose | Children |
|------------|---------|----------|
| BS-2026-000008 | Phase 3 positive test | 1 (M) |
| BS-2026-000009 | DEFECT-001 verification | 2 (M + F) |
| BS-2026-000010 | Phase 6 full smoke test | 3 (M + F + F) |

---

## Files Modified Across V1.8

| File | Phases |
|------|--------|
| `src/config/documentRequirements.ts` | 2 |
| `src/app/(public)/bouwsubsidie/apply/types.ts` | 2, 5 |
| `src/app/(public)/bouwsubsidie/apply/constants.ts` | 2, 5 |
| `src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx` | 2 |
| `src/app/(public)/bouwsubsidie/apply/steps/Step3Household.tsx` | 5 |
| `src/app/(public)/bouwsubsidie/apply/steps/Step7Review.tsx` | 5 |
| `src/app/(public)/bouwsubsidie/apply/page.tsx` | 3 |
| `supabase/functions/submit-bouwsubsidie-application/index.ts` | 3, 5 |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | 5 |
| `src/i18n/locales/en.json` | 2, 3, 5 |
| `src/i18n/locales/nl.json` | 2, 3, 5 |

## Database Changes

- `subsidy_household_child` constraint: `('M','V')` → `('M','F')` (DEFECT-001 fix)
- No new tables, no new columns, no schema changes

## Pre-existing Issue (Non-V1.8)

- `apexcharts` TypeScript declaration warning (TS1540) — third-party library, not introduced by V1.8, no runtime impact

---

## Final Status

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   DVH-IMS V1.8 — FROZEN                                     ║
║   All smoke tests PASS. Zero defects. Zero regressions.      ║
║   Closure Date: 2026-03-07                                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```
