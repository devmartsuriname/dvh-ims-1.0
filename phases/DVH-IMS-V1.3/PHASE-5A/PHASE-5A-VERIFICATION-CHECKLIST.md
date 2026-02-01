# DVH-IMS V1.3 — PHASE 5A VERIFICATION CHECKLIST

**Date:** 2026-02-01  
**Verifier:** Lovable System  
**Phase:** V1.3 Phase 5A — Public Wizard: Document Upload + NL Localization  
**Status:** COMPLETE

---

## SECTION A — PRE-CONDITIONS & GOVERNANCE

### A1. Restore Point created BEFORE Phase 5A execution

**Status:** ☑ Complete  
**Evidence:** `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE5A_START.md`

### A2. Restore Point created AFTER Phase 5A completion

**Status:** ☑ Complete  
**Evidence:** `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE5A_COMPLETE.md`

### A3. No scope expansion detected

**Status:** ☑ Verified  
- No admin localization
- No new roles
- No public accounts
- No workflow changes outside wizard

---

## SECTION B — DOCUMENT UPLOAD

| ID | Requirement | Status | Evidence |
|----|-------------|--------|----------|
| B1 | Document upload is MANDATORY | ☑ Complete | 6 mandatory docs in constants.ts |
| B2 | Wizard blocks without docs | ☑ Complete | nextDisabled={!allMandatoryUploaded} |
| B3 | Toggle removed | ☑ Complete | Step6Documents rebuilt with dropzone |
| B4 | Docs linked to dossier | ☑ Complete | Edge Function creates subsidy_document_upload |
| B5 | Metadata stored | ☑ Complete | file_path, file_name, uploaded_at |
| B6 | Admin can view docs | ☑ Complete | Staff RLS policy on storage |
| B7 | Missing docs block review | ☑ Complete | UI enforcement |
| B8 | File type restrictions | ☑ Complete | PDF/JPG/PNG only |

---

## SECTION C — NL LOCALIZATION

| ID | Requirement | Status | Evidence |
|----|-------------|--------|----------|
| C1 | i18n framework | ☑ Complete | react-i18next installed |
| C2 | NL default | ☑ Complete | lng: 'nl' in config |
| C3 | EN available | ☑ Complete | LanguageSwitcher component |
| C4 | All steps localized | ☑ Complete | All 9 steps use t() |
| C5 | No hardcoded text | ☑ Verified | labelKey pattern used |
| C6 | Admin EN-only | ☑ Verified | No i18n in admin |

---

## SECTION D — SCOPE PROTECTION

| ID | Requirement | Status | Evidence |
|----|-------------|--------|----------|
| D1 | Housing unchanged | ☑ Verified | No i18n imports |
| D2 | No auth changes | ☑ Verified | Anonymous flow preserved |
| D3 | No admin UI changes | ☑ Verified | English labels remain |

---

## SECTION E — TESTING

| ID | Test Case | Result | Evidence |
|----|-----------|--------|----------|
| E1 | Cannot submit without uploads | ☑ Pass | UI blocks progression |
| E2 | Docs visible in admin | ☑ Pass | subsidy_document_upload linked |
| E3 | NL default, EN switch | ☑ Pass | Screenshot verified |
| E4 | No regression | ☑ Pass | Triggers unchanged |

---

## SECTION F — DOCUMENTATION

| ID | Artifact | Status | Path |
|----|----------|--------|------|
| F1 | Upload Report | ☑ Complete | phases/DVH-IMS-V1.3/PHASE-5A/PHASE-5A-WIZARD-UPLOAD-REPORT.md |
| F2 | Localization Report | ☑ Complete | phases/DVH-IMS-V1.3/PHASE-5A/PHASE-5A-LOCALIZATION-REPORT.md |
| F3 | Verification Checklist | ☑ Complete | phases/DVH-IMS-V1.3/PHASE-5A/PHASE-5A-VERIFICATION-CHECKLIST.md |

---

## FINAL GOVERNANCE DECISION

### Phase 5A Status: ☑ FULLY COMPLIANT

All requirements implemented. Ready for next phase authorization.

---

**END OF VERIFICATION CHECKLIST**
