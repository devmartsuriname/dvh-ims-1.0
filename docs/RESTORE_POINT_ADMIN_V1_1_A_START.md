# Restore Point: Admin v1.1-A START

## Metadata

| Attribute | Value |
|-----------|-------|
| Restore Point ID | `ADMIN_V1_1_A_START` |
| Created | 2026-01-09 |
| Phase | Admin Upgrade v1.1-A |
| Workstream | Audit Log Interface (Read-Only) |
| Prior Checkpoint | Phase 12.5 COMPLETE (Go-Live Ready) |

---

## Scope

This restore point marks the **START** of Admin v1.1-A implementation:

- Audit Log Interface (read-only)
- RLS policy extension for SELECT on `audit_event`
- Navigation and routing additions
- Governance section in admin menu

---

## State Before Changes

### Navigation
- No "Governance" section in menu
- No Audit Log route

### RLS on `audit_event`
- SELECT allowed for: `audit`, `system_admin`
- No SELECT for: `minister`, `project_leader`

### Files Not Yet Created
- `src/app/(admin)/audit-log/page.tsx`
- `src/app/(admin)/audit-log/components/*`
- `src/hooks/useAuditEvents.ts`

---

## Rollback Instructions

To restore to this point:

1. **Revert RLS Policy:**
   ```sql
   DROP POLICY IF EXISTS "role_select_audit_event" ON public.audit_event;
   
   CREATE POLICY "role_select_audit_event" ON public.audit_event
   FOR SELECT
   TO authenticated
   USING (
     has_role(auth.uid(), 'audit'::app_role) OR
     has_role(auth.uid(), 'system_admin'::app_role)
   );
   ```

2. **Remove Navigation Item:**
   - Delete GOVERNANCE section from `src/assets/data/menu-items.ts`

3. **Remove Route:**
   - Delete governance routes from `src/routes/index.tsx`

4. **Delete Created Files:**
   - `src/app/(admin)/audit-log/` (entire directory)
   - `src/hooks/useAuditEvents.ts`

---

## Validation

- [ ] Phase 12.5 fully functional
- [ ] No audit log interface exists
- [ ] Navigation has no Governance section

---

## Notes

This is a pre-implementation baseline. No code changes have been made yet.
