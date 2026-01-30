# Restore Point: V1.3 Phase 2 S-03 Start

**Document Type:** Restore Point  
**Version:** 1.0  
**Date:** 2026-01-30  
**Phase:** Phase 2 — Admin Notifications (S-03)  
**Restore Point ID:** `RESTORE_POINT_V1.3_PHASE2_S03_START`

---

## 1. Purpose

This restore point marks the start of V1.3 Phase 2 (Admin Notifications - S-03) implementation. It captures the system state immediately before any S-03 code or schema changes are made.

---

## 2. Pre-Implementation State

### 2.1 Phase Status

| Phase | Status |
|-------|--------|
| V1.3 Phase 1 (D-01 + D-02) | CLOSED & LOCKED |
| V1.3 Phase 2 (S-03) | OPEN — Starting |

### 2.2 Database State

| Table | Status | Notes |
|-------|--------|-------|
| `admin_notification` | NOT EXISTS | To be created in this phase |
| `audit_event` | EXISTS | Includes `correlation_id` from D-02 |
| All other tables | UNCHANGED | V1.1 operational baseline |

### 2.3 Code State

| Component | Status | Notes |
|-----------|--------|-------|
| `Notifications.tsx` | Static empty array | Uses `notificationsData` from `topbar.ts` |
| `topbar.ts` | Empty array | Marked "OUT OF SCOPE for v1.0/v1.1" |
| `useAdminNotifications.ts` | NOT EXISTS | To be created in this phase |
| Status change handlers | No notification logic | Only audit logging present |

### 2.4 Key Files Before Changes

| File | Purpose |
|------|---------|
| `src/components/layout/TopNavigationBar/components/Notifications.tsx` | Static notification dropdown |
| `src/assets/data/topbar.ts` | Empty notification data |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | Subsidy case detail with status change |
| `src/app/(admin)/housing-registrations/[id]/page.tsx` | Housing registration detail with status change |
| `src/hooks/useAuditLog.ts` | Audit logging utility |

---

## 3. Authorized Changes for Phase 2

### 3.1 Database Changes

| Change | Table | Description |
|--------|-------|-------------|
| CREATE | `admin_notification` | In-app notification storage |
| CREATE | RLS policies | 3 policies for SELECT/INSERT/UPDATE |
| CREATE | Indexes | 4 indexes for performance |

### 3.2 Code Changes

| Change | File | Description |
|--------|------|-------------|
| CREATE | `src/hooks/useAdminNotifications.ts` | Notification data hook |
| MODIFY | `Notifications.tsx` | Replace static data with hook |
| MODIFY | Subsidy case page | Add notification on status change |
| MODIFY | Housing registration page | Add notification on status change |
| MODIFY | `useAuditLog.ts` | Add notification-related entity types |

---

## 4. Rollback Instructions

### 4.1 Database Rollback

```sql
-- Execute in order:
DROP POLICY IF EXISTS role_select_own_notification ON public.admin_notification;
DROP POLICY IF EXISTS role_insert_admin_notification ON public.admin_notification;
DROP POLICY IF EXISTS role_update_own_notification ON public.admin_notification;
DROP TABLE IF EXISTS public.admin_notification;
```

### 4.2 Code Rollback

1. Revert `Notifications.tsx` to use static `notificationsData`
2. Delete `src/hooks/useAdminNotifications.ts`
3. Remove notification creation calls from status change handlers
4. Revert `useAuditLog.ts` EntityType changes if any

---

## 5. Verification Checklist

| Item | Verified |
|------|----------|
| V1.3 Phase 1 is CLOSED | ✅ |
| No `admin_notification` table exists | ✅ |
| `Notifications.tsx` shows empty state | ✅ |
| Status change handlers only log to audit | ✅ |
| V1.1 functional behavior preserved | ✅ |

---

## 6. Authorization

| Item | Value |
|------|-------|
| Authorization Basis | V1.3 Phase 2 Authorization Decision — APPROVED |
| Scope | S-03: Admin Notifications only |
| Created By | Lovable AI |
| Created At | 2026-01-30 |

---

## 7. Final Statement

This restore point is confirmed. Phase 2 implementation may proceed with S-03 (Admin Notifications) only.

**Any deviation from authorized scope requires explicit written approval.**
