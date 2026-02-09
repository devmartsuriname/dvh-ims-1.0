

# DVH-IMS V1.5 — Case Assignments Icon Fix

**Type:** UI parity bugfix (single value change)
**Scope:** `src/assets/data/menu-items.ts`, line 77

---

## Root Cause

The icon value `mingcute:user-check-line` does **not exist** in the MingCute icon set on Iconify. The `@iconify/react` component silently renders nothing when an icon name is invalid -- no error, no fallback, just an empty `<span>`. This is why the icon is missing in editor, preview, AND live.

All other menu items use valid MingCute icon names and render correctly.

## Fix

Replace the invalid icon name with a valid MingCute icon. The replacement must:
- Exist in the MingCute Iconify set
- Semantically represent "assigning users to cases"
- Follow the `-line` style used by all other menu icons

**Proposed icon:** `mingcute:user-add-line` (confirmed valid via Iconify/Streamline). This represents user assignment -- adding/assigning a person to something.

```
// Line 77 in src/assets/data/menu-items.ts
// FROM:
icon: 'mingcute:user-check-line',
// TO:
icon: 'mingcute:user-add-line',
```

## What This Does NOT Change
- No layout changes
- No backend changes
- No role or permission changes
- No new features

## Verification
After fix, the Case Assignments icon will be visible in:
- Editor preview
- Browser preview
- Live domain (after publish)

