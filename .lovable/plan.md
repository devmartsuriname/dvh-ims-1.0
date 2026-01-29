
# DVH-IMS V1.2 — Tier 2 Fixes: Actor Role & Document Audit Logging

## Executive Summary

Implement two targeted fixes to enhance audit logging coverage:
1. Populate `actor_role` consistently in all audit events
2. Expand entity types to include document operations (infrastructure prep)

---

## 1. Fix 1: Actor Role Population

### Current State

```typescript
// src/hooks/useAuditLog.ts (current)
const { error } = await supabase.from('audit_event').insert([{
  actor_user_id: user.id,
  entity_type: entityType,
  entity_id: entityId,
  action: params.action.toUpperCase(),
  reason: params.reason ?? null,
  metadata_json: params.metadata ?? null,
  // actor_role is NOT populated
}])
```

### Required Change

Fetch the user's role from `user_roles` table and include it in the audit event:

```typescript
// Enhanced logAuditEvent
export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('Cannot log audit event: no authenticated user')
    return
  }

  // NEW: Fetch user's role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const actorRole = roleData?.role || 'unknown'

  const entityType = params.entityType || params.entity_type
  const entityId = params.entityId || params.entity_id

  const { error } = await supabase.from('audit_event').insert([{
    actor_user_id: user.id,
    actor_role: actorRole,  // NEW: populated
    entity_type: entityType,
    entity_id: entityId,
    action: params.action.toUpperCase(),
    reason: params.reason ?? null,
    metadata_json: params.metadata ?? null,
  }])

  if (error) {
    console.error('Failed to log audit event:', error)
  }
}
```

### Impact

- **Files Modified:** 1 (`src/hooks/useAuditLog.ts`)
- **Side Effects:** None — all 12 components using this utility will automatically benefit
- **Performance:** One additional query per audit event (acceptable for audit-grade traceability)

---

## 2. Fix 2: Expand Entity Types

### Current Entity Types

```typescript
type EntityType = 'person' | 'household' | 'household_member' | 'contact_point' | 
  'address' | 'subsidy_case' | 'subsidy_document' | 'social_report' | 
  'technical_report' | 'housing_registration' | 'housing_urgency' | 
  'district_quota' | 'allocation_run' | 'allocation_decision' | 'assignment_record'
```

### Required Addition

```typescript
type EntityType = 'person' | 'household' | 'household_member' | 'contact_point' | 
  'address' | 'subsidy_case' | 'subsidy_document' | 'subsidy_document_upload' | 
  'social_report' | 'technical_report' | 'housing_registration' | 'housing_urgency' | 
  'district_quota' | 'allocation_run' | 'allocation_decision' | 'assignment_record'
```

**Note:** `subsidy_document_upload` is added to match the database table name for document uploads.

---

## 3. Implementation Scope

### IN SCOPE

| Item | Description | File |
|------|-------------|------|
| Actor role fetch | Query `user_roles` table | `src/hooks/useAuditLog.ts` |
| Actor role populate | Include in audit insert | `src/hooks/useAuditLog.ts` |
| Entity type expansion | Add `subsidy_document_upload` | `src/hooks/useAuditLog.ts` |

### OUT OF SCOPE (Per Phase 2 Limits)

| Item | Reason |
|------|--------|
| Document upload UI | UI doesn't exist in admin panel |
| Document verification UI | UI doesn't exist in admin panel |
| Report finalization auditing | Would require UI changes |
| Backend transition validation | Phase 3 scope |
| Correlation ID | Phase 3 scope |

---

## 4. Verification

After implementation:

1. **Test audit event creation** — Verify `actor_role` is populated
2. **Check existing flows** — Status changes, decisions, assignments should include role
3. **Database validation** — Query `audit_event` table to confirm `actor_role` values

---

## 5. Technical Implementation

### File: `src/hooks/useAuditLog.ts`

**Changes:**
1. Add role fetching logic after user authentication check
2. Include `actor_role` in insert payload
3. Expand `EntityType` to include `subsidy_document_upload`

### Affected Components (No Changes Required)

These 12 files use `logAuditEvent()` and will automatically receive the enhancement:

| Component | Usage |
|-----------|-------|
| `PersonFormModal.tsx` | CREATE/UPDATE person |
| `HouseholdFormModal.tsx` | CREATE household |
| `CaseFormModal.tsx` | CREATE subsidy_case |
| `RegistrationFormModal.tsx` | CREATE housing_registration |
| `DecisionFormModal.tsx` | CREATE allocation_decision |
| `AssignmentFormModal.tsx` | CREATE assignment_record |
| `UrgencyAssessmentForm.tsx` | CREATE housing_urgency |
| `QuotaTable.tsx` | CREATE/UPDATE district_quota |
| `RunExecutorModal.tsx` | CREATE allocation_run |
| `subsidy-cases/[id]/page.tsx` | STATUS_CHANGE |
| `housing-registrations/[id]/page.tsx` | STATUS_CHANGE |

---

## 6. Deliverables

1. Updated `src/hooks/useAuditLog.ts` with actor role population
2. Verification that new audit events include `actor_role`
3. Phase 2 documentation update noting Tier 2 completion

---

## 7. Governance Compliance

| Rule | Status |
|------|--------|
| No role changes | ✅ Compliant |
| No enum modifications | ✅ Compliant |
| No UI redesign | ✅ Compliant |
| No workflow logic changes | ✅ Compliant |
| Darkone 1:1 compliance | ✅ N/A (backend only) |

---

## 8. Risk Assessment

| Risk | Mitigation |
|------|------------|
| Role query fails | Fallback to 'unknown' — audit event still created |
| Performance impact | Single indexed query — negligible |
| Breaking changes | None — additive enhancement only |

---

**Ready to implement upon approval.**
