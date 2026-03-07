# V1.9 Phase 2 — Notification Routing Fix (GAP-2)

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Current State

Line 407 in `subsidy-cases/[id]/page.tsx`:

```
recipientRole: 'frontdesk_bouwsubsidie',
```

Hardcoded for all transitions.

## Implementation

**Single file change:** `src/app/(admin)/subsidy-cases/[id]/page.tsx`

### 1. Add `NEXT_RESPONSIBLE_ROLE` constant (after `ROLE_ALLOWED_TRANSITIONS`, before component)

Maps each target status to the role responsible for acting on it:

```typescript
const NEXT_RESPONSIBLE_ROLE: Record<string, string> = {
  in_social_review: 'social_field_worker',
  social_completed: 'project_leader',
  returned_to_intake: 'frontdesk_bouwsubsidie',
  in_technical_review: 'technical_inspector',
  technical_approved: 'project_leader',
  returned_to_social: 'social_field_worker',
  in_admin_review: 'admin_staff',
  admin_complete: 'project_leader',
  returned_to_technical: 'technical_inspector',
  screening: 'project_leader',
  needs_more_docs: 'frontdesk_bouwsubsidie',
  fieldwork: 'project_leader',
  awaiting_director_approval: 'director',
  director_approved: 'project_leader',
  returned_to_screening: 'project_leader',
  in_ministerial_advice: 'ministerial_advisor',
  ministerial_advice_complete: 'project_leader',
  returned_to_director: 'director',
  awaiting_minister_decision: 'minister',
  minister_approved: 'project_leader',
  returned_to_advisor: 'ministerial_advisor',
  approved_for_council: 'project_leader',
  council_doc_generated: 'project_leader',
  finalized: 'project_leader',
  rejected: 'project_leader',
}
```

### 2. Replace hardcoded recipientRole (line 407)

Change:

```typescript
recipientRole: 'frontdesk_bouwsubsidie',
```

To:

```typescript
recipientRole: NEXT_RESPONSIBLE_ROLE[newStatus] || 'frontdesk_bouwsubsidie',
```

Fallback to `frontdesk_bouwsubsidie` for any unmapped status (defensive).

---

Approved.

During verification, also confirm that every status in STATUS_TRANSITIONS

has a corresponding entry in NEXT_RESPONSIBLE_ROLE.

Fallback to 'frontdesk_bouwsubsidie' is acceptable for unmapped statuses,

but the goal is to achieve full routing coverage.  
  
  
**What does NOT change**

- No database changes
- No migrations
- No new tables
- No RLS changes
- Phase 1 RBAC logic untouched
- All other notification parameters (title, message, entityType, correlationId) unchanged

## Verification

After implementation, trigger status transitions via the admin panel and confirm `admin_notification` records show the correct `recipient_role` per the routing map.