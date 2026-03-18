# Phase 2 — Authorization Consistency Report

**Date:** 2026-03-18
**Authority:** Delroy
**Executed By:** Claude (Governance-Controlled Fix Execution)
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Status:** COMPLETE

---

## Objective

Add page-level role guards to all admin pages that previously had none, aligning frontend access control with the authorization model already defined in `src/assets/data/menu-items.ts`. No new permission model was introduced — only enforcement of the existing `allowedRoles` definitions already present in the navigation layer.

---

## 1. Authorization Gap Analysis

### Pre-Phase-2 State

The router (`src/routes/router.tsx`) guards admin routes by checking `isAuthenticated` only. Individual pages were responsible for their own role enforcement. The established pattern was already present in some pages but absent in others.

**Pages WITH guards before Phase 2:**

| Page | Guard Type | Notes |
|------|-----------|-------|
| `audit-log/page.tsx` | `Navigate` redirect | Full standard pattern — used as reference |
| `archive/page.tsx` | `Navigate` redirect | Full standard pattern |
| `schedule-visits/page.tsx` | `Alert` message | Soft guard (Alert, not redirect) |
| `my-visits/page.tsx` | Card message | Soft guard (card, not redirect) |

**Pages WITHOUT guards before Phase 2 (fixed in this phase):**

| Page | Finding |
|------|---------|
| `allocation-runs/page.tsx` | No import of `useUserRole`, no guard |
| `allocation-decisions/page.tsx` | No import of `useUserRole`, no guard |
| `allocation-quotas/page.tsx` | No import of `useUserRole`, no guard |
| `allocation-assignments/page.tsx` | No import of `useUserRole`, no guard |
| `case-assignments/page.tsx` | Imported `useUserRole` for `roleLoading` only — no `hasAnyRole` check |
| `subsidy-cases/page.tsx` | No import of `useUserRole`, no guard |
| `housing-registrations/page.tsx` | No import of `useUserRole`, no guard |
| `housing-waiting-list/page.tsx` | No import of `useUserRole`, no guard |

---

## 2. Role Assignments Applied

All role lists sourced directly from `src/assets/data/menu-items.ts` `allowedRoles` definitions. No new roles or permissions were introduced.

| Page | Allowed Roles Applied |
|------|----------------------|
| `allocation-runs` | `system_admin`, `project_leader` |
| `allocation-decisions` | `system_admin`, `minister`, `project_leader`, `frontdesk_housing`, `admin_staff`, `audit` |
| `allocation-quotas` | `system_admin`, `minister`, `project_leader`, `frontdesk_housing`, `admin_staff`, `audit` |
| `allocation-assignments` | `system_admin`, `minister`, `project_leader`, `frontdesk_housing`, `admin_staff`, `audit` |
| `case-assignments` | `system_admin`, `project_leader`, `social_field_worker`, `technical_inspector`, `admin_staff`, `director`, `ministerial_advisor`, `minister`, `audit` |
| `subsidy-cases` | `system_admin`, `minister`, `project_leader`, `frontdesk_bouwsubsidie`, `social_field_worker`, `technical_inspector`, `admin_staff`, `audit`, `director`, `ministerial_advisor` |
| `housing-registrations` | `system_admin`, `minister`, `project_leader`, `frontdesk_housing`, `admin_staff`, `audit` |
| `housing-waiting-list` | `system_admin`, `minister`, `project_leader`, `frontdesk_housing`, `admin_staff`, `audit` |

---

## 3. Guard Pattern Applied

All new guards follow the established pattern from `src/app/(admin)/audit-log/page.tsx` exactly:

```tsx
import { Navigate } from 'react-router-dom'
import type { AppRole } from '@/hooks/useUserRole'
import { useUserRole } from '@/hooks/useUserRole'

const ALLOWED_ROLES: AppRole[] = [/* roles from menu-items.ts */]

const PageComponent = () => {
  const { loading, hasAnyRole } = useUserRole()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!hasAnyRole(ALLOWED_ROLES)) {
    return <Navigate to="/dashboards" replace />
  }

  return (/* existing JSX unchanged */)
}
```

### Special Case: `case-assignments/page.tsx`

This page already imported `useUserRole` and used `loading: roleLoading` to gate its data fetch `useEffect`. The change:

- Added `hasAnyRole` to the existing `useUserRole()` destructuring
- Added `Navigate` import and `AppRole` type import
- Added `ALLOWED_ROLES` constant
- Added the role guard block **after** all hooks (state, callbacks, effects) per React hooks rules
- The existing `roleLoading` gate on the `useEffect` was preserved unchanged

### Special Case: `housing-waiting-list/page.tsx`

This page had its own data `loading` state and no `useUserRole` at all. The change:

- Added `useUserRole` import and `AppRole` type import
- Added `Navigate` import
- Added `ALLOWED_ROLES` constant
- Added `const { loading: roleLoading, hasAnyRole } = useUserRole()` as first hook inside the component
- Added the role guard (roleLoading spinner + `hasAnyRole` check) **before** the existing `if (loading) return null` data-loading guard
- This ordering ensures unauthorized users are rejected before any Supabase data fetch begins

### Dashboards Page — Intentionally Excluded

`dashboards/page.tsx` was NOT guarded. Reason: it is the redirect target (`<Navigate to="/dashboards" replace />`) for all unauthorized access in the guard pattern. Adding a role guard to dashboards would create an infinite redirect loop for roles without dashboard access (e.g., `social_field_worker`, `technical_inspector`). The dashboards page itself renders role-appropriate content via `useUserRole` internally.

---

## 4. Files Modified

