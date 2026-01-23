# RESTORE POINT: v1.1-D5-A COMPLETE

**Created:** 2026-01-23
**Phase:** v1.1-D5-A (Admin Route Cleanup)
**Status:** COMPLETE

## Executed Actions

### 1. Routes Cleanup (src/routes/index.tsx)
- Removed 39 demo route imports and registrations
- Removed: base-ui (21), forms (5), tables (2), icons (2), maps (2), apex-chart (1), layouts (5), lock-screen (1)
- Preserved: dashboards, persons, households, subsidy-cases, housing-registrations, housing-waiting-list, allocation-*, audit-log, auth (sign-in/sign-up/reset-password), error-pages

### 2. Sidebar Cleanup (src/assets/data/menu-items.ts)
- Removed Authentication submenu (4 children: sign-in, sign-up, reset-password, lock-screen)
- Preserved: All DVH-IMS production menu items

### 3. ProfileDropdown Cleanup (src/components/layout/TopNavigationBar/components/ProfileDropdown.tsx)
- Removed: My Account, Pricing, Help, Lock screen items
- Preserved: Welcome header, Logout

### 4. Demo Page Deletions (43 files)
- src/app/(admin)/base-ui/* (21 pages + 2 data files + 8 component files)
- src/app/(admin)/forms/* (5 pages + 3 component files)
- src/app/(admin)/tables/* (2 pages + 1 data file + 1 component file)
- src/app/(admin)/icons/* (2 pages)
- src/app/(admin)/maps/* (2 pages + 2 component files)
- src/app/(admin)/apex-chart/* (1 page + 1 component file)
- src/app/(admin)/(layouts)/* (5 pages + 5 component files)
- src/app/(admin)/pages-404-alt/* (1 page)
- src/app/(other)/auth/lock-screen/* (1 page + 1 component file)

## Files Modified (3)
- src/routes/index.tsx
- src/assets/data/menu-items.ts
- src/components/layout/TopNavigationBar/components/ProfileDropdown.tsx

## Files Deleted (43)
See list above

## Governance Confirmation

| Constraint | Status |
|------------|--------|
| No DB changes | ✓ CONFIRMED |
| No RLS changes | ✓ CONFIRMED |
| No Edge Function changes | ✓ CONFIRMED |
| No Public Wizard changes | ✓ CONFIRMED |
| Admin scope only | ✓ CONFIRMED |

## Verification

- Build: No errors
- Console: No errors
- Routes: Only DVH-IMS routes accessible
- Sidebar: Only production modules visible
- ProfileDropdown: Only Welcome + Logout

## Next Phase

Ready for v1.1-D5-B (Branding & Polish) upon approval.
