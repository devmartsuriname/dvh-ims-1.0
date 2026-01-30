
# DVH-IMS V1.3 — Phase 2 Scope & Execution Plan

**Document Type:** Phase Scope & Execution Plan  
**Version:** 1.0  
**Date:** 2026-01-30  
**Phase:** Phase 2 — Admin Notifications (S-03)  
**Authorization Basis:** V1.3 Phase 2 Authorization Decision — APPROVED

---

## 1. Authorization Confirmation

| Item | Status |
|------|--------|
| V1.3 Phase 1 | CLOSED & LOCKED |
| V1.3 Phase 2 Authorization | APPROVED |
| Authorized Scope | S-03: Admin Notifications |
| Operational Baseline | DVH-IMS V1.1 |
| Documentation Baseline | DVH-IMS V1.2 (FROZEN) |
| Phase Status | OPEN — Awaiting Restore Point |

---

## 2. Phase 2 Scope Summary

### 2.1 Authorized Implementation (S-03)

| ID | Item | Description |
|----|------|-------------|
| S-03-A | Notification Schema | `admin_notification` table for in-app notifications |
| S-03-B | Notification Hook | React hook to fetch/manage admin notifications |
| S-03-C | Notification Display | Live notification dropdown using existing Darkone component |
| S-03-D | Audit Integration | Every notification linked to `correlation_id` |
| S-03-E | Failure Logging | Notification delivery failures logged to audit |

### 2.2 Explicit Exclusions

| Item | Status |
|------|--------|
| Public notifications | NOT AUTHORIZED |
| Citizen communication | NOT AUTHORIZED |
| Email delivery | NOT AUTHORIZED |
| SMS delivery | NOT AUTHORIZED |
| Push notifications | NOT AUTHORIZED |
| External webhooks | NOT AUTHORIZED |
| Bulk notifications | NOT AUTHORIZED |
| Async queues/retry | NOT AUTHORIZED |
| Scale optimizations | NOT AUTHORIZED |
| UI redesign | NOT AUTHORIZED |
| Role changes | NOT AUTHORIZED |
| Enum changes | NOT AUTHORIZED |
| RLS policy changes | NOT AUTHORIZED |

---

## 3. Current State Analysis

### 3.1 Existing Notification Infrastructure

**Current Components:**
- `src/components/layout/TopNavigationBar/components/Notifications.tsx` — Static dropdown component using Darkone design
- `src/assets/data/topbar.ts` — Empty notification data array (explicitly marked "OUT OF SCOPE for v1.0/v1.1")
- `src/context/useNotificationContext.tsx` — Toast notification context (for UI feedback, not persistent notifications)
- `src/types/data.ts` — Basic `NotificationType` interface (`from`, `content`, `icon`)

**Current Behavior:**
- Notifications component shows empty state with "No notifications" message
- No database persistence
- No connection to audit events or dossier transitions

### 3.2 Audit Infrastructure (from Phase 1)

**Available Resources:**
- `audit_event` table with `correlation_id` column (D-02)
- Backend triggers logging all status transitions (D-01)
- `INVALID_TRANSITION_BLOCKED` audit events with correlation tracking
- `logAuditEvent` utility in `src/hooks/useAuditLog.ts`

### 3.3 Status Transition Points

**Subsidy Case Transitions:**
- `received` → `screening`, `rejected`
- `screening` → `needs_more_docs`, `fieldwork`, `rejected`
- `needs_more_docs` → `screening`, `rejected`
- `fieldwork` → `approved_for_council`, `rejected`
- `approved_for_council` → `council_doc_generated`, `rejected`
- `council_doc_generated` → `finalized`, `rejected`

**Housing Registration Transitions:**
- `received` → `under_review`, `rejected`
- `under_review` → `urgency_assessed`, `rejected`
- `urgency_assessed` → `waiting_list`, `rejected`
- `waiting_list` → `matched`, `rejected`
- `matched` → `allocated`, `rejected`
- `allocated` → `finalized`, `rejected`

