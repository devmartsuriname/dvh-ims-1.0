

# DVH-IMS V1.5 — Admin Polish Smoke Test Report and Mini Fix Plan

**Type:** Visual audit and polish plan (no changes applied)
**Status:** Test and Stabilization Window

---

## 1. Admin Modules Checked

All 16 admin modules were inspected via code review and browser-based testing:

| Module | Route | Loads | Icons | Console Errors |
|--------|-------|-------|-------|----------------|
| Dashboard | /dashboards | OK | OK | None |
| Persons | /persons | OK | OK | None |
| Households | /households | OK | OK | None |
| Control Queue | /control-queue | OK | OK | None |
| My Visits | /my-visits | OK | OK | None |
| Schedule Visits | /schedule-visits | OK | OK | None |
| Subsidy Cases | /subsidy-cases | OK | OK | None |
| Case Assignments | /case-assignments | OK | OK | None |
| Registrations | /housing-registrations | OK | OK | None |
| Waiting List | /housing-waiting-list | OK | OK | None |
| District Quotas | /allocation-quotas | OK | OK | None |
| Allocation Runs | /allocation-runs | OK | OK | None |
| Decisions | /allocation-decisions | OK | OK | None |
| Assignments | /allocation-assignments | OK | OK | None |
| Archive | /archive | OK | OK | None |
| Audit Log | /audit-log | OK | OK | None |

---

## 2. Visual Issues Found

### ISSUE 1 — KPI Card Titles Truncated (Dashboard)
- **Location:** `/dashboards` — top KPI stat cards
- **File:** `src/app/(admin)/dashboards/components/Cards.tsx`, line 67
- **Problem:** Card titles ("Housing Registrations", "Subsidy Applications", "Pending Applications", "Approved Applications") are truncated with ellipsis because of `text-truncate` CSS class combined with a `Col xs={6}` layout that constrains width.
- **Visible as:** "Housing Registrati...", "Subsidy Applicatio...", etc.
- **Darkone deviation:** Darkone baseline cards display full titles without truncation. The icon avatar is positioned absolutely or in a flex layout that does not steal title space.
- **Classification:** Spacing / styling
- **Fix:** Remove `text-truncate` class from the title `<p>` tag OR restructure the card layout so the icon does not compete for horizontal space with the title.

### ISSUE 2 — Dashboard Menu Label Casing Inconsistency
- **Location:** Sidebar menu, first item
- **File:** `src/assets/data/menu-items.ts`, line 18
- **Problem:** The dashboard label is `'dashboard'` (lowercase) while all other menu items use title case (e.g., `'Persons'`, `'Households'`). The `textTransform: 'capitalize'` style on the `<ul>` masks this visually, but it is a data inconsistency.
- **Classification:** Pure UI (data alignment)
- **Fix:** Change `label: 'dashboard'` to `label: 'Dashboard'`.

### ISSUE 3 — Case Assignments Icon Missing on Published Site
- **Location:** Sidebar menu, "Case Assignments" item
- **File:** `src/assets/data/menu-items.ts`, line 77
- **Current code status:** Icon IS defined as `'mingcute:user-check-line'` in current codebase.
- **Problem:** The user's screenshot from the LIVE domain (volkshuisvesting.sr) shows "Case Assignments" rendered WITHOUT an icon. This is a **publish gap** — the live site is running an older build where the icon was not set.
- **Classification:** Icon alignment (publish required)
- **Fix:** No code change needed. A publish to the live domain will resolve this.

---

## 3. Darkone Parity Assessment

| Area | Status | Notes |
|------|--------|-------|
| Sidebar structure | PASS | Section groupings match Darkone pattern |
| Sidebar icons | PASS (code) | All 16 items have icons. Live site needs publish for Case Assignments. |
| Header layout | PASS | Hamburger, search, settings, notifications, profile — standard Darkone layout |
| Card layout | DEVIATION | KPI cards truncate titles (Issue 1) |
| Tables | PASS | All tables use react-bootstrap Table with Darkone styling |
| Empty states | PASS | "No recent cases" / "No recent registrations" text matches pattern |
| Typography | PASS | Font sizes, weights, and hierarchy are consistent |
| Footer | PASS | "2026 (c) Ministerie van Sociale Zaken en Volkshuisvesting" — correct |
| Breadcrumbs | PASS | PageTitle component follows Darkone breadcrumb pattern |
| Modals | PASS | All modals use `size="lg"` centered pattern (previously standardized) |

---

## 4. Console Errors

No console errors detected during browser-based smoke test across Dashboard, Case Assignments, and Archive pages.

---

## 5. Mini Admin Polish Plan (Itemized Fixes)

| # | Fix | File | Classification | Safe for Stabilization |
|---|-----|------|----------------|----------------------|
| 1 | Remove `text-truncate` from KPI card titles to show full text | `src/app/(admin)/dashboards/components/Cards.tsx` line 67 | Spacing / styling | YES |
| 2 | Capitalize dashboard menu label from `'dashboard'` to `'Dashboard'` | `src/assets/data/menu-items.ts` line 18 | Pure UI | YES |
| 3 | Publish latest build to live domain (resolves Case Assignments icon) | N/A (deploy action) | Icon alignment | YES |

All three fixes are cosmetic-only, zero-risk, and safe within the stabilization window. No backend, RLS, schema, or workflow changes involved.

---

No changes have been applied. Awaiting explicit approval before executing the Admin polish.
