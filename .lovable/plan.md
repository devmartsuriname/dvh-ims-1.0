

# DVH-IMS — HARD DELETE Demo Routes + Full Evidence Scan
## Implementation Plan

---

## Executive Summary

After a complete repository-wide scan, I have confirmed:

1. **ZERO demo/template route definitions exist in the codebase** - The 39 routes visible in the browser URL dropdown are NOT defined in the application code
2. **Root Cause Identified**: The router lacks a catch-all (`path="*"`) route, causing unregistered paths to render a blank page instead of the 404 page
3. **Route Suggestion Source**: The URL dropdown suggestions are **browser-level autocomplete/history** from previous Darkone template development sessions - NOT application-driven

---

## Evidence: Route Eradication Scan Results

### Search Patterns Executed

| Pattern | Files Found | Status |
|---------|-------------|--------|
| `/landing/` | 1 file (`routes/index.tsx`) | Valid IMS route - `/` maps to Landing page |
| `/pricing` | 0 files | NOT PRESENT |
| `/faq` | 0 files | NOT PRESENT |
| `/blog/` | 0 files | NOT PRESENT |
| `/maps/` | 6 files | VectorMap components only (no route) |
| `/account-settings` | 0 files | NOT PRESENT |
| `/user-profile` | 0 files | NOT PRESENT |
| `vector-maps` | 0 files | NOT PRESENT |
| `startup` | 0 files | NOT PRESENT |
| `agency` | 0 files | NOT PRESENT |
| `ui-elements` | 0 files | NOT PRESENT |
| `buttons` | 12 files | SCSS/component references only (no route) |

### Route Registry Verification

**File: `src/routes/index.tsx`** - Contains ONLY 22 valid IMS routes:
- 4 Public routes
- 4 Auth routes  
- 14 Admin routes

**File: `src/assets/data/menu-items.ts`** - Contains ONLY valid IMS menu items:
- Dashboard, Persons, Households, Subsidy Cases, Housing Registrations, Waiting List, Allocation modules, Audit Log

**No demo routes found in:**
- Route definitions
- Navigation menus
- Lazy imports
- Link components

---

## Implementation Steps

### Step 0: Create Restore Point

**File:** `/restore-points/v1.2/RESTORE_POINT_2026_01_28_ROUTE_HARD_DENY_START.md`

Contents:
- Timestamp
- Current authoritative route list
- Identified issues

---

### Step 1: Implement Catch-All 404 Route (CRITICAL)

**File:** `src/routes/router.tsx`

**Change:** Add catch-all route as the FINAL route in the Routes component

Current code ends at line 49:
```tsx
          {/* Admin Routes ... */}
        </Routes>
```

New code:
```tsx
          {/* Admin Routes ... */}

          {/* Catch-all: Force 404 for any unregistered path */}
          <Route 
            path="*" 
            element={
              <AuthLayout>
                <Error404Page />
              </AuthLayout>
            } 
          />
        </Routes>
```

**Required Import:**
```tsx
import Error404Page from '@/app/(other)/error-pages/pages-404/page'
```

This ensures ALL unregistered paths (including `/landing/startup`, `/pricing`, `/maps/vector-maps`, etc.) render the 404 page instead of a blank screen.

---

### Step 2: Fix Broken Dashboard Navigation Links

**File:** `src/app/(admin)/dashboards/components/User.tsx`

| Line | Current (BROKEN) | Correct (FIXED) |
|------|------------------|-----------------|
| 30 | `/bouwsubsidie/cases` | `/subsidy-cases` |
| 86 | `/woning/registrations` | `/housing-registrations` |

These links currently point to non-existent routes and would trigger the new 404 handler.

---

### Step 3: Update index.html Meta Tags

**File:** `index.html`

| Line | Current | Updated |
|------|---------|---------|
| 6 | `Darkone - Admin Dashboard` | `VolksHuisvesting IMS` |
| 7 | `Darkone React Admin Dashboard Template` | `Ministry of Social Affairs and Housing - Information Management System` |
| 8 | `Darkone` | `Ministerie van Sociale Zaken en Volkshuisvesting` |
| 10 | `Darkone - Admin Dashboard` | `VolksHuisvesting IMS` |
| 11 | `Darkone React Admin Dashboard Template` | `Ministry of Social Affairs and Housing - Information Management System` |

---

### Step 4: Create Completion Restore Point

**File:** `/restore-points/v1.2/RESTORE_POINT_2026_01_28_ROUTE_HARD_DENY_COMPLETE.md`

---

## Files Changed Summary

