# DVH-IMS V1.9 — Gap Remediation Plan (Corrected)

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Baseline:** V1.8 (FROZEN)
**Scope:** Hardening and gap remediation only

---

## 1. Existing Modules Already Aligned with Documentation


| Module                         | Location                                  | Status                                                                                                     |
| ------------------------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Control Queue                  | `control-queue/page.tsx`                  | ALIGNED — role-filtered, read + link to detail                                                             |
| My Visits                      | `my-visits/page.tsx`                      | ALIGNED — shows assigned cases per field role                                                              |
| Case Detail + All Tabs         | `subsidy-cases/[id]/page.tsx` (788 lines) | ALIGNED — overview, documents, children, status history, social/technical/director/advisor/minister panels |
| Social Review Form             | embedded in case detail                   | ALIGNED — structured JSON report                                                                           |
| Technical Review Form          | embedded in case detail                   | ALIGNED — structured JSON report                                                                           |
| Director Review Panel          | embedded in case detail                   | ALIGNED — decision with mandatory reason                                                                   |
| Advisor Review Panel           | embedded in case detail                   | ALIGNED — advisory recommendation                                                                          |
| Minister Decision Panel        | embedded in case detail                   | ALIGNED — final decision with mandatory deviation justification                                            |
| Case Assignments               | `case-assignments/`                       | ALIGNED — append-only, system_admin/project_leader write                                                   |
| Archive (Subsidy + Housing)    | `archive/`                                | ALIGNED — list + detail views, role-guarded                                                                |
| Audit Log                      | `audit-log/`                              | ALIGNED — immutable, oversight roles only                                                                  |
| Status Lifecycle (20 states)   | `STATUS_TRANSITIONS` map                  | ALIGNED — full chain with return paths                                                                     |
| Status History + Audit Logging | `handleStatusChange`                      | ALIGNED — both `status_history` and `audit_event` recorded per transition                                  |
| Admin Notifications            | `admin_notification` table + hook         | ALIGNED — real-time, role-targeted                                                                         |
| Schedule Visits (read-only)    | `schedule-visits/page.tsx`                | ALIGNED — as designed in V1.4 (read-only planning view)                                                    |


**No changes required for these modules.**

---

## 2. Existing Modules Partially Aligned


| Module                               | Gap                                                                                                                                                              | Evidence                                                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Status Transitions (case detail)** | `allowedTransitions` is not filtered by current user role. Any authenticated user with page access can trigger any transition from the `STATUS_TRANSITIONS` map. | Line 343: `const allowedTransitions = STATUS_TRANSITIONS[subsidyCase.status] || []` — no role check applied. |
| **Notification Routing**             | All status change notifications route to `frontdesk_bouwsubsidie` regardless of the new status. The next responsible role is not determined.                     | Line 292: `recipientRole: 'frontdesk_bouwsubsidie'` — hardcoded for all transitions.                         |
| **Archive**                          | List and detail pages exist and are functional. No CSV or PDF export capability.                                                                                 | Search for "CSV" and "pdf" in archive directory returns zero matches.                                        |


---

## 3. Missing Capabilities / Gaps


| Gap ID    | Description                                                                                                                                                 | Severity |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **GAP-1** | **RBAC on status transitions**: No `ROLE_ALLOWED_TRANSITIONS` map exists. UI shows all possible transitions to all roles.                                   | CRITICAL |
| **GAP-2** | **Notification routing**: Hardcoded to `frontdesk_bouwsubsidie`. Should route to the next responsible role per transition.                                  | HIGH     |
| **GAP-3** | **Schedule Visits write capability**: Cannot assign inspector, set visit date, or mark visit completed. Read-only by V1.4 design, but operationally needed. | HIGH     |
| **GAP-4** | **Case Timeline component**: No visual timeline view. Status history tab shows a table, not a chronological timeline with actors and events.                | MEDIUM   |
| **GAP-5** | **Archive export**: No CSV/PDF export buttons on archive pages.                                                                                             | LOW      |


---

## 4. Risk of Changing Existing Behavior


| Change                                            | Risk                                                                                                                | Mitigation                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| GAP-1: Adding role filter to transitions          | Roles without mapped transitions will see zero buttons — could lock out legitimate users if map is incomplete       | Exhaustive mapping against doc-07 matrix; `system_admin` always retains all transitions as fallback |
| GAP-2: Changing notification recipient            | Existing notifications already in DB with `frontdesk_bouwsubsidie` as recipient — no migration needed (append-only) | New notifications use correct routing; old records unaffected                                       |
| GAP-3: Adding write operations to Schedule Visits | New DB columns or table required; new RLS policies                                                                  | Minimal schema change; restrict write to `system_admin` + `project_leader` only                     |
| GAP-4: Adding timeline tab                        | Additive UI change — no existing behavior modified                                                                  | New tab on case detail; does not replace status history table                                       |
| GAP-5: Adding export buttons                      | Additive UI change — no existing behavior modified                                                                  | Client-side generation only; no server changes                                                      |


---

## 5. Minimal Corrective Implementation Phases

### Phase 1 — RBAC-Enforced Status Transitions (GAP-1)

**Severity: CRITICAL**

- Add `ROLE_ALLOWED_TRANSITIONS` constant mapping each status transition to its permitted roles
- Filter `allowedTransitions` on line 343 by intersecting with user's current roles
- `system_admin` retains all transitions as governance fallback
- No database changes. No new tables. UI-only enforcement.

**Files changed:** `src/app/(admin)/subsidy-cases/[id]/page.tsx`

### Phase 2 — Notification Routing Fix (GAP-2)

**Severity: HIGH**

- Replace hardcoded `recipientRole: 'frontdesk_bouwsubsidie'` with a `NEXT_RESPONSIBLE_ROLE` lookup map
- Map each target status to its responsible role (e.g., `in_social_review` → `social_field_worker`, `awaiting_director_approval` → `director`)
- No database changes. No new tables.

**Files changed:** `src/app/(admin)/subsidy-cases/[id]/page.tsx`

### Phase 3 — Schedule Visits Write Operations (GAP-3)

**Severity: HIGH**

- Add `scheduled_date` and `visit_status` columns to `case_assignment` table (or create `visit_schedule` table — requires decision)
- Add assignment modal on Schedule Visits page
- Add RLS policies for new columns/table
- Audit log all scheduling actions

**Files changed:** `schedule-visits/page.tsx`, migration SQL, RLS policies
**Decision required:** extend `case_assignment` or new `visit_schedule` table

### Phase 4 — Case Timeline Component (GAP-4)

**Severity: MEDIUM**

- Create `CaseTimeline.tsx` component
- Source data from `subsidy_case_status_history` + `audit_event`
- Add as new tab on case detail page
- Read-only, no database changes

**Files changed:** new `CaseTimeline.tsx`, `subsidy-cases/[id]/page.tsx`

### Phase 5 — Archive Export (GAP-5)

**Severity: LOW**

- Add CSV export button (client-side generation)
- Add PDF export button (browser print or jsPDF)
- Filtered by current view

**Files changed:** `archive/page.tsx`

---

Each phase ends with a restore point and STOP for authorization. No phase skipping.

Approved with one clarification required before Phase 3.

For GAP-3 (Schedule Visits write capability):

Do NOT create a new table automatically.

First confirm whether visit scheduling should extend the existing

`case_assignment` structure or use a separate `visit_schedule` table.

Provide a short schema recommendation before implementing the migration.

All other phases are approved as described.  
  
Awaiting authorization to begin Phase 1.