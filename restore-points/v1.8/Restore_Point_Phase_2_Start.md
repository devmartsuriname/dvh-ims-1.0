# Restore Point: DVH-IMS Phase 2 — Authorization Consistency Start

**Created:** 2026-03-18
**Phase:** Pre-Phase 2 (Authorization Consistency)
**Authority:** Delroy
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Baseline State

This restore point captures the state of all 8 unguarded admin page files immediately before Phase 2 role guard implementation. Phase 1 (Security Hardening) is complete. No Phase 2 changes have been applied yet.

---

## Files to be Modified in Phase 2

| File | Current State | Change |
|------|--------------|--------|
| `src/app/(admin)/allocation-runs/page.tsx` | No guard | Add role guard: `system_admin`, `project_leader` |
| `src/app/(admin)/allocation-decisions/page.tsx` | No guard | Add role guard: housing admin roles |
| `src/app/(admin)/allocation-quotas/page.tsx` | No guard | Add role guard: housing admin roles |
| `src/app/(admin)/allocation-assignments/page.tsx` | No guard | Add role guard: housing admin roles |
| `src/app/(admin)/case-assignments/page.tsx` | Imports `useUserRole` but no `hasAnyRole` check | Add `hasAnyRole` guard |
| `src/app/(admin)/subsidy-cases/page.tsx` | No guard | Add role guard: subsidy roles |
| `src/app/(admin)/housing-registrations/page.tsx` | No guard | Add role guard: housing admin roles |
| `src/app/(admin)/housing-waiting-list/page.tsx` | No guard, no `useUserRole` | Add `useUserRole` + role guard before data loading check |

---

## Pre-Phase-2 File Contents

### `src/app/(admin)/allocation-runs/page.tsx`
```tsx
import PageTitle from '@/components/PageTitle'
import RunTable from './components/RunTable'

const AllocationRuns = () => {
  return (
    <>
      <PageTitle subName="Allocation Engine" title="Allocation Runs" />
      <RunTable />
    </>
  )
}

export default AllocationRuns
```

### `src/app/(admin)/allocation-decisions/page.tsx`
```tsx
import PageTitle from '@/components/PageTitle'
import DecisionTable from './components/DecisionTable'

const AllocationDecisions = () => {
  return (
    <>
      <PageTitle subName="Allocation Engine" title="Allocation Decisions" />
      <DecisionTable />
    </>
  )
}

export default AllocationDecisions
```

### `src/app/(admin)/allocation-quotas/page.tsx`
```tsx
import PageTitle from '@/components/PageTitle'
import QuotaTable from './components/QuotaTable'

const AllocationQuotas = () => {
  return (
    <>
      <PageTitle subName="Allocation Engine" title="District Quotas" />
      <QuotaTable />
    </>
  )
}

export default AllocationQuotas
```

### `src/app/(admin)/allocation-assignments/page.tsx`
```tsx
import PageTitle from '@/components/PageTitle'
import AssignmentTable from './components/AssignmentTable'

const AllocationAssignments = () => {
  return (
    <>
      <PageTitle subName="Allocation Engine" title="Assignment Registration" />
      <AssignmentTable />
    </>
  )
}

export default AllocationAssignments
```

### `src/app/(admin)/case-assignments/page.tsx`
```tsx
import { useState, useEffect, useCallback } from 'react'
import { Card, Button, Badge, Table } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import { useCaseAssignments, type CaseAssignment } from '@/hooks/useCaseAssignments'
import { useUserRole } from '@/hooks/useUserRole'
import { supabase } from '@/integrations/supabase/client'
import AssignmentFormModal from './components/AssignmentFormModal'
import RevokeModal from './components/RevokeModal'
// ...
const CaseAssignmentsPage = () => {
  const { canWrite, fetchAssignments, assignWorker, revokeAssignment, completeAssignment, loading } = useCaseAssignments()
  const { loading: roleLoading } = useUserRole()
  // No hasAnyRole — no role guard in place
  // ...
}
```

### `src/app/(admin)/subsidy-cases/page.tsx`
```tsx
import PageTitle from '@/components/PageTitle'
import CaseTable from './components/CaseTable'

const SubsidyCaseList = () => {
  return (
    <>
      <PageTitle subName="Bouwsubsidie" title="Subsidy Cases" />
      <CaseTable />
    </>
  )
}

export default SubsidyCaseList
```

### `src/app/(admin)/housing-registrations/page.tsx`
```tsx
import PageTitle from '@/components/PageTitle'
import RegistrationTable from './components/RegistrationTable'

const HousingRegistrationList = () => {
  return (
    <>
      <PageTitle subName="Woning Registratie" title="Registrations" />
      <RegistrationTable />
    </>
  )
}

export default HousingRegistrationList
```

### `src/app/(admin)/housing-waiting-list/page.tsx`
```tsx
import { useEffect, useState, useCallback } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Spinner, Badge, Form, Row, Col } from 'react-bootstrap'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import PageTitle from '@/components/PageTitle'
import { supabase } from '@/integrations/supabase/client'
// No useUserRole — no role guard in place
const HousingWaitingList = () => {
  const [entries, setEntries] = useState<WaitingListEntry[]>([])
  const [loading, setLoading] = useState(true)
  // ...
  if (loading) {
    return null
  }
  // ...
}
```

---

## Rollback Instructions

To restore the pre-Phase-2 state for any of these files:

1. Replace the file content with the corresponding pre-Phase-2 content above.
2. No database changes were made in Phase 2.
3. No edge function changes were made in Phase 2.
4. No new dependencies are added — only existing `useUserRole` hook and `Navigate` from `react-router-dom`.

**Note:** The role guards are purely additive UI-layer enforcement. Removing them does not create a data security breach — Supabase RLS remains the authoritative security boundary. Rollback is safe at any time.

---

## Established Guard Pattern (Reference)

The guard pattern follows `src/app/(admin)/audit-log/page.tsx` exactly:

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
