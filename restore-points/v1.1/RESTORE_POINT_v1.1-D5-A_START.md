# RESTORE POINT: v1.1-D5-A START

**Created:** 2026-01-23
**Phase:** v1.1-D5-A (Admin Route Cleanup)
**Status:** IN PROGRESS

## Scope

- Remove 39 demo routes from routes/index.tsx
- Remove demo page directories
- Remove Authentication sidebar submenu
- Clean ProfileDropdown demo items

## Pre-Execution State

- All demo routes active
- Darkone demo modules accessible
- Authentication submenu visible in sidebar
- ProfileDropdown contains demo items

## Files to Modify

- src/routes/index.tsx
- src/assets/data/menu-items.ts
- src/components/layout/TopNavigationBar/components/ProfileDropdown.tsx

## Files to Delete

- src/app/(admin)/base-ui/* (21 pages)
- src/app/(admin)/forms/* (5 pages)
- src/app/(admin)/tables/* (2 pages)
- src/app/(admin)/icons/* (2 pages)
- src/app/(admin)/maps/* (2 pages)
- src/app/(admin)/apex-chart/* (1 page)
- src/app/(admin)/(layouts)/* (5 pages)
- src/app/(admin)/pages-404-alt/* (1 page)
- src/app/(other)/auth/lock-screen/* (1 page)

## Governance

- No DB changes
- No RLS changes
- No Edge Function changes
- Admin scope only
