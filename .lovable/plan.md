

# DVH-IMS V1.4 Phase 2 — Schedule Visits (Read-Only) Implementation Plan

## Scope Confirmation

- Schedule Visits is READ-ONLY
- No case assignment persistence
- No new database tables or columns
- No RLS changes, workflow changes, or notifications
- No calendar logic or drag-and-drop
- Darkone Admin 1:1 enforced

## Files to Create/Modify

| File | Action |
|------|--------|
| `restore-points/v1.4/RESTORE_POINT_V1.4_PHASE2_START.md` | CREATE |
| `src/hooks/useScheduleVisits.ts` | CREATE |
| `src/app/(admin)/schedule-visits/page.tsx` | CREATE |
| `src/routes/index.tsx` | MODIFY (add 1 route + lazy import) |
| `src/assets/data/menu-items.ts` | MODIFY (add 1 menu item) |
| `restore-points/v1.4/RESTORE_POINT_V1.4_PHASE2_COMPLETE.md` | CREATE |

## Implementation Details

### 1. Restore Point (Start)

Create `restore-points/v1.4/RESTORE_POINT_V1.4_PHASE2_START.md` documenting Phase 1 completion state.

### 2. Hook: `useScheduleVisits`

- Two queries, both read-only:
  - **Pending cases:** Query `subsidy_case` filtered by `in_social_review`, `in_technical_review`, `fieldwork` statuses, joined to `person` (applicant name) and `household` -> `address` (location). RLS handles district scoping.
  - **Available field workers:** Query `user_roles` for roles `social_field_worker` and `technical_inspector`, joined to `app_user_profile` for `full_name`, `district_code`, and `is_active`.
- Returns `{ pendingCases, fieldWorkers, loading }`.

### 3. Page: Schedule Visits

Following the exact Darkone pattern from Phase 1 (PageTitle + Card + Grid.js):

- **PageTitle:** "Schedule Visits" with subName "Bouwsubsidie"
- **Mandatory governance subtitle:** "This page is a read-only planning overview. It does not assign cases, does not alter workflows, and does not influence decision-making."
- **Two-panel layout using `Row` + `Col`:**
  - **Left panel (Col lg=8):** "Cases Pending Visits" card with Grid.js table. Columns: Case #, Applicant, Address, District, Status (badge). Paginated, searchable, sortable.
  - **Right panel (Col lg=4):** "Available Field Workers" card with Grid.js table. Columns: Name, Role (badge), District. No actions.
- Role guard: Only `admin_staff`, `project_leader`, `system_admin`, `audit` can view content. Other roles see access-denied message.
- No write operations, no buttons triggering mutations.

### 4. Route Update

Add lazy import `ScheduleVisits` and route `{ path: '/schedule-visits', name: 'Schedule Visits', element: <ScheduleVisits /> }` to `bouwsubsidieRoutes`.

### 5. Menu Update

Add menu item after "My Visits" entry:
```text
key: 'schedule-visits'
label: 'Schedule Visits'
icon: 'mingcute:calendar-2-line'
url: '/schedule-visits'
allowedRoles: ['admin_staff', 'project_leader', 'system_admin', 'audit']
```

### 6. Restore Point (Complete)

Create `restore-points/v1.4/RESTORE_POINT_V1.4_PHASE2_COMPLETE.md` with completion report.

## Governance Compliance

| Constraint | Status |
|------------|--------|
| No new database tables | COMPLIANT |
| No new columns | COMPLIANT |
| No RLS policy changes | COMPLIANT |
| No workflow state changes | COMPLIANT |
| No role changes | COMPLIANT |
| No write operations | COMPLIANT |
| Darkone Admin 1:1 | ENFORCED |
| Bouwsubsidie only | ENFORCED |
| Mandatory governance statement on page | ENFORCED |
| Access limited to admin_staff, project_leader, system_admin, audit | ENFORCED |

## Technical Notes

- `user_roles` table has `user_id` and `role` columns; joined to `app_user_profile` via `user_id` for name and district
- `app_user_profile.is_active` used to filter only active workers
- Status badges reuse the same `STATUS_BADGES` map from Control Queue page
- Grid.js pagination set to limit: 10 for both panels

