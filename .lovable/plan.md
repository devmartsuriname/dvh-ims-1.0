

# DVH-IMS V1.4 Phase 1 — Implementation Plan
## Control Queue and My Visits

---

## 1. Role-to-Status Mapping (Authoritative)

Based on the V1.3 workflow chain and existing `STATUS_TRANSITIONS`:

| Role | Queue Status(es) | Scope | Rationale |
|------|-----------------|-------|-----------|
| frontdesk_bouwsubsidie | `received`, `returned_to_intake`, `needs_more_docs` | District | Intake and document follow-up |
| social_field_worker | `in_social_review`, `returned_to_social` | District | Cases awaiting social assessment |
| technical_inspector | `in_technical_review`, `returned_to_technical` | District | Cases awaiting technical inspection |
| admin_staff | `in_admin_review`, `screening` | District | Admin review and screening |
| project_leader | `fieldwork` | National | Oversight of fieldwork stage |
| director | `awaiting_director_approval`, `returned_to_director` | National | Organizational approval queue |
| ministerial_advisor | `in_ministerial_advice`, `returned_to_advisor` | National | Advisory review queue |
| minister | `awaiting_minister_decision` | National | Final decision queue |
| system_admin | All statuses | National | Full visibility |
| audit | All statuses (read-only) | National | Audit oversight |

---

## 2. My Visits — Status-to-Visit Mapping

| Role | Visit-Relevant Status(es) | Data Shown |
|------|--------------------------|------------|
| social_field_worker | `in_social_review` | Case number, applicant name, household address (via `address` table), district, social report status (exists/draft/finalized) |
| technical_inspector | `in_technical_review` | Case number, applicant name, household address (via `address` table), district, technical report status (exists/draft/finalized) |

Visit qualification is purely status-based. A case in `in_social_review` or `in_technical_review` implies a pending visit requirement.

---

## 3. Urgency Calculation

**Proposed rule (informational only, not policy-enforced):**

- "Days in status" = difference between `NOW()` and `subsidy_case.updated_at`
- Display as plain number in a column
- Visual indicators (badge colors):
  - 0-7 days: no indicator (normal)
  - 8-14 days: `warning` badge
  - 15+ days: `danger` badge

No policy actions triggered. Purely visual.

---

## 4. Pre-Implementation Finding: Menu Visibility Gap

**FACTUAL:** The current `menu-items.ts` (line 51) does NOT include `social_field_worker` or `technical_inspector` in the `subsidy-cases` `allowedRoles`. These roles cannot currently see the "Subsidy Cases" menu item.

**Impact on Phase 1:** Both Control Queue and My Visits pages need menu entries. Additionally, `social_field_worker` and `technical_inspector` must also have access to individual case detail pages for navigation from queue/visits lists.

**Resolution required:** Add `social_field_worker` and `technical_inspector` to the `subsidy-cases` allowedRoles AND add new menu entries for Control Queue and My Visits.

---

## 5. Implementation Steps

### Step 5.1: Pre-Implementation Restore Point

Create `restore-points/v1.4/RESTORE_POINT_V1.4_PHASE1_START.md`

### Step 5.2: Create `useControlQueue` Hook

**File:** `src/hooks/useControlQueue.ts`

- Accept current user roles and district from `useUserRole`
- Map roles to relevant statuses (table from Section 1)
- Query `subsidy_case` with status filter + join to `person` for applicant name
- RLS handles district scoping automatically (no client-side filter needed for security)
- Calculate "days in status" from `updated_at`
- Return typed array with: case_number, applicant_name, status, district_code, updated_at, days_in_status

### Step 5.3: Create Control Queue Page

**File:** `src/app/(admin)/control-queue/page.tsx`

- PageTitle: "Control Queue"
- Single Card with Grid.js table (matches CaseTable pattern exactly)
- Columns: Case #, Applicant, District, Status (badge), Days in Status (urgency badge), Actions (View button linking to `/subsidy-cases/:id`)
- No write operations
- Darkone Admin 1:1 pattern (Card > CardHeader > CardBody > Grid)

