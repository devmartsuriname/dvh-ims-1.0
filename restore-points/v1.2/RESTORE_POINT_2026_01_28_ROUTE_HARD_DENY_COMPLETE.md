# Restore Point: Route Hard Deny - COMPLETE

**Created:** 2026-01-28
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Type:** Post-Implementation Checkpoint

---

## Implementation Summary

All planned changes have been successfully implemented.

---

## Changes Made

### 1. Catch-All 404 Route (IMPLEMENTED)

**File:** `src/routes/router.tsx`

Added catch-all route as the final route in the Routes component:
```tsx
<Route 
  path="*" 
  element={
    <AuthLayout>
      <Error404Page />
    </AuthLayout>
  } 
/>
```

**Result:** All unregistered paths now render the 404 page instead of a blank screen.

---

### 2. Dashboard Navigation Links (FIXED)

**File:** `src/app/(admin)/dashboards/components/User.tsx`

| Line | Before | After |
|------|--------|-------|
| 30 | `/bouwsubsidie/cases` | `/subsidy-cases` |
| 86 | `/wonio/registrations` | `/housing-registrations` |

**Result:** "View All" buttons now navigate to correct IMS routes.

---

### 3. Branding Meta Tags (UPDATED)

**File:** `index.html`

| Meta Tag | Before | After |
|----------|--------|-------|
| title | Darkone - Admin Dashboard | VolksHuisvesting IMS |
| description | Darkone React Admin Dashboard Template | Ministry of Social Affairs and Housing - Information Management System |
| author | Darkone | Ministerie van Sociale Zaken en Volkshuisvesting |
| og:title | Darkone - Admin Dashboard | VolksHuisvesting IMS |
| og:description | Darkone React Admin Dashboard Template | Ministry of Social Affairs and Housing - Information Management System |

---

## Authoritative IMS Route Inventory (23 Routes)

### Public Routes (4)
| Path | Component |
|------|-----------|
| `/` | LandingPage |
| `/bouwsubsidie/apply` | BouwsubsidieWizard |
| `/housing/register` | HousingWizard |
| `/status` | StatusTracker |

### Auth Routes (4)
| Path | Component |
|------|-----------|
| `/auth/sign-in` | AuthSignIn |
| `/auth/sign-up` | AuthSignUp |
| `/auth/reset-password` | ResetPassword |
| `/error-pages/pages-404` | Error404 |

### Admin Routes (14)
| Path | Component |
|------|-----------|
| `/dashboards` | Dashboards |
| `/persons` | PersonList |
| `/persons/:id` | PersonDetail |
| `/households` | HouseholdList |
| `/households/:id` | HouseholdDetail |
| `/subsidy-cases` | SubsidyCaseList |
| `/subsidy-cases/:id` | SubsidyCaseDetail |
| `/housing-registrations` | HousingRegistrationList |
| `/housing-registrations/:id` | HousingRegistrationDetail |
| `/housing-waiting-list` | HousingWaitingList |
| `/allocation-quotas` | AllocationQuotas |
| `/allocation-runs` | AllocationRuns |
| `/allocation-runs/:id` | AllocationRunDetail |
| `/allocation-decisions` | AllocationDecisions |
| `/allocation-assignments` | AllocationAssignments |
| `/audit-log` | AuditLog |

### Catch-All (1)
| Path | Component |
|------|-----------|
| `*` | Error404Page |

---

## Denied Paths (Now Return 404)

All of the following paths now correctly return the 404 page:

- `/landing/startup`
- `/landing/product`
- `/landing/agency`
- `/pricing`
- `/faq`
- `/blog/*`
- `/maps/vector-maps`
- `/account-settings`
- `/user-profile`
- `/ui-elements/buttons`
- Any other unregistered path

---

## Checklist Report

### IMPLEMENTED
- [x] Catch-all 404 route in `src/routes/router.tsx`
- [x] Fixed broken link `/bouwsubsidie/cases` → `/subsidy-cases`
- [x] Fixed broken link `/wonio/registrations` → `/housing-registrations`
- [x] Updated index.html meta tags to DVH-IMS branding
- [x] Created START restore point
- [x] Created COMPLETE restore point

### VERIFIED
- [x] No demo/template routes exist in codebase
- [x] Route definitions contain only valid IMS routes
- [x] Menu items contain only valid IMS entries
- [x] Catch-all route properly catches unregistered paths

### SKIPPED
- Unused VectorMap components (Canada, Spain, Russia, Iraq) - Not blocking; deferred
- Orphaned type definitions in `src/types/data.ts` - Not blocking; deferred
- `ComingSoon.tsx` component - Utility component; may be used in future

### PARTIAL
- None

---

## Governance Compliance

- Guardian Rules: COMPLIANT
- Darkone Admin 1:1: MAINTAINED
- No scope creep: CONFIRMED
- Evidence-based: CONFIRMED

---

## Route Suggestion Clarification

The URL dropdown suggestions visible in the browser preview are **browser-level autocomplete/history** artifacts from previous Darkone template development sessions.

**User Action Required:** Clear browser cache/history to remove legacy suggestions.

The hard-deny (catch-all route) ensures these paths are never valid and always return 404.

---

## Files Changed

| File | Operation |
|------|-----------|
| `src/routes/router.tsx` | MODIFIED |
| `src/app/(admin)/dashboards/components/User.tsx` | MODIFIED |
| `index.html` | MODIFIED |
| `restore-points/v1.2/RESTORE_POINT_2026_01_28_ROUTE_HARD_DENY_START.md` | CREATED |
| `restore-points/v1.2/RESTORE_POINT_2026_01_28_ROUTE_HARD_DENY_COMPLETE.md` | CREATED |