---

## 4. Implementation Strategy

### 4.1 Notification Approach

| Aspect | Decision | Justification |
|--------|----------|---------------|
| Storage | Database table (`admin_notification`) | Persistent, queryable, auditable |
| Delivery | In-app only | As authorized, no external channels |
| Trigger Source | Status transitions from admin UI | As authorized, no public wizard |
| Recipient Model | Role-based via RLS | Aligned with V1.2 blueprint |
| Audit Linkage | Via `correlation_id` | Leverages D-02 infrastructure |

### 4.2 Implementation Phases

| Step | Description |
|------|-------------|
| 2A | Create Restore Point: `RESTORE_POINT_V1.3_PHASE2_S03_START` |
| 2B | Create `admin_notification` table with RLS policies |
| 2C | Create notification hook `useAdminNotifications` |
| 2D | Integrate hook with existing Notifications.tsx component |
| 2E | Add notification creation to status transition handlers |
| 2F | Implement "mark as read" and "clear all" functionality |
| 2G | Implement notification failure logging |
| 2H | Verification testing |
| 2I | Phase closure |

---

## 5. Database Schema Design

### 5.1 Admin Notification Table

```text
Table: admin_notification

Columns:
- id: uuid (PK, default gen_random_uuid())
- recipient_user_id: uuid (FK to auth.users, nullable for role-based)
- recipient_role: text (app_role, for role-based targeting)
- district_code: text (for district-scoped notifications)
- notification_type: text (e.g., 'status_change', 'transition_blocked')
- title: text (short title)
- message: text (notification content)
- entity_type: text (e.g., 'subsidy_case', 'housing_registration')
- entity_id: uuid (reference to related entity)
- correlation_id: uuid (links to audit_event.correlation_id)
- is_read: boolean (default false)
- read_at: timestamptz (nullable)
- created_at: timestamptz (default now())
- created_by: uuid (actor who triggered the notification)
```

### 5.2 RLS Policies (Restrictive)

| Policy | Command | Logic |
|--------|---------|-------|
| `role_select_own_notification` | SELECT | User can see notifications where: (1) recipient_user_id = auth.uid() OR (2) recipient_role matches user's role AND district_code matches user's district |
| `role_insert_admin_notification` | INSERT | Authenticated users with valid admin roles can create notifications |
| `role_update_own_notification` | UPDATE | User can mark as read only their own notifications |
| No DELETE | - | Notifications are immutable (audit trail) |

### 5.3 Indexes

| Index | Purpose |
|-------|---------|
| `idx_admin_notification_recipient_user_id` | Fast user-specific queries |
| `idx_admin_notification_recipient_role` | Fast role-based queries |
| `idx_admin_notification_correlation_id` | Audit event linkage |
| `idx_admin_notification_is_read` | Unread count queries |

---

## 6. Notification Types

### 6.1 Authorized Notification Types

| Type | Trigger | Recipient | Message Pattern |
|------|---------|-----------|-----------------|
| `status_change` | Successful status transition | Handler role for district | "Case {number} status changed to {new_status}" |
| `transition_blocked` | Invalid transition attempt (from D-01 trigger) | Actor + supervisory role | "Transition blocked: {reason}" |

### 6.2 Notification Flow

```text
┌────────────────────────────────────────────────────────────┐
│  1. Admin performs status change in UI                     │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│  2. D-01 trigger validates transition                      │
│     - If VALID: proceed to step 3                          │
│     - If INVALID: log INVALID_TRANSITION_BLOCKED + notify  │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│  3. Status update succeeds                                 │
│     - Insert status_history record                         │
│     - Log audit_event with correlation_id                  │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│  4. Create admin_notification                              │
│     - Same correlation_id as audit event                   │
│     - Target: handler roles for district                   │
│     - Log notification creation to audit                   │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│  5. Notifications component fetches unread count           │
│     - Real-time update via Supabase subscription           │
└────────────────────────────────────────────────────────────┘
```

---

