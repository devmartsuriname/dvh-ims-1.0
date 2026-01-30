# DVH-IMS V1.3 — Phase 4B Restore Point (START)

## Restore Point Type: PRE-PHASE SNAPSHOT
## Version: V1.3-PHASE-4B-START
## Created: 2026-01-30
## Phase: Phase 4B — Technical Inspector Activation (Bouwsubsidie Only)

---

## 1. Authorization Context

| Item | Status |
|------|--------|
| DVH-IMS V1.1 | OPERATIONAL (LIVE) |
| DVH-IMS V1.2 | CLOSED (Documentation Only) |
| V1.3 Phase 1 (D-01 + D-02) | CLOSED & LOCKED |
| V1.3 Phase 2 (S-03) | CLOSED & LOCKED |
| V1.3 Phase 3 (Preparation) | CLOSED & LOCKED |
| V1.3 Phase 4A (Social Field Worker) | CLOSED & LOCKED |
| V1.3 Phase 4B | STARTING |

---

## 2. Pre-Phase State Summary

### 2.1 Current app_role Enum (8 values)

```text
system_admin
minister
project_leader
frontdesk_bouwsubsidie
frontdesk_housing
admin_staff
audit
social_field_worker
```

### 2.2 Current Bouwsubsidie Workflow

```text
received → in_social_review → social_completed → screening → 
           needs_more_docs → fieldwork → approved_for_council → 
           council_doc_generated → finalized
           (any non-terminal) → rejected
```

### 2.3 Current RLS Policy Count

| Table | Policies |
|-------|----------|
| subsidy_case | 7 (including social_field_worker) |
| social_report | 6 (including social_field_worker) |
| audit_event | 4 |
| admin_notification | 5 |

---

## 3. Intended Changes (Phase 4B Scope)

| Change | Description |
|--------|-------------|
| Enum Extension | Add `technical_inspector` to app_role |
| Trigger Update | Add technical review states to subsidy_case transition trigger |
| RLS Policies | Create 12 policies for technical_inspector |
| TypeScript | Add technical_inspector to AppRole |
| UI | Add technical review status badges and transitions |

---

## 4. Rollback Instructions

### 4.1 Database Rollback

```sql
-- Drop Phase 4B RLS policies
DROP POLICY IF EXISTS "technical_inspector_select_subsidy_case" ON public.subsidy_case;
DROP POLICY IF EXISTS "technical_inspector_update_subsidy_case" ON public.subsidy_case;
DROP POLICY IF EXISTS "technical_inspector_select_person" ON public.person;
DROP POLICY IF EXISTS "technical_inspector_select_household" ON public.household;
DROP POLICY IF EXISTS "technical_inspector_select_technical_report" ON public.technical_report;
DROP POLICY IF EXISTS "technical_inspector_insert_technical_report" ON public.technical_report;
DROP POLICY IF EXISTS "technical_inspector_update_technical_report" ON public.technical_report;
DROP POLICY IF EXISTS "technical_inspector_insert_audit_event" ON public.audit_event;
DROP POLICY IF EXISTS "technical_inspector_select_admin_notification" ON public.admin_notification;
DROP POLICY IF EXISTS "technical_inspector_update_admin_notification" ON public.admin_notification;
DROP POLICY IF EXISTS "technical_inspector_insert_subsidy_status_history" ON public.subsidy_case_status_history;
DROP POLICY IF EXISTS "technical_inspector_select_subsidy_status_history" ON public.subsidy_case_status_history;

-- Revert trigger to Phase 4A transition matrix
-- (Execute Phase 4A migration trigger creation SQL)

-- Note: Enum value cannot be dropped, but will be inert
```

### 4.2 Application Rollback

1. Git revert TypeScript changes to useUserRole.ts, useAuditLog.ts
2. Git revert UI changes to subsidy-cases/[id]/page.tsx
3. Redeploy

---

## 5. Files Captured (Pre-Phase State)

| File | State |
|------|-------|
| src/hooks/useUserRole.ts | social_field_worker included |
| src/hooks/useAuditLog.ts | Social review audit actions included |
| src/app/(admin)/subsidy-cases/[id]/page.tsx | Social review states in UI |
| validate_subsidy_case_transition() | Phase 4A transition matrix |

---

## 6. Restore Point Verification

| Check | Status |
|-------|--------|
| Pre-phase state documented | ✅ |
| Rollback instructions provided | ✅ |
| Authorization context recorded | ✅ |
| Intended changes listed | ✅ |

---

**RESTORE POINT CREATED: V1.3-PHASE-4B-START**

**Phase 4B implementation may now proceed.**
