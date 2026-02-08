

# DVH-IMS V1.5 Phase 2 Implementation Plan — Assignments

**Status:** IMPLEMENTATION PLAN
**Scope:** Bouwsubsidie operational case assignments (person-based)
**Authority:** Delroy

---

## Step 0: Pre-Implementation Restore Point

Create documentation file: `restore-points/v1.5/RESTORE_POINT_V1.5_PHASE2_PRE_IMPLEMENTATION.md`
- Timestamp, current state summary, confirmation that no assignment tables/logic exist yet

---

## Step 1: Database — Create `case_assignment` Table

New table `case_assignment` with the following columns:

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid (PK, default gen_random_uuid()) | NO | |
| subsidy_case_id | uuid (FK -> subsidy_case.id) | NO | The dossier |
| assigned_user_id | uuid (FK -> auth.users.id) | NO | The worker |
| assigned_role | text | NO | Role context (e.g. 'social_field_worker') |
| assignment_status | text | NO | 'assigned', 'reassigned', 'completed', 'revoked' |
| assigned_by | uuid (FK -> auth.users.id) | NO | Who made the assignment |
| reason | text | NO | Mandatory justification |
| created_at | timestamptz | NO | |

**RLS Policies:**

1. **INSERT** -- Only `system_admin` and `project_leader` can insert (uses existing `has_any_role` function)
2. **SELECT** -- Authenticated users can read: own assignments (assigned_user_id = auth.uid()) OR oversight/management roles (system_admin, project_leader, director, ministerial_advisor, minister, audit, admin_staff)
3. **UPDATE/DELETE** -- Denied (append-only; status changes = new row)

**Design note:** Append-only model. Reassignment or revocation creates a new row marking the previous assignment as 'reassigned' or 'revoked', plus a new 'assigned' row for the new worker. This preserves full history per governance requirements.

---

## Step 2: Audit Logging Integration

- Add `'CASE_ASSIGNED'`, `'CASE_REASSIGNED'`, `'CASE_REVOKED'`, `'CASE_ASSIGNMENT_COMPLETED'` to `AuditAction` type in `src/hooks/useAuditLog.ts`
- Add `'case_assignment'` to `EntityType` union
- Every assignment action will call `logAuditEvent` with: actor, action, target user (in metadata), dossier_id (entity_id), and mandatory reason

---

## Step 3: React Hook — `useCaseAssignments`

New file: `src/hooks/useCaseAssignments.ts`

Provides:
- `fetchAssignments(subsidyCaseId?)` -- fetch active assignments, optionally filtered by case
- `assignWorker(subsidyCaseId, targetUserId, targetRole, reason)` -- create assignment + audit log
- `reassignWorker(currentAssignmentId, newUserId, reason)` -- mark old as 'reassigned', create new + audit
- `revokeAssignment(assignmentId, reason)` -- mark as 'revoked' + audit
- `completeAssignment(assignmentId, reason)` -- mark as 'completed' + audit
- Role-gated: write operations check for `system_admin` or `project_leader` before executing

---

## Step 4: Admin UI — Case Assignments Page

New route: `/case-assignments`
New file: `src/app/(admin)/case-assignments/page.tsx`

**Layout (Darkone Admin patterns, minimal):**
- PageTitle: "Case Assignments" under "Bouwsubsidie" subName
- Grid.js table showing active assignments: Case #, Assigned Worker, Role, Status, Assigned By, Date, Reason
- "Assign Worker" button (visible only to system_admin / project_leader)
- Assignment modal with: case selector, worker selector (filtered by role), role context, mandatory reason field

**Components:**
- `src/app/(admin)/case-assignments/components/AssignmentFormModal.tsx` -- Form modal for assign/reassign
- Role check: only system_admin and project_leader see action buttons

---

## Step 5: Menu & Routing

- Add route `{ path: '/case-assignments', name: 'Case Assignments', element: <CaseAssignments /> }` to `bouwsubsidieRoutes` in `src/routes/index.tsx`
- Add menu item in `src/assets/data/menu-items.ts` under BOUWSUBSIDIE section:
  - Key: `case-assignments`
  - Label: `Case Assignments`
  - Icon: `mingcute:user-check-line`
  - Allowed roles: `system_admin`, `project_leader` (write access), plus `social_field_worker`, `technical_inspector`, `admin_staff` (view own), plus `director`, `ministerial_advisor`, `minister`, `audit` (read-only oversight)

---

## Step 6: Post-Implementation Restore Point

Create: `restore-points/v1.5/RESTORE_POINT_V1.5_PHASE2_POST_IMPLEMENTATION.md`

---

## Explicit Out-of-Scope Confirmation

The following will NOT be implemented:
- No changes to decision authority or dossier states
- No workflow automation or routing
- No workload balancing, KPIs, or time tracking
- No notifications or escalations
- No coupling to Archive, Decision, or Woningregistratie flows
- No background jobs
- Visit scheduling persistence is NOT included (only case-to-worker assignments)

---

## Technical Notes

- Table uses append-only pattern (no UPDATE/DELETE via RLS) for immutability
- RLS uses existing `has_role` / `has_any_role` security definer functions
- Audit logging uses existing `logAuditEvent` utility
- UI follows Darkone Admin patterns (Card, Grid.js, Bootstrap)
- The existing `assignment_record` table (Woningregistratie) is untouched