### Step 5.4: Create `useMyVisits` Hook

**File:** `src/hooks/useMyVisits.ts`

- Query `subsidy_case` filtered by visit-relevant statuses
- Join to `person` (applicant name) and `household` -> `address` (household address)
- Join to `social_report` or `technical_report` to show report status
- Return: case_number, applicant_name, address_line_1, district_code, report_status (none/draft/finalized)

### Step 5.5: Create My Visits Page

**File:** `src/app/(admin)/my-visits/page.tsx`

- PageTitle: "My Visits"
- Single Card with Grid.js table
- Columns: Case #, Applicant, Address, District, Report Status (badge), Actions (View)
- Visible only to `social_field_worker` and `technical_inspector`
- Darkone Admin 1:1

### Step 5.6: Update Routes

**File:** `src/routes/index.tsx`

- Add `/control-queue` route to `bouwsubsidieRoutes`
- Add `/my-visits` route to `bouwsubsidieRoutes`

### Step 5.7: Update Menu Items

**File:** `src/assets/data/menu-items.ts`

- Add "Control Queue" menu item under BOUWSUBSIDIE section with icon `mingcute:task-line`
  - allowedRoles: all Bouwsubsidie roles (frontdesk_bouwsubsidie, social_field_worker, technical_inspector, admin_staff, project_leader, director, ministerial_advisor, minister, system_admin, audit)
- Add "My Visits" menu item under BOUWSUBSIDIE section with icon `mingcute:location-line`
  - allowedRoles: social_field_worker, technical_inspector
- Add `social_field_worker` and `technical_inspector` to existing `subsidy-cases` allowedRoles (required for case detail navigation)

### Step 5.8: Post-Implementation Restore Point

Create `restore-points/v1.4/RESTORE_POINT_V1.4_PHASE1_COMPLETE.md`

---

## 6. Files to Create/Modify

| File | Action |
|------|--------|
| `restore-points/v1.4/RESTORE_POINT_V1.4_PHASE1_START.md` | CREATE |
| `src/hooks/useControlQueue.ts` | CREATE |
| `src/app/(admin)/control-queue/page.tsx` | CREATE |
| `src/hooks/useMyVisits.ts` | CREATE |
| `src/app/(admin)/my-visits/page.tsx` | CREATE |
| `src/routes/index.tsx` | MODIFY (add 2 routes) |
| `src/assets/data/menu-items.ts` | MODIFY (add 2 menu items + update allowedRoles) |
| `restore-points/v1.4/RESTORE_POINT_V1.4_PHASE1_COMPLETE.md` | CREATE |

---

## 7. Governance Compliance

| Constraint | Status |
|------------|--------|
| No new database tables | COMPLIANT |
| No new columns | COMPLIANT |
| No RLS policy changes | COMPLIANT |
| No workflow state changes | COMPLIANT |
| No role changes | COMPLIANT |
| Darkone Admin 1:1 | ENFORCED (Grid.js + Card pattern) |
| Bouwsubsidie only | ENFORCED |
| Read-only pages | ENFORCED (no write operations) |
| No new audit events | COMPLIANT |

---

## 8. Verification Checklist

| Check | Expected |
|-------|----------|
| Control Queue loads for each Bouwsubsidie role | Shows only role-relevant statuses |
| District-scoped roles see only their district | RLS enforced |
| National roles see all districts | RLS enforced |
| My Visits visible only for social_field_worker and technical_inspector | Menu + role check |
| My Visits shows address data | address table join works |
| Days-in-status calculation correct | Visual urgency badges render |
| Click "View" navigates to case detail | Existing page loads |
| No console errors | Clean |
| Woningregistratie unchanged | No impact |
| Menu items appear in correct section | Under BOUWSUBSIDIE |

---

## 9. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Address data missing for some cases | Low | Show "-" fallback |
| Large queue for national roles | Medium | Grid.js pagination (limit: 10) |
| social_field_worker/technical_inspector menu gap | Resolved in Step 5.7 |

---

## 10. Stop Condition

After Phase 1 implementation: STOP, report, await Phase 2 authorization.

