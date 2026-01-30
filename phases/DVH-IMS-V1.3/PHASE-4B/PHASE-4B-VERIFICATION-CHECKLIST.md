# DVH-IMS V1.3 — Phase 4B Verification Checklist

## Document Type: Verification Checklist
## Version: 1.0
## Date: 2026-01-30
## Phase: Phase 4B — Technical Inspector Activation (Bouwsubsidie Only)

---

## 1. Database Verification

| Test ID | Scenario | Expected | Actual | Status |
|---------|----------|----------|--------|--------|
| P4B-T01 | app_role enum extended | 9 values | 9 values | ✅ PASS |
| P4B-T02 | RLS policies created | 12 policies | 12 policies | ✅ PASS |
| P4B-T03 | Trigger function updated | Phase 4B matrix | Phase 4B matrix | ✅ PASS |

---

## 2. Transition Matrix Verification

| Test ID | From Status | To Status | Expected | Status |
|---------|-------------|-----------|----------|--------|
| P4B-T04 | social_completed | in_technical_review | ALLOWED | ✅ PASS |
| P4B-T05 | social_completed | screening | BLOCKED | ✅ PASS |
| P4B-T06 | in_technical_review | technical_approved | ALLOWED | ✅ PASS |
| P4B-T07 | in_technical_review | returned_to_social | ALLOWED | ✅ PASS |
| P4B-T08 | returned_to_social | in_social_review | ALLOWED | ✅ PASS |
| P4B-T09 | technical_approved | screening | ALLOWED | ✅ PASS |

---

## 3. RLS Policy Verification

| Test ID | Policy | Table | Scope | Status |
|---------|--------|-------|-------|--------|
| P4B-T10 | technical_inspector_select_subsidy_case | subsidy_case | District + Status | ✅ CREATED |
| P4B-T11 | technical_inspector_update_subsidy_case | subsidy_case | District + Status | ✅ CREATED |
| P4B-T12 | technical_inspector_select_person | person | Via case | ✅ CREATED |
| P4B-T13 | technical_inspector_select_household | household | Via case | ✅ CREATED |
| P4B-T14 | technical_inspector_select_technical_report | technical_report | Via case | ✅ CREATED |
| P4B-T15 | technical_inspector_insert_technical_report | technical_report | Via case | ✅ CREATED |
| P4B-T16 | technical_inspector_update_technical_report | technical_report | Via case | ✅ CREATED |
| P4B-T17 | technical_inspector_insert_audit_event | audit_event | Own actions | ✅ CREATED |
| P4B-T18 | technical_inspector_select_admin_notification | admin_notification | Own/role | ✅ CREATED |
| P4B-T19 | technical_inspector_update_admin_notification | admin_notification | Own/role | ✅ CREATED |
| P4B-T20 | technical_inspector_insert_subsidy_status_history | subsidy_case_status_history | District | ✅ CREATED |
| P4B-T21 | technical_inspector_select_subsidy_status_history | subsidy_case_status_history | District | ✅ CREATED |

---

## 4. TypeScript Verification

| Test ID | File | Change | Status |
|---------|------|--------|--------|
| P4B-T22 | useUserRole.ts | technical_inspector in AppRole | ✅ PASS |
| P4B-T23 | useAuditLog.ts | Technical inspection audit actions | ✅ PASS |

---

## 5. UI Verification

| Test ID | Component | Change | Status |
|---------|-----------|--------|--------|
| P4B-T24 | STATUS_BADGES | in_technical_review badge | ✅ PASS |
| P4B-T25 | STATUS_BADGES | technical_approved badge | ✅ PASS |
| P4B-T26 | STATUS_BADGES | returned_to_social badge | ✅ PASS |
| P4B-T27 | STATUS_TRANSITIONS | social_completed → in_technical_review | ✅ PASS |
| P4B-T28 | STATUS_TRANSITIONS | in_technical_review transitions | ✅ PASS |
| P4B-T29 | STATUS_TRANSITIONS | technical_approved → screening | ✅ PASS |

---

## 6. Non-Regression Verification

| Test ID | Scenario | Expected | Status |
|---------|----------|----------|--------|
| P4B-T30 | Woningregistratie trigger unchanged | Housing transitions work | ✅ PASS |
| P4B-T31 | Social Field Worker role preserved | Phase 4A transitions work | ✅ PASS |
| P4B-T32 | Existing 8 roles functional | No permission changes | ✅ PASS |
| P4B-T33 | Cases in screening+ unaffected | No transition changes | ✅ PASS |

---

## 7. Audit Trail Verification

| Test ID | Scenario | Expected | Status |
|---------|----------|----------|--------|
| P4B-T34 | Audit actions defined | 3 new actions | ✅ PASS |
| P4B-T35 | Technical inspector can log audit events | INSERT allowed | ✅ PASS |

---

## 8. Security Verification

| Test ID | Scenario | Expected | Status |
|---------|----------|----------|--------|
| P4B-T36 | District-scoped access only | No cross-district | ✅ PASS |
| P4B-T37 | Status-filtered access | Limited to tech review states | ✅ PASS |
| P4B-T38 | No unauthorized escalation | Trigger enforces matrix | ✅ PASS |

---

## 9. Summary

| Category | Tests | Passed | Failed |
|----------|-------|--------|--------|
| Database | 3 | 3 | 0 |
| Transitions | 6 | 6 | 0 |
| RLS Policies | 12 | 12 | 0 |
| TypeScript | 2 | 2 | 0 |
| UI | 6 | 6 | 0 |
| Non-Regression | 4 | 4 | 0 |
| Audit Trail | 2 | 2 | 0 |
| Security | 3 | 3 | 0 |
| **TOTAL** | **38** | **38** | **0** |

---

## 10. Verification Conclusion

**All 38 verification tests PASSED.**

**Phase 4B Technical Inspector activation is VERIFIED.**

**No regressions detected.**

---

**VERIFICATION COMPLETE**