## 7. React Hook Design

### 7.1 useAdminNotifications Hook

```text
Hook: useAdminNotifications

Returns:
- notifications: AdminNotification[]
- unreadCount: number
- loading: boolean
- error: string | null
- markAsRead: (id: string) => Promise<void>
- markAllAsRead: () => Promise<void>
- refresh: () => void

Features:
- Fetches notifications for current user (RLS-filtered)
- Real-time subscription for new notifications
- Automatic refetch on auth state change
- Audit logging for mark-as-read actions
```

### 7.2 Integration Points

| File | Change |
|------|--------|
| `src/hooks/useAdminNotifications.ts` | NEW: Notification data hook |
| `src/components/layout/TopNavigationBar/components/Notifications.tsx` | MODIFY: Replace static data with hook |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | MODIFY: Add notification on status change |
| `src/app/(admin)/housing-registrations/[id]/page.tsx` | MODIFY: Add notification on status change |

---

## 8. Audit Integration

### 8.1 Correlation Strategy

| Event | Correlation ID Source |
|-------|----------------------|
| Status change → Notification | Same correlation_id from audit_event |
| Transition blocked → Notification | Same correlation_id from trigger audit |
| Notification read | New correlation_id for read action |
| Notification failure | Same correlation_id as failed notification |

### 8.2 Audit Event Types (New)

| Action | Entity Type | Description |
|--------|-------------|-------------|
| `NOTIFICATION_CREATED` | `admin_notification` | Notification generated |
| `NOTIFICATION_READ` | `admin_notification` | User marked notification as read |
| `NOTIFICATION_FAILED` | `admin_notification` | Notification creation failed |

---

## 9. Failure Handling

### 9.1 Failure Scenarios

| Scenario | Handling | Audit |
|----------|----------|-------|
| RLS blocks notification insert | Log error, continue operation | `NOTIFICATION_FAILED` with reason |
| Database error on insert | Log error, notify user, continue | `NOTIFICATION_FAILED` with error details |
| User not found for role | Log warning, skip user | Logged in metadata_json |

### 9.2 Failure Logging Pattern

```text
Every notification failure MUST:
1. Log to console (development visibility)
2. Create audit_event with action='NOTIFICATION_FAILED'
3. Include correlation_id linking to source event
4. NOT block the primary operation (status change)
```

---

## 10. Verification Matrix

### 10.1 S-03 Verification Tests

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| S03-T01 | admin_notification table exists | Table created |
| S03-T02 | RLS policies attached | 3 policies verified |
| S03-T03 | Notification created on status change | Record in admin_notification |
| S03-T04 | Notification has valid correlation_id | UUID matches audit_event |
| S03-T05 | Unread count displays in topbar | Badge shows count |
| S03-T06 | Mark as read updates is_read | is_read = true, read_at set |
| S03-T07 | Mark all as read works | All user notifications marked |
| S03-T08 | Notification failure logged | audit_event with NOTIFICATION_FAILED |
| S03-T09 | Public wizard does NOT create notifications | No notifications for anon |
| S03-T10 | V1.1 status change behavior unchanged | Status changes work as before |

---

## 11. Rollback Strategy

### 11.1 Emergency Rollback SQL

```sql
-- Step 1: Drop policies
DROP POLICY IF EXISTS role_select_own_notification ON public.admin_notification;
DROP POLICY IF EXISTS role_insert_admin_notification ON public.admin_notification;
DROP POLICY IF EXISTS role_update_own_notification ON public.admin_notification;

-- Step 2: Drop table
DROP TABLE IF EXISTS public.admin_notification;
```

### 11.2 Code Rollback

- Revert `Notifications.tsx` to static empty array
- Remove `useAdminNotifications.ts` hook
- Remove notification creation calls from status change handlers

---

## 12. Non-Goals (Explicit)

