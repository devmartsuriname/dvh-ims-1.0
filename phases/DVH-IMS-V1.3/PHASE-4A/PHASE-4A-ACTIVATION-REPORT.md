# DVH-IMS V1.3 Phase 4A — Activation Report

## Document Type: Implementation Report
## Version: 1.0
## Date: 2026-01-30
## Phase: Phase 4A — Social Field Worker Activation (Bouwsubsidie Only)

---

## 1. Executive Summary

Phase 4A has been successfully completed. The **Social Field Worker** role has been activated for the Bouwsubsidie service with full RBAC enforcement, dossier state transition constraints, and audit logging.

---

## 2. Implementation Summary

### 2.1 Database Changes

| Change | Status |
|--------|--------|
| Added `social_field_worker` to `app_role` enum | ✅ COMPLETE |
| Updated `validate_subsidy_case_transition()` trigger | ✅ COMPLETE |
| Created 12 RLS policies for social_field_worker | ✅ COMPLETE |

### 2.2 New Status Values (Bouwsubsidie Only)

| Status | Description |
|--------|-------------|
| `in_social_review` | Case is being reviewed by Social Field Worker |
| `social_completed` | Social assessment completed, ready for screening |
| `returned_to_intake` | Returned to intake for additional information |

### 2.3 TypeScript Updates

| File | Change |
|------|--------|
| `src/hooks/useUserRole.ts` | Added `social_field_worker` to `AppRole` type |
| `src/hooks/useAuditLog.ts` | Added social assessment audit actions |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | Added new status transitions and badges |

---

## 3. Transition Matrix (Updated)

### 3.1 Bouwsubsidie Workflow (Phase 4A)

```text
received → in_social_review → social_completed → screening → 
           needs_more_docs/fieldwork → approved_for_council → 
           council_doc_generated → finalized

           (any non-terminal) → rejected
           in_social_review → returned_to_intake → in_social_review
```

### 3.2 Backward Compatibility

| Transition | Status |
|------------|--------|
| `received → screening` | ✅ PRESERVED (for cases not requiring social review) |
| All existing V1.1 transitions | ✅ UNCHANGED |

---

## 4. RLS Policies Created

| # | Policy Name | Table | Operation |
|---|-------------|-------|-----------|
| 1 | `social_field_worker_select_subsidy_case` | subsidy_case | SELECT |
| 2 | `social_field_worker_update_subsidy_case` | subsidy_case | UPDATE |
| 3 | `social_field_worker_select_person` | person | SELECT |
| 4 | `social_field_worker_select_household` | household | SELECT |
| 5 | `social_field_worker_select_social_report` | social_report | SELECT |
| 6 | `social_field_worker_insert_social_report` | social_report | INSERT |
| 7 | `social_field_worker_update_social_report` | social_report | UPDATE |
| 8 | `social_field_worker_insert_audit_event` | audit_event | INSERT |
| 9 | `social_field_worker_select_admin_notification` | admin_notification | SELECT |
| 10 | `social_field_worker_update_admin_notification` | admin_notification | UPDATE |
| 11 | `social_field_worker_insert_subsidy_status_history` | subsidy_case_status_history | INSERT |
| 12 | `social_field_worker_select_subsidy_status_history` | subsidy_case_status_history | SELECT |

---

## 5. Audit Events Enabled

| Action | Entity Type | Trigger |
|--------|-------------|---------|
| `SOCIAL_ASSESSMENT_STARTED` | subsidy_case | Status → in_social_review |
| `SOCIAL_ASSESSMENT_COMPLETED` | subsidy_case | Status → social_completed |
| `SOCIAL_ASSESSMENT_RETURNED` | subsidy_case | Status → returned_to_intake |

---

## 6. Unchanged Components

| Component | Status |
|-----------|--------|
| Woningregistratie workflow | NO CHANGES |
| `validate_housing_registration_transition()` trigger | NO CHANGES |
| Existing 7 roles | UNCHANGED permissions |
| UI navigation/menus | NO CHANGES |

---

## 7. Security Verification

| Check | Result |
|-------|--------|
| social_field_worker is district-scoped | ✅ VERIFIED |
| social_field_worker cannot access other districts | ✅ VERIFIED (via RLS) |
| social_field_worker cannot modify cases outside social review | ✅ VERIFIED (via RLS) |
| All actions are audited | ✅ VERIFIED |

---

## 8. Linter Warnings

The security linter reported 11 pre-existing warnings related to:
- Anonymous insert policies for public wizard (EXISTING, NOT RELATED TO PHASE 4A)

No new warnings were introduced by Phase 4A.

---

## 9. Governance Confirmation

| Rule | Status |
|------|--------|
| Only social_field_worker role activated | ✅ CONFIRMED |
| Bouwsubsidie only (Woningregistratie unchanged) | ✅ CONFIRMED |
| No UI navigation changes | ✅ CONFIRMED |
| No user accounts created | ✅ CONFIRMED |
| No roles assigned to users | ✅ CONFIRMED |

---

**PHASE 4A ACTIVATION COMPLETE**
