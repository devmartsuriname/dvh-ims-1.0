# Restore Point: V1.5 Phase 2 Post-Implementation

**ID:** V1.5-Phase2-Post-Implementation
**Created:** 2026-02-08
**Phase:** V1.5 Phase 2 — Operational Control (Assignments)
**Authority:** Delroy

---

## Phase 2 Completion Report

### IMPLEMENTED
- ✅ `case_assignment` table (append-only, uuid PK, FK to subsidy_case)
- ✅ RLS: INSERT restricted to `system_admin` / `project_leader`
- ✅ RLS: SELECT for own assignments + oversight/management roles
- ✅ RLS: UPDATE/DELETE denied (append-only immutability)
- ✅ Audit types: `CASE_ASSIGNED`, `CASE_REASSIGNED`, `CASE_REVOKED`, `CASE_ASSIGNMENT_COMPLETED`
- ✅ Entity type: `case_assignment` added to audit logging
- ✅ `useCaseAssignments` hook with all CRUD operations + audit logging
- ✅ Assignment page at `/case-assignments` with table view
- ✅ Assign Worker modal (case selector, worker selector, mandatory reason)
- ✅ Revoke/Complete modal with mandatory reason
- ✅ Menu item under BOUWSUBSIDIE section with correct role access
- ✅ Route registered in `bouwsubsidieRoutes`

### PARTIAL
- None

### SKIPPED
- None — all planned items implemented

### EXPLICITLY NOT IMPLEMENTED (Out-of-Scope Confirmation)
- ❌ No changes to decision authority or dossier states
- ❌ No workflow automation or routing
- ❌ No workload balancing, KPIs, or time tracking
- ❌ No notifications or escalations
- ❌ No coupling to Archive, Decision, or Woningregistratie flows
- ❌ No background jobs
- ❌ No visit scheduling persistence
- ❌ No changes to existing `assignment_record` table (Woningregistratie)

### VERIFICATION
- ✅ Database migration executed successfully
- ✅ RLS policies use existing `has_any_role` security definer function
- ✅ Audit logging integrated for all assignment actions
- ✅ Role-based access: write for system_admin/project_leader only
- ✅ Person-based assignments (not role-based or team-based)
- ✅ Assignments independent of dossier status (no status transitions triggered)
- ✅ Mandatory reason field on all assignment operations

### PRD-BOUND BEHAVIOR CONFIRMATION
- Assignments are strictly OPERATIONAL task allocations
- Assignments do NOT affect dossier status, decisions, prioritization, or scoring
- Only Projectleider/Onderdirecteur (project_leader) and system_admin can assign/reassign/revoke
- All actions are fully audit-logged with actor, action, target, dossier, timestamp, reason
- No automation, workload steering, notifications, or KPIs

### SCOPE CREEP CONFIRMATION
- ✅ No scope creep detected
- ✅ Implementation matches Phase 2 Planning document exactly

### RESTORE POINT
- Pre-Implementation: `restore-points/v1.5/RESTORE_POINT_V1.5_PHASE2_PRE_IMPLEMENTATION.md`
- Post-Implementation: This file

### BLOCKERS / ERRORS
- NONE

### LINTER WARNINGS
- 13 pre-existing RLS "always true" warnings (not from this migration, existed before Phase 2)

---

## Files Created/Modified

### New Files
- `src/hooks/useCaseAssignments.ts`
- `src/app/(admin)/case-assignments/page.tsx`
- `src/app/(admin)/case-assignments/components/AssignmentFormModal.tsx`
- `src/app/(admin)/case-assignments/components/RevokeModal.tsx`
- `restore-points/v1.5/RESTORE_POINT_V1.5_PHASE2_PRE_IMPLEMENTATION.md`
- `restore-points/v1.5/RESTORE_POINT_V1.5_PHASE2_POST_IMPLEMENTATION.md`

### Modified Files
- `src/hooks/useAuditLog.ts` — Added assignment audit action types and entity type
- `src/routes/index.tsx` — Added `/case-assignments` route
- `src/assets/data/menu-items.ts` — Added Case Assignments menu item

### Database
- Migration: Created `case_assignment` table with RLS policies and indexes