| Item | Reason | Status |
|------|--------|--------|
| Email notifications | Not authorized | EXCLUDED |
| SMS notifications | Not authorized | EXCLUDED |
| Push notifications | Not authorized | EXCLUDED |
| Public/citizen notifications | Not authorized | EXCLUDED |
| Reminder/escalation automation | Not authorized | EXCLUDED |
| Bulk notifications | Not authorized | EXCLUDED |
| Async queues | Not authorized | EXCLUDED |
| Retry mechanisms | Not authorized | EXCLUDED |
| UI redesign | Not authorized | EXCLUDED |

---

## 13. Deliverables Checklist

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Restore Point: `RESTORE_POINT_V1.3_PHASE2_S03_START` | PENDING |
| 2 | Database migration: `admin_notification` table | PENDING |
| 3 | RLS policies for `admin_notification` | PENDING |
| 4 | Hook: `useAdminNotifications.ts` | PENDING |
| 5 | Modified: `Notifications.tsx` | PENDING |
| 6 | Modified: Subsidy case status change handler | PENDING |
| 7 | Modified: Housing registration status change handler | PENDING |
| 8 | Admin Notification Implementation Report | PENDING |
| 9 | Audit-Notification Correlation Verification Report | PENDING |
| 10 | Notification Failure Handling Report | PENDING |
| 11 | Phase 2 Closure Report | PENDING |

---

## 14. Implementation Sequence

```text
Phase 2 Execution Flow:

┌──────────────────────────────────────────────────────┐
│  STEP 2A: Create Restore Point                       │
│  RESTORE_POINT_V1.3_PHASE2_S03_START                 │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│  STEP 2B: Database Schema                            │
│  - Create admin_notification table                   │
│  - Add RLS policies                                  │
│  - Add indexes                                       │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│  STEP 2C: React Hook                                 │
│  - Create useAdminNotifications.ts                   │
│  - Implement fetch, subscribe, mark-read logic       │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│  STEP 2D: UI Integration                             │
│  - Update Notifications.tsx to use hook              │
│  - Replace static data with live data                │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│  STEP 2E: Status Change Integration                  │
│  - Add createNotification to subsidy case handler    │
│  - Add createNotification to housing handler         │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│  STEP 2F-2G: Additional Features                     │
│  - Mark as read / clear all functionality            │
│  - Failure logging implementation                    │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│  STEP 2H: Verification                               │
│  - Execute S03-T01 through S03-T10                   │
│  - Confirm audit linkage                             │
│  - Confirm V1.1 behavior preserved                   │
└──────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────┐
│  STEP 2I: Phase Closure                              │
│  - Phase 2 Closure Report                            │
│  - Confirm all exclusions respected                  │
└──────────────────────────────────────────────────────┘
```

---

## 15. Governance Compliance Statement

| Rule | Status |
|------|--------|
| Phase-gated execution | COMPLIANT |
| Restore point before implementation | PENDING |
| No scope expansion beyond S-03 | ENFORCED |
| Every change traceable to S-03 | ENFORCED |
| Status reports for each sub-step | REQUIRED |
| No email, SMS, push, or external channels | ENFORCED |
| No public wizard changes | ENFORCED |
| No role, enum, or RLS changes outside admin_notification | ENFORCED |

---

## 16. Final Statement

**V1.3 Phase 2 is strictly limited to Admin Notifications (S-03).**

**No other V1.2 items are authorized.**

**Any deviation requires explicit written approval.**

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE2_S03_START.md` | CREATE | Mandatory restore point |
| `phases/DVH-IMS-V1.3/PHASE-2-Scope-and-Execution-Plan.md` | CREATE | This document |
| Database migration | EXECUTE | Create admin_notification table + RLS |
| `src/hooks/useAdminNotifications.ts` | CREATE | Notification data hook |
| `src/components/layout/TopNavigationBar/components/Notifications.tsx` | MODIFY | Live notification integration |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | MODIFY | Add notification on status change |
| `src/app/(admin)/housing-registrations/[id]/page.tsx` | MODIFY | Add notification on status change |

---

**Awaiting approval to create Restore Point and begin implementation.**
