# DVH-IMS V1.3 — Phase 4B Activation Report

## Document Type: Implementation Report
## Version: 1.0
## Date: 2026-01-30
## Phase: Phase 4B — Technical Inspector Activation (Bouwsubsidie Only)

---

## 1. Activation Summary

| Item | Status |
|------|--------|
| Role Activated | `technical_inspector` |
| Module Affected | Bouwsubsidie ONLY |
| Woningregistratie | UNCHANGED |
| Enum Extended | ✅ 9 values total |
| Trigger Updated | ✅ Phase 4B transition matrix |
| RLS Policies Created | ✅ 12 policies |
| TypeScript Updated | ✅ AppRole + AuditAction |
| UI Updated | ✅ Status badges + transitions |

---

## 2. Database Changes Executed

### 2.1 Enum Extension

```sql
ALTER TYPE public.app_role ADD VALUE 'technical_inspector';
```

**Result:** `app_role` enum now has 9 values:
1. system_admin
2. minister
3. project_leader
4. frontdesk_bouwsubsidie
5. frontdesk_housing
6. admin_staff
7. audit
8. social_field_worker
9. **technical_inspector** (NEW)

### 2.2 Trigger Update

Function `validate_subsidy_case_transition()` updated to enforce:

| From Status | Allowed Transitions |
|-------------|---------------------|
| received | in_social_review, screening, rejected |
| in_social_review | social_completed, returned_to_intake, rejected |
| returned_to_intake | in_social_review, rejected |
| social_completed | **in_technical_review**, rejected |
| **in_technical_review** | technical_approved, returned_to_social, rejected |
| **returned_to_social** | in_social_review, rejected |
| **technical_approved** | screening, rejected |
| screening | needs_more_docs, fieldwork, rejected |
| needs_more_docs | screening, rejected |
| fieldwork | approved_for_council, rejected |
| approved_for_council | council_doc_generated, rejected |
| council_doc_generated | finalized, rejected |
| finalized | (terminal) |
| rejected | (terminal) |

**Key Change:** `social_completed → screening` is NO LONGER ALLOWED. Cases must go through `in_technical_review`.

### 2.3 RLS Policies Created (12 Total)

| # | Policy Name | Table | Operation |
|---|-------------|-------|-----------|
| 1 | technical_inspector_select_subsidy_case | subsidy_case | SELECT |
| 2 | technical_inspector_update_subsidy_case | subsidy_case | UPDATE |
| 3 | technical_inspector_select_person | person | SELECT |
| 4 | technical_inspector_select_household | household | SELECT |
| 5 | technical_inspector_select_technical_report | technical_report | SELECT |
| 6 | technical_inspector_insert_technical_report | technical_report | INSERT |
| 7 | technical_inspector_update_technical_report | technical_report | UPDATE |
| 8 | technical_inspector_insert_audit_event | audit_event | INSERT |
| 9 | technical_inspector_select_admin_notification | admin_notification | SELECT |
| 10 | technical_inspector_update_admin_notification | admin_notification | UPDATE |
| 11 | technical_inspector_insert_subsidy_status_history | subsidy_case_status_history | INSERT |
| 12 | technical_inspector_select_subsidy_status_history | subsidy_case_status_history | SELECT |

---

## 3. Application Changes Executed

### 3.1 TypeScript Updates

**File:** `src/hooks/useUserRole.ts`

```typescript
export type AppRole = 
  | 'system_admin'
  | 'minister'
  | 'project_leader'
  | 'frontdesk_bouwsubsidie'
  | 'frontdesk_housing'
  | 'admin_staff'
  | 'audit'
  | 'social_field_worker'
  | 'technical_inspector'  // NEW
```

**File:** `src/hooks/useAuditLog.ts`

Added audit actions:
- `TECHNICAL_INSPECTION_STARTED`
- `TECHNICAL_INSPECTION_COMPLETED`
- `TECHNICAL_INSPECTION_RETURNED`

### 3.2 UI Updates

**File:** `src/app/(admin)/subsidy-cases/[id]/page.tsx`

New status badges added:
- `in_technical_review` → Info badge "In Technical Review"
- `technical_approved` → Success badge "Technical Approved"
- `returned_to_social` → Warning badge "Returned to Social"

Status transitions updated:
- `social_completed` → `in_technical_review` (mandatory)
- `in_technical_review` → `technical_approved`, `returned_to_social`, `rejected`
- `returned_to_social` → `in_social_review`, `rejected`
- `technical_approved` → `screening`, `rejected`

---

## 4. What Was NOT Changed

| Item | Status | Reason |
|------|--------|--------|
| Woningregistratie workflow | UNCHANGED | Out of scope |
| Housing registration trigger | UNCHANGED | Out of scope |
| UI menus/navigation | UNCHANGED | Out of scope |
| Director role | NOT ACTIVATED | Phase 4C scope |
| Ministerial Advisor role | NOT ACTIVATED | Future phase |
| Social Field Worker logic | PRESERVED | Phase 4A stable |
| Existing 8 roles | UNCHANGED | Permissions preserved |

---

## 5. Workflow Impact

### 5.1 Before Phase 4B

```text
received → in_social_review → social_completed → screening → ...
```

### 5.2 After Phase 4B

```text
received → in_social_review → social_completed → in_technical_review → 
           technical_approved → screening → ...
```

### 5.3 Backward Compatibility

- Cases already in `screening` or later: **Unaffected**
- Cases in `social_completed`: **Must proceed to in_technical_review**
- Cases in `received`: **Can still use legacy screening path**

---

## 6. Migration Files

| Migration | Purpose |
|-----------|---------|
| Migration 1 | Enum extension (technical_inspector) |
| Migration 2 | Trigger update + 12 RLS policies |

---

## 7. Activation Confirmation

| Check | Result |
|-------|--------|
| Enum extended to 9 values | ✅ CONFIRMED |
| Trigger enforces technical step | ✅ CONFIRMED |
| RLS policies created (12) | ✅ CONFIRMED |
| TypeScript types updated | ✅ CONFIRMED |
| UI status badges added | ✅ CONFIRMED |
| UI transitions updated | ✅ CONFIRMED |
| Woningregistratie unchanged | ✅ CONFIRMED |
| Social Field Worker preserved | ✅ CONFIRMED |

---

## 8. Security Notes

- All RLS policies are district-scoped
- Technical inspector can only access cases in:
  - `social_completed`
  - `in_technical_review`
  - `returned_to_social`
  - `technical_approved`
- Audit logging enabled for all technical inspector actions
- No cross-district access possible

---

## 9. Linter Results

The security linter reported 11 pre-existing WARN-level issues related to `USING (true)` policies. These are for anonymous public submission flows and are **intentional by design**. No new security issues were introduced by Phase 4B.

---

**PHASE 4B ACTIVATION: COMPLETE**

**Technical Inspector role is now ACTIVE for Bouwsubsidie.**
