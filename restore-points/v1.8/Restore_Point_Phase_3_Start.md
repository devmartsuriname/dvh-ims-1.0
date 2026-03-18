# Restore Point: DVH-IMS Phase 3 — Stability & Error Handling Start

**Created:** 2026-03-18
**Phase:** Pre-Phase 3 (Stability & Error Handling)
**Authority:** Delroy
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Baseline State

Phase 1 (Security Hardening) and Phase 2 (Authorization Consistency) are complete. This restore point captures the state of all files that Phase 3 will modify.

---

## Files to be Modified in Phase 3

| File | Issue | Change |
|------|-------|--------|
| `src/context/useAuthContext.tsx` | No `.catch()` on `getSession()` + blank `null` loading screen | Add `.catch()`, replace `null` with spinner |
| `src/app/(admin)/subsidy-cases/components/CaseTable.tsx` | `if (loading) return null` | Replace `null` with spinner |
| `src/app/(admin)/housing-registrations/components/RegistrationTable.tsx` | `if (loading) return null` | Replace `null` with spinner |
| `src/app/(admin)/housing-waiting-list/page.tsx` | `if (loading) return null` (data load) | Replace `null` with spinner |
| `src/app/(admin)/allocation-runs/components/RunTable.tsx` | `{loading ? null : ...}` | Replace `null` with inline spinner |
| `src/app/(admin)/allocation-decisions/components/DecisionTable.tsx` | `{loading ? null : ...}` | Replace `null` with inline spinner |
| `src/app/(admin)/allocation-quotas/components/QuotaTable.tsx` | `{loading ? null : ...}` | Replace `null` with inline spinner |
| `src/app/(admin)/allocation-assignments/components/AssignmentTable.tsx` | `{loading ? null : ...}` | Replace `null` with inline spinner |
| `src/app/(admin)/schedule-visits/page.tsx` | `if (loading \|\| roleLoading) return null` | Replace `null` with spinner |
| `src/app/(admin)/my-visits/page.tsx` | `if (loading) return null` | Replace `null` with spinner |

---

## Pre-Phase-3 Critical Code Sections

### `src/context/useAuthContext.tsx` — lines 41–59 before change
```tsx
// THEN check for existing session
supabase.auth.getSession().then(({ data: { session } }) => {
  setSession(session)
  setUser(session?.user ?? null)
  setIsLoading(false)
})
// No .catch() — unhandled rejection if getSession() fails

// ...

// Show nothing while loading to prevent flash of unauthenticated content
if (isLoading) {
  return null
}
```

### Loading guard pattern — all table components (example from CaseTable.tsx)
```tsx
// Initial load handled by route-level Suspense
if (loading) {
  return null
}
```

### Inline null pattern — allocation tables (example from RunTable.tsx)
```tsx
{loading ? null : runs.length === 0 ? (
  <p className="text-muted text-center py-4">...</p>
) : (
  <Grid ... />
)}
```

### schedule-visits/page.tsx line 49
```tsx
if (loading || roleLoading) return null
```

### my-visits/page.tsx line 42
```tsx
if (loading) return null
```

---

## Rollback Instructions

To revert Phase 3 for any file, restore the code sections above. No database changes are made in Phase 3. No new libraries are introduced. Changes are purely to loading states and error handling.
