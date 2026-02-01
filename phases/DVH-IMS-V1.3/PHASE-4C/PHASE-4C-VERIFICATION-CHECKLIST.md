# DVH-IMS V1.3 — Phase 4C Verification Checklist

## Document Type: Verification Evidence
## Version: 1.0
## Date: 2026-02-01
## Phase: Phase 4C — Administrative Officer Workflow Activation

---

## 1. Database Verification

### 1.1 Enum Verification

| Test ID | Scenario | Expected | Result |
|---------|----------|----------|--------|
| P4C-T01 | app_role enum count | 9 values (unchanged from Phase 4B) | ✅ PASS |

**Verification Query:**
```sql
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public.app_role'::regtype ORDER BY enumsortorder;
```

**Expected Result:**
1. system_admin
2. minister
3. project_leader
4. frontdesk_bouwsubsidie
5. frontdesk_housing
6. admin_staff
7. audit
8. social_field_worker
9. technical_inspector

### 1.2 Trigger Function Verification

| Test ID | Scenario | Expected | Result |
|---------|----------|----------|--------|
| P4C-T02 | Transition technical_approved → in_admin_review | ALLOWED | ✅ PASS |
| P4C-T03 | Transition in_admin_review → admin_complete | ALLOWED | ✅ PASS |
| P4C-T04 | Transition technical_approved → screening | BLOCKED | ✅ PASS |
| P4C-T05 | Transition in_admin_review → returned_to_technical | ALLOWED | ✅ PASS |
| P4C-T06 | Transition returned_to_technical → in_technical_review | ALLOWED | ✅ PASS |
| P4C-T07 | Transition admin_complete → screening | ALLOWED | ✅ PASS |

---

## 2. RLS Policy Verification

### 2.1 admin_staff Role Access

| Test ID | Scenario | Expected | Result |
|---------|----------|----------|--------|
| P4C-T08 | admin_staff can SELECT case in in_admin_review | Access granted | ✅ PASS |
| P4C-T09 | admin_staff can UPDATE case in in_admin_review | Update succeeds | ✅ PASS |
| P4C-T10 | admin_staff can SELECT case in admin_complete | Access granted | ✅ PASS |

**Note:** Existing admin_staff policies are status-agnostic for district-scoped access.

---

## 3. Previous Phase Preservation

### 3.1 Social Field Worker (Phase 4A)

| Test ID | Scenario | Expected | Result |
|---------|----------|----------|--------|
| P4C-T11 | social_field_worker can SELECT case in in_social_review | Access granted | ✅ PASS |
| P4C-T12 | social_field_worker can UPDATE case in in_social_review | Update succeeds | ✅ PASS |
| P4C-T13 | Transition in_social_review → social_completed | ALLOWED | ✅ PASS |

### 3.2 Technical Inspector (Phase 4B)

| Test ID | Scenario | Expected | Result |
|---------|----------|----------|--------|
| P4C-T14 | technical_inspector can SELECT case in in_technical_review | Access granted | ✅ PASS |
| P4C-T15 | technical_inspector can UPDATE case in in_technical_review | Update succeeds | ✅ PASS |
| P4C-T16 | Transition in_technical_review → technical_approved | ALLOWED | ✅ PASS |

---

## 4. Woningregistratie Isolation

| Test ID | Scenario | Expected | Result |
|---------|----------|----------|--------|
| P4C-T17 | Housing registration trigger unchanged | No admin review states | ✅ PASS |
| P4C-T18 | Housing workflow received → under_review | ALLOWED | ✅ PASS |
| P4C-T19 | Housing workflow under_review → urgency_assessed | ALLOWED | ✅ PASS |

---

## 5. Application Verification

### 5.1 TypeScript Updates

| Test ID | Scenario | Expected | Result |
|---------|----------|----------|--------|
| P4C-T20 | AuditAction includes ADMIN_REVIEW_STARTED | Type definition present | ✅ PASS |
| P4C-T21 | AuditAction includes ADMIN_REVIEW_COMPLETED | Type definition present | ✅ PASS |
| P4C-T22 | AuditAction includes ADMIN_REVIEW_RETURNED | Type definition present | ✅ PASS |

### 5.2 UI Updates

| Test ID | Scenario | Expected | Result |
|---------|----------|----------|--------|
| P4C-T23 | STATUS_BADGES includes in_admin_review | Badge configured (info) | ✅ PASS |
| P4C-T24 | STATUS_BADGES includes admin_complete | Badge configured (success) | ✅ PASS |
| P4C-T25 | STATUS_BADGES includes returned_to_technical | Badge configured (warning) | ✅ PASS |
| P4C-T26 | STATUS_TRANSITIONS technical_approved → in_admin_review | Transition defined | ✅ PASS |
| P4C-T27 | STATUS_TRANSITIONS in_admin_review → admin_complete | Transition defined | ✅ PASS |
| P4C-T28 | STATUS_TRANSITIONS admin_complete → screening | Transition defined | ✅ PASS |

---

## 6. Audit Logging Verification

| Test ID | Scenario | Expected | Result |
|---------|----------|----------|--------|
| P4C-T29 | Invalid transition logs to audit_event | INVALID_TRANSITION_BLOCKED logged | ✅ PASS |
| P4C-T30 | Audit includes actor_role | Role captured | ✅ PASS |
| P4C-T31 | Audit includes correlation_id | Correlation ID generated | ✅ PASS |

---

## 7. Backward Compatibility

| Test ID | Scenario | Expected | Result |
|---------|----------|----------|--------|
| P4C-T32 | Cases in screening unaffected | Process normally | ✅ PASS |
| P4C-T33 | Cases in fieldwork unaffected | Process normally | ✅ PASS |
| P4C-T34 | Cases in finalized unaffected | Remain terminal | ✅ PASS |

---

## 8. Summary

| Category | Tests | Passed | Failed |
|----------|-------|--------|--------|
| Database | 7 | 7 | 0 |
| RLS Policies | 3 | 3 | 0 |
| Phase 4A Preservation | 3 | 3 | 0 |
| Phase 4B Preservation | 3 | 3 | 0 |
| Woningregistratie Isolation | 3 | 3 | 0 |
| TypeScript | 3 | 3 | 0 |
| UI | 6 | 6 | 0 |
| Audit Logging | 3 | 3 | 0 |
| Backward Compatibility | 3 | 3 | 0 |
| **TOTAL** | **34** | **34** | **0** |

---

## 9. Verification Sign-Off

| Check | Status |
|-------|--------|
| All tests passed | ✓ |
| No regressions detected | ✓ |
| Woningregistratie unchanged | ✓ |
| Phase 4A/4B functionality preserved | ✓ |
| Admin review workflow active | ✓ |

---

**PHASE 4C VERIFICATION COMPLETE — ALL 34 TESTS PASSED**

---

**END OF VERIFICATION CHECKLIST**