| File | Operation | Description |
|------|-----------|-------------|
| `src/routes/router.tsx` | MODIFY | Add catch-all 404 route |
| `src/app/(admin)/dashboards/components/User.tsx` | MODIFY | Fix 2 broken navigation links |
| `index.html` | MODIFY | Update branding meta tags |
| `restore-points/v1.2/RESTORE_POINT_2026_01_28_ROUTE_HARD_DENY_START.md` | CREATE | Pre-change restore point |
| `restore-points/v1.2/RESTORE_POINT_2026_01_28_ROUTE_HARD_DENY_COMPLETE.md` | CREATE | Post-change restore point |

---

## Route Suggestion Source Clarification

The URL dropdown suggestions visible in the preview are **browser-level autocomplete** from:
- Previous Darkone template development sessions
- Browser history entries

These are **NOT controlled by application code**. The hard-deny (catch-all route) ensures these paths are never valid and always return 404.

**User Action Required:** Clear browser cache/history to remove legacy suggestions.

---

## Authoritative IMS Route Inventory (Post-Implementation)

### Public Routes (4)
| Path | Component | Status |
|------|-----------|--------|
| `/` | LandingPage | VALID |
| `/bouwsubsidie/apply` | BouwsubsidieWizard | VALID |
| `/housing/register` | HousingWizard | VALID |
| `/status` | StatusTracker | VALID |

### Auth Routes (4)
| Path | Component | Status |
|------|-----------|--------|
| `/auth/sign-in` | AuthSignIn | VALID |
| `/auth/sign-up` | AuthSignUp | VALID |
| `/auth/reset-password` | ResetPassword | VALID |
| `/error-pages/pages-404` | Error404 | VALID |

### Admin Routes (14)
| Path | Component | Status |
|------|-----------|--------|
| `/dashboards` | Dashboards | VALID |
| `/persons` | PersonList | VALID |
| `/persons/:id` | PersonDetail | VALID |
| `/households` | HouseholdList | VALID |
| `/households/:id` | HouseholdDetail | VALID |
| `/subsidy-cases` | SubsidyCaseList | VALID |
| `/subsidy-cases/:id` | SubsidyCaseDetail | VALID |
| `/housing-registrations` | HousingRegistrationList | VALID |
| `/housing-registrations/:id` | HousingRegistrationDetail | VALID |
| `/housing-waiting-list` | HousingWaitingList | VALID |
| `/allocation-quotas` | AllocationQuotas | VALID |
| `/allocation-runs` | AllocationRuns | VALID |
| `/allocation-runs/:id` | AllocationRunDetail | VALID |
| `/allocation-decisions` | AllocationDecisions | VALID |
| `/allocation-assignments` | AllocationAssignments | VALID |
| `/audit-log` | AuditLog | VALID |

### Catch-All (1 - TO BE ADDED)
| Path | Component | Status |
|------|-----------|--------|
| `*` | Error404Page | TO BE ADDED |

**Total: 23 routes**

---

## Denied Paths (After Implementation)

The following paths will return 404 after the catch-all is implemented:

- `/landing/startup` -> 404
- `/landing/product` -> 404
- `/landing/agency` -> 404
- `/pricing` -> 404
- `/faq` -> 404
- `/blog/*` -> 404
- `/maps/vector-maps` -> 404
- `/account-settings` -> 404
- `/user-profile` -> 404
- `/ui-elements/buttons` -> 404
- Any other unregistered path -> 404

---

## Out of Scope (Explicitly Skipped)

| Item | Reason |
|------|--------|
| Unused VectorMap components (Canada, Spain, Russia, Iraq) | Not blocking; cleanup deferred |
| Orphaned type definitions in `src/types/data.ts` | Not blocking; cleanup deferred |
| `ComingSoon.tsx` component | Utility component; may be used in future |

---

## Governance Compliance

- Darkone Admin 1:1 parity: MAINTAINED
- No custom UI frameworks: CONFIRMED
- No Bootstrap outside Darkone: CONFIRMED
- No scope creep: CONFIRMED
- Evidence-based approach: CONFIRMED
- Guardian Rules: COMPLIANT

---

## Technical Section

### Why Catch-All Route is Required

React Router v6 matches routes in order of specificity. Without a `path="*"` catch-all:
- Unregistered paths render nothing (blank page)
- The `<Routes>` component simply returns `null` for unmatched paths

The catch-all ensures React Router always has a fallback route for any path not explicitly defined.

### Error404Page Component

The existing `Error404Page` component at `src/app/(other)/error-pages/pages-404/page.tsx` provides:
- Darkone-compliant styling
- "Back to Home" link to `/dashboards`
- Proper authentication background styling

No modifications to this component are required.