| File | Change |
|------|--------|
| `src/app/(admin)/allocation-runs/page.tsx` | Added role guard — `system_admin`, `project_leader` |
| `src/app/(admin)/allocation-decisions/page.tsx` | Added role guard — housing admin roles |
| `src/app/(admin)/allocation-quotas/page.tsx` | Added role guard — housing admin roles |
| `src/app/(admin)/allocation-assignments/page.tsx` | Added role guard — housing admin roles |
| `src/app/(admin)/case-assignments/page.tsx` | Added `hasAnyRole` to existing `useUserRole` destructuring + guard block |
| `src/app/(admin)/subsidy-cases/page.tsx` | Added role guard — subsidy roles |
| `src/app/(admin)/housing-registrations/page.tsx` | Added role guard — housing admin roles |
| `src/app/(admin)/housing-waiting-list/page.tsx` | Added `useUserRole` + role guard before data loading check |

---

## 5. Files Created

| File | Purpose |
|------|---------|
| `restore-points/v1.8/Restore_Point_Phase_2_Start.md` | Pre-Phase-2 state snapshot |
| `docs/DVH-IMS/V1.8/PHASE_2_AUTHORIZATION_CONSISTENCY_REPORT.md` | This report |

---

## 6. Files NOT Modified

- No function source code was modified
- No RLS policies were changed
- No database schema was changed
- No new libraries or dependencies were added
- `src/routes/router.tsx` unchanged — router-level guard (`isAuthenticated`) remains as-is
- `src/hooks/useUserRole.ts` unchanged — hook implementation unchanged
- `src/assets/data/menu-items.ts` unchanged — role lists are the source of truth, not modified

---

## 7. Documentation Notes

- `docs/backend.md` — does not exist at this path. Backend design documentation lives in `docs/DVH-IMS-V1.2/DVH-IMS-V1.2_Backend_Design_Overview.md` (version-scoped). No update required.
- `docs/architecture.md` — does not exist at this path. Architecture documentation lives in `docs/DVH-IMS-V1.2/DVH-IMS-V1.2_Architecture_Overview_Logical.md` and `docs/manual/01-System-Overview-Architecture.md`. The frontend authorization layer behavior is captured in this report.
- `docs/DVH-IMS/V1.8/SYSTEM_STATUS_AUDIT_V1.8.md` — amended below.

---

## 8. Compatibility Impact

- **No behavioral change for authorized users.** Users with the correct role see the spinner for the duration of `useUserRole()` loading (typically <200ms), then the page renders normally.
- **New behavior for unauthorized users.** Direct URL navigation to a protected page now redirects to `/dashboards` instead of rendering the page. Previously, an authenticated user with any role could reach any admin page by URL.
- **No client code changes required** beyond the page files themselves.
- **Defense in depth preserved.** Supabase RLS remains the authoritative data security boundary. The page guards are a UX-layer enforcement that prevents unauthorized page rendering; they do not replace RLS.

---

## 9. Post-Deployment Test Scenarios

| Scenario | Expected Result |
|----------|----------------|
| `system_admin` navigates to `/allocation-runs` | Page renders normally |
| `frontdesk_housing` navigates to `/allocation-runs` | Redirected to `/dashboards` |
| `project_leader` navigates to `/allocation-runs` | Page renders normally |
| `frontdesk_housing` navigates to `/housing-registrations` | Page renders normally |
| `social_field_worker` navigates to `/housing-registrations` | Redirected to `/dashboards` |
| `frontdesk_bouwsubsidie` navigates to `/subsidy-cases` | Page renders normally |
| `frontdesk_housing` navigates to `/subsidy-cases` | Redirected to `/dashboards` |
| `social_field_worker` navigates to `/case-assignments` | Page renders normally |
| `technical_inspector` navigates to `/case-assignments` | Page renders normally |
| `frontdesk_housing` navigates to `/case-assignments` | Redirected to `/dashboards` |
| Any authenticated role navigates to `/dashboards` | Page renders (no guard, intentional) |
| Unauthenticated user navigates to any admin page | Redirected to `/auth/sign-in` (router-level guard unchanged) |

---

## 10. Rollback Procedure

To revert Phase 2 for any page:

1. Replace the page file with its pre-Phase-2 content as documented in `restore-points/v1.8/Restore_Point_Phase_2_Start.md`
2. No database changes to revert
3. No edge function changes to revert

The Supabase RLS policies continue to protect data regardless of whether the page guards are active.

---

## 11. Remaining Authorization Gaps (Out of Phase 2 Scope)

| Gap | Risk | Deferred To |
|-----|------|------------|
| Router-level guard checks `isAuthenticated` only — no role check at route level | LOW — page guards cover this | Phase 3 planning |
| `schedule-visits/page.tsx` uses Alert (soft guard) instead of Navigate redirect — inconsistent with established pattern | LOW | Phase 3 stabilization |
| `my-visits/page.tsx` uses Card message (soft guard) — inconsistent | LOW | Phase 3 stabilization |
| Individual case/registration detail pages (`/subsidy-cases/[id]`, `/housing-registrations/[id]`) — role enforcement is internal to the 997-line page component | LOW — RLS protects the data | Phase 3 / refactor scope |

---

## 12. Conclusion

Phase 2 is complete. All 8 identified unguarded admin pages now redirect unauthorized authenticated users to `/dashboards`. The guard pattern is consistent with the established `audit-log/page.tsx` reference. Role lists are sourced directly from the existing navigation layer (`menu-items.ts`) with no new permissions introduced.

**Phase 2 Status: COMPLETE**
**Authorized next step: Await Phase 3 authorization.**
