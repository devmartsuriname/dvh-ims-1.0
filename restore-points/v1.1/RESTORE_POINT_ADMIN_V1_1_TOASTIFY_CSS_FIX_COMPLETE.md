# Restore Point: ADMIN_V1_1_TOASTIFY_CSS_FIX_COMPLETE

**Created:** 2026-01-09
**Phase:** Admin Upgrade v1.1-A (Notification CSS Fix)
**Status:** COMPLETE

## Change Implemented

Added missing Toastify base CSS import to fix oversized SVG/icons in toast notifications.

## File Modified

- `src/main.tsx` — Added `import 'react-toastify/dist/ReactToastify.css'`

## Verification Required

1. **Admin - Allocation Runs:** Execute Run → success toast renders correctly
2. **Admin - Subsidy Cases:** Any action producing toast
3. **Admin - Housing Registrations:** Any action producing toast
4. **Public Wizard:** Apply/register pages - no visual regressions

## Rollback Instructions

Remove the line:
```typescript
import 'react-toastify/dist/ReactToastify.css'
```
from `src/main.tsx`.

## Previous Restore Point

`ADMIN_V1_1_ALLOC_BTN_FIX_COMPLETE`
