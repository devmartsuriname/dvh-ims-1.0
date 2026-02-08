

# DVH-IMS V1.5 — Fix Audit Log Access Mismatch

**Type:** UX bugfix (single line change)
**Scope:** `src/app/(admin)/audit-log/page.tsx`

---

## Change

Update the `ALLOWED_ROLES` constant on line 4 to include `director` and `ministerial_advisor`:

```
// BEFORE
const ALLOWED_ROLES = ['system_admin', 'minister', 'project_leader', 'audit'] as const

// AFTER
const ALLOWED_ROLES = ['system_admin', 'minister', 'project_leader', 'audit', 'director', 'ministerial_advisor'] as const
```

---

## What This Does

- Removes the redirect for `director` and `ministerial_advisor` when they click the Audit Log menu item
- Grants read-only page access (the page only displays data; no write actions exist)
- Aligns the page guard with the existing menu visibility in `menu-items.ts`

## What This Does NOT Do

- No schema changes
- No RLS changes
- No menu changes
- No workflow changes
- No new write permissions

---

## Verification

- `directeur@volkshuisvesting.sr` (director) can open `/audit-log` without redirect
- `adviseur@volkshuisvesting.sr` (ministerial_advisor) can open `/audit-log` without redirect
- All other role access remains unchanged
- Audit log data remains read-only and immutable

