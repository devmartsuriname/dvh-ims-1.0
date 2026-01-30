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
| Phase Status | OPEN — In Progress |

---

## 2. Phase 2 Scope Summary

### 2.1 Authorized Implementation (S-03)

| ID | Item | Description | Status |
|----|------|-------------|--------|
| S-03-A | Notification Schema | `admin_notification` table for in-app notifications | ✅ COMPLETE |
| S-03-B | Notification Hook | React hook to fetch/manage admin notifications | ✅ COMPLETE |
| S-03-C | Notification Display | Live notification dropdown using existing Darkone component | ✅ COMPLETE |
| S-03-D | Audit Integration | Every notification linked to `correlation_id` | ✅ COMPLETE |
| S-03-E | Failure Logging | Notification delivery failures logged to audit | ✅ COMPLETE |

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
| RLS policy changes (existing tables) | NOT AUTHORIZED |

---

## 3. Implementation Steps

| Step | Description | Status |
|------|-------------|--------|
| 2A | Create Restore Point | ✅ COMPLETE |
| 2B | Create `admin_notification` table with RLS | ✅ COMPLETE |
| 2C | Create `useAdminNotifications` hook | ✅ COMPLETE |
| 2D | Integrate hook with `Notifications.tsx` | ✅ COMPLETE |
| 2E | Add notification creation to status handlers | ✅ COMPLETE |
| 2F | Implement mark as read functionality | ✅ COMPLETE |
| 2G | Implement failure logging | ✅ COMPLETE |
| 2H | Verification testing (S03-T01 to S03-T10) | PENDING |
| 2I | Phase closure | PENDING |

---

## 4. Database Schema

### 4.1 Admin Notification Table

```sql
CREATE TABLE public.admin_notification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id uuid,
  recipient_role text,
  district_code text,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  correlation_id uuid NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
```

### 4.2 RLS Policies

| Policy | Command | Logic |
|--------|---------|-------|
| `role_select_own_notification` | SELECT | User-specific or role+district match |
| `role_insert_admin_notification` | INSERT | Valid admin roles only |
| `role_update_own_notification` | UPDATE | Own notifications only (mark read) |

---

## 5. Verification Matrix

| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| S03-T01 | admin_notification table exists | Table created | PENDING |
| S03-T02 | RLS policies attached | 3 policies verified | PENDING |
| S03-T03 | Notification created on status change | Record in admin_notification | PENDING |
| S03-T04 | Notification has valid correlation_id | UUID matches audit_event | PENDING |
| S03-T05 | Unread count displays in topbar | Badge shows count | PENDING |
| S03-T06 | Mark as read updates is_read | is_read = true, read_at set | PENDING |
| S03-T07 | Mark all as read works | All user notifications marked | PENDING |
| S03-T08 | Notification failure logged | audit_event with NOTIFICATION_FAILED | PENDING |
| S03-T09 | Public wizard does NOT create notifications | No notifications for anon | PENDING |
| S03-T10 | V1.1 status change behavior unchanged | Status changes work as before | PENDING |

---

## 6. Governance Compliance

| Rule | Status |
|------|--------|
| Restore point created before implementation | ✅ COMPLETE |
| No scope expansion beyond S-03 | ✅ VERIFIED |
| Every change traceable to S-03 | ENFORCED |
| No email, SMS, push, or external channels | ENFORCED |
| No public wizard changes | ENFORCED |
| No role, enum, or RLS changes outside admin_notification | ENFORCED |

---

## 7. Final Statement

**V1.3 Phase 2 is strictly limited to Admin Notifications (S-03).**

**No other V1.2 items are authorized.**

**Any deviation requires explicit written approval.**
