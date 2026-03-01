

# Fix: Applicant List Avatar Layout (Circle Stretch + Alignment)

## Root Cause

The `.avatar-xs` class sets `height: 1.5rem; width: 1.5rem`, but inside Grid.js table cells, the `<span>` stretches vertically because:
- No explicit `min-width`/`min-height` to prevent collapse
- No flex wrapper around the avatar + name pair in the `html()` output
- The avatar `<span>` inherits table cell height, breaking the circle

In the Dashboard widget (`User.tsx`), the same issue occurs but is less severe because Bootstrap `<td>` has slightly different rendering than Grid.js cells.

## Changes

### 1. `src/components/applicants/ApplicantInitialsAvatar.tsx`

**React component** — add explicit inline `width`, `height`, `minWidth`, `minHeight`, `lineHeight` to the circle span to prevent table cell stretch:

```tsx
style={{
  fontSize: size === 'xs' ? '0.65rem' : '0.75rem',
  fontWeight: 600,
  width: size === 'xs' ? '1.5rem' : '2.25rem',
  height: size === 'xs' ? '1.5rem' : '2.25rem',
  minWidth: size === 'xs' ? '1.5rem' : '2.25rem',
  minHeight: size === 'xs' ? '1.5rem' : '2.25rem',
  lineHeight: 1,
}}
```

**HTML utility** (`renderApplicantAvatarHtml`) — wrap the output in a `<div>` with `display:flex; align-items:center;` and lock the circle dimensions inline:

```html
<div style="display:flex;align-items:center">
  <span class="avatar-xs rounded-circle avatar-title {color} d-inline-flex"
        style="font-size:0.65rem;font-weight:600;width:1.5rem;height:1.5rem;min-width:1.5rem;min-height:1.5rem;line-height:1"
        aria-label="..." title="...">
    {INITIALS}
  </span>
  <span class="ms-1">{name}</span>
</div>
```

### 2. No other files changed

- `CaseTable.tsx`, `RegistrationTable.tsx`, `User.tsx` — no changes needed (they already call the component/utility correctly)
- No CSS files added or modified
- No backend/data changes

## Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| Circle shape | Stretched vertically by table cell | Fixed 1.5rem x 1.5rem circle |
| Vertical alignment | Misaligned with name text | Flex-centered with name |
| Row height | Inconsistent (stretched by avatar) | Consistent (avatar doesn't expand row) |
| Wrapper | None (raw spans in cell) | Flex container ensures horizontal alignment |

## Verification Steps

1. Dashboard widgets: circles are round, name aligned horizontally
2. Subsidy Cases Grid.js list: circles are round, row height consistent
3. Housing Registrations Grid.js list: same as above
4. No layout regression in other table columns

