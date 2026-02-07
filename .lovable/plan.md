

# DVH-IMS V1.5 Phase 1 Implementation — Archive (Read-Only)

**Type:** Implementation
**Phase:** V1.5 Phase 1 — Operational Transparency
**Status:** AUTHORIZED

---

## Step 1: Pre-Implementation Restore Point

Create `docs/restore-points/v1.5/RESTORE_POINT_V1.5_PHASE1_PRE_IMPLEMENTATION.md` documenting current system state before any changes.

---

## Step 2: Update Audit Logging Types

**File:** `src/hooks/useAuditLog.ts`

- Add `ARCHIVE_VIEWED` to the `AuditAction` type union
- No other changes to this file

---

## Step 3: Add Archive Menu Item

**File:** `src/assets/data/menu-items.ts`

Add an "Archive" entry under the GOVERNANCE section (before "Audit Log"):

- Key: `archive`
- Label: `Archive`
- Icon: `mingcute:archive-line`
- URL: `/archive`
- Allowed roles: `system_admin`, `minister`, `project_leader`, `director`, `ministerial_advisor`, `audit`

---

## Step 4: Add Archive Routes

**File:** `src/routes/index.tsx`

Add three routes to `governanceRoutes`:
- `/archive` -- Archive list page
- `/archive/subsidy/:id` -- Subsidy archive detail (read-only)
- `/archive/housing/:id` -- Housing archive detail (read-only)

Add lazy imports for the three new page components.

---

## Step 5: Archive List Page

**New file:** `src/app/(admin)/archive/page.tsx`

- Role gate: only `system_admin`, `minister`, `project_leader`, `director`, `ministerial_advisor`, `audit`
- Two tabs: "Bouwsubsidie" and "Woningregistratie"
- Bouwsubsidie tab: queries `subsidy_case` WHERE `status` IN (`finalized`, `rejected`) with applicant person join
- Woningregistratie tab: queries `housing_registration` WHERE `current_status` IN (`finalized`, `rejected`) with applicant person join
- Each row shows: case/reference number, applicant name, district, terminal status badge, date
- Row click navigates to `/archive/subsidy/:id` or `/archive/housing/:id`
- No action buttons, no "New Case" button, no edit controls
- Uses Grid.js table (matching existing CaseTable pattern)

---

## Step 6: Subsidy Archive Detail Page

**New file:** `src/app/(admin)/archive/subsidy/[id]/page.tsx`

- Role gate (same as list page)
- On mount: logs `ARCHIVE_VIEWED` audit event with entity_type `subsidy_case` and entity_id
- Fetches: subsidy_case, subsidy_case_status_history, subsidy_document_upload, social_report, technical_report, generated_document, audit_event (filtered by entity)
- Tabs (all read-only, no action controls):
  - **Overview**: Case info (reuses layout from existing detail page but without "Change Status" card)
  - **Documents**: Uploaded documents table (read-only, no verify buttons)
  - **Social Report**: Read-only display of social_report JSON
  - **Technical Report**: Read-only display of technical_report JSON
  - **Director Review**: Read-only display (visible for all archive cases that reached director stage)
  - **Advisor Review**: Read-only display (visible for cases that reached advisor stage)
  - **Minister Decision**: Read-only display (visible for cases that reached minister stage)
  - **Status History**: Full timeline from `subsidy_case_status_history`
  - **Audit Trail**: Full `audit_event` log filtered by `entity_id = case.id` AND `entity_type = 'subsidy_case'`
- Back button navigates to `/archive`
- NO status change controls, NO edit forms, NO workflow triggers

---

## Step 7: Housing Archive Detail Page

**New file:** `src/app/(admin)/archive/housing/[id]/page.tsx`

- Role gate (same as list page)
- On mount: logs `ARCHIVE_VIEWED` audit event with entity_type `housing_registration` and entity_id
- Fetches: housing_registration, housing_registration_status_history, housing_document_upload, housing_urgency, audit_event (filtered by entity)
- Tabs (all read-only):
  - **Overview**: Registration info (reuses layout from existing detail page but without "Change Status" card)
  - **Urgency**: Read-only display of urgency assessments (no add form)
  - **Documents**: Uploaded documents table (read-only, no verify buttons)
  - **Status History**: Full timeline from `housing_registration_status_history`
  - **Audit Trail**: Full `audit_event` log filtered by `entity_id = registration.id` AND `entity_type = 'housing_registration'`
- Back button navigates to `/archive`
- NO status change controls, NO edit forms, NO workflow triggers

---

## Step 8: Post-Implementation Restore Point and Completion Report

Create `docs/restore-points/v1.5/RESTORE_POINT_V1.5_PHASE1_POST_IMPLEMENTATION.md` with Phase 1 Completion Report including all mandatory sections.

---

## Hard Constraints Compliance

| Constraint | Status |
|-----------|--------|
| Read-only archive views only | Enforced -- no action buttons, no forms, no mutations |
| No new tables or schema changes | Compliant -- uses existing tables only |
| No data duplication | Compliant -- queries same source tables |
| No workflow or state changes | Compliant -- no status transitions in archive |
| No financial calculations | Compliant |
| No PDF generation | Compliant |
| No CSV/export | Compliant |
| ARCHIVE_VIEWED audit logging | Implemented on every detail page load |
| Immutability enforced | UI-level: no edit controls rendered |

---

## Files Summary

| File | Action |
|------|--------|
| `docs/restore-points/v1.5/RESTORE_POINT_V1.5_PHASE1_PRE_IMPLEMENTATION.md` | Create |
| `src/hooks/useAuditLog.ts` | Modify (add ARCHIVE_VIEWED) |
| `src/assets/data/menu-items.ts` | Modify (add Archive menu item) |
| `src/routes/index.tsx` | Modify (add 3 archive routes) |
| `src/app/(admin)/archive/page.tsx` | Create |
| `src/app/(admin)/archive/subsidy/[id]/page.tsx` | Create |
| `src/app/(admin)/archive/housing/[id]/page.tsx` | Create |
| `docs/restore-points/v1.5/RESTORE_POINT_V1.5_PHASE1_POST_IMPLEMENTATION.md` | Create |

