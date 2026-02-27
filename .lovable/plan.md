

# DVH-IMS V1.7.x -- Hide "Personeelsportaal" Button on Mobile

## Analysis

The "Personeelsportaal" button is rendered in a single location: `src/components/public/PublicHeader.tsx` (line 34). It is a `Link` inside a `div` with Bootstrap flex classes. There is no separate MobileNav or Offcanvas component — the header is a single responsive component.

## Approach

Add Bootstrap's responsive display utility class `d-none d-md-inline-block` to the Personeelsportaal `Link` element. This hides it below the `md` breakpoint (768px) and shows it at `md` and above.

- **Desktop (>=768px):** Visible (unchanged)
- **Mobile (<768px):** Hidden
- **Tablet (768px+):** Visible (follows `md` breakpoint)

No logic changes. No routing changes. No DOM removal. Pure CSS visibility control via Bootstrap utility class.

## Changes

### 1. `src/components/public/PublicHeader.tsx` (line 34)

Add `d-none d-md-inline-block` to the Link's className:

```tsx
// Before
<Link to="/auth/sign-in" className="btn btn-outline-primary btn-sm">

// After
<Link to="/auth/sign-in" className="btn btn-outline-primary btn-sm d-none d-md-inline-block">
```

### 2. Documentation

- Create `docs/restore-points/v1.7/RESTORE_POINT_V1.7x_HIDE_STAFFPORTAL_MOBILE.md`
- Update `docs/DVH-IMS-V1.0_1.1/architecture.md` and `docs/DVH-IMS-V1.0_1.1/backend.md` with short note

### Summary

| Item | Detail |
|------|--------|
| Files changed | 1 component, 2 docs, 1 restore point |
| Breakpoint | Bootstrap `md` (768px) |
| Desktop | Visible |
| Tablet (>=768px) | Visible |
| Mobile (<768px) | Hidden |
| Logic impact | None |

