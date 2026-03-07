

# Phase 5 — Mobile UX / Accessibility / Performance Remediation

## Phase 5A — Public Pages

### Issues Found & Fixes

**1. Landing Page — Service card links lack focus styles**
- Service CTAs (`.service-cta`) are `<Link>` elements styled as buttons but have no visible `:focus` outline
- **Fix**: Add `:focus-visible` styles to `.service-cta` in `_public-landing.scss`

**2. Landing Page — Image decorative but no `role="presentation"`**
- Background images use div-based approach (already fine, no `<img>` tags to fix)
- **No action needed** — decorative images via CSS background are already a11y-compliant

**3. Landing Page — Heading hierarchy skip**
- `h1` → `h5` → `h6` skips h2/h3/h4
- **Fix**: Change `h5` (services title) to `h2`, `h6` (card titles) to `h3`, using utility classes to preserve visual size

**4. Landing Page — Service cards have no keyboard focus indicator on card level**
- Cards contain links but the card hover effect only triggers on mouse
- **No action needed** — the link inside is focusable, which is correct

**5. PublicHeader — Logo link image alt text is good**
- Already has `alt="VolksHuisvesting Suriname"` ✓

**6. PublicHeader — Language switcher dropdown accessible**
- Uses react-bootstrap `Dropdown` which handles aria ✓

**7. WizardStep — Mobile sticky bottom nav**
- Touch targets: Buttons use react-bootstrap `<Button>` (min 38px height) ✓
- Bottom padding of 72px prevents content hiding behind sticky nav ✓

**8. WizardProgress — Mobile back button touch target too small**
- Back button uses `btn-sm btn-link p-0` — no minimum touch area
- **Fix**: Add `min-width: 44px; min-height: 44px` for WCAG 2.5.8 compliance

**9. WizardContainer — "Back to Home" link not localized**
- Hardcoded "Back to Home" text
- **Fix**: Use `t('common.backToHome')` (add key if missing)

**10. StatusForm — Form inputs have proper labels** ✓

**11. Search clear icon in topbar — no aria-label, not keyboard accessible**
- IconifyIcon close button uses `onClick` on a `<span>` — not focusable
- **Fix**: Wrap in `<button>` with `aria-label="Clear search"`

**12. Topbar search input — no `aria-label`**
- **Fix**: Add `aria-label="Search persons, cases, registrations"`

### Phase 5B — Admin Spot Fixes

**13. LeftSideBarToggle — No aria-label on hamburger button**
- **Fix**: Add `aria-label="Toggle sidebar menu"`

**14. ThemeModeToggle — No aria-label on theme button**
- **Fix**: Add `aria-label` based on current state ("Switch to dark mode" / "Switch to light mode")

**15. ProfileDropdown — Avatar alt text says "avatar-3" (meaningless)**
- **Fix**: Change alt to "User profile"

**16. Sidebar menu items — `div` with `role="button"` used for toggles**
- Already has `role="button"` and `aria-expanded` ✓
- Missing keyboard handler (`onKeyDown` for Enter/Space)
- **Fix**: Add `tabIndex={0}` and `onKeyDown` handler

**17. Topbar search clear icon — clickable IconifyIcon not a button**
- **Fix**: Convert to `<button>` element (same as #11)

---

## Files Modified (estimated)

| File | Changes |
|------|---------|
| `src/assets/scss/components/_public-landing.scss` | Add `:focus-visible` styles for `.service-cta` |
| `src/app/(public)/landing/page.tsx` | Fix heading hierarchy (h5→h2, h6→h3) |
| `src/components/public/WizardProgress.tsx` | Add min touch target to mobile back button |
| `src/components/public/WizardContainer.tsx` | Localize "Back to Home" text |
| `src/components/layout/TopNavigationBar/page.tsx` | Add `aria-label` to search input; wrap clear icon in `<button>` |
| `src/components/layout/TopNavigationBar/components/LeftSideBarToggle.tsx` | Add `aria-label` |
| `src/components/layout/TopNavigationBar/components/ThemeModeToggle.tsx` | Add `aria-label` |
| `src/components/layout/TopNavigationBar/components/ProfileDropdown.tsx` | Fix avatar alt text |
| `src/components/layout/VerticalNavigationBar/components/AppMenu.tsx` | Add `tabIndex` + `onKeyDown` to menu toggle divs |

## Scope
- 9 files modified
- Zero backend/schema/route changes
- Zero layout redesign
- All fixes are targeted a11y/mobile remediation

