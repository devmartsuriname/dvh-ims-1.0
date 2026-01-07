# Backend Documentation

## VolksHuisvesting IMS - DVH-IMS-1.0

### Authentication Flow

**Post-Login Redirect Logic** (`src/app/(other)/auth/sign-in/useSignIn.ts`)

- If `redirectTo` query parameter exists → navigate to that URL
- If no `redirectTo` parameter → navigate to `/dashboards` (Admin Dashboard)

**Change History:**
| Date | Change | Reason |
|------|--------|--------|
| 2026-01-07 | Default redirect changed from `/` to `/dashboards` | Phase 5 introduced public landing at `/`, admin dashboard moved to `/dashboards` |

### Supabase Integration

- Authentication: `supabase.auth.signInWithPassword()`
- Session management via Supabase Auth
- RLS policies enforced at database level

### Route Protection

- Admin routes protected via `ProtectedRoute` wrapper
- Public routes accessible without authentication
- Staff Portal button redirects to `/auth/sign-in?redirectTo=/dashboards`

---

## Phase 5 - CP6 Quality Gate (2026-01-07)

### Public Pages Asset Resolution

**Issue Fixed:** Logo images were not rendering on public pages due to incorrect path reference.

**Solution:** Changed from static path (`/assets/images/logo-dark.png`) to ES6 module import (`import logoDark from '@/assets/images/logo-dark.png'`).

**Files Modified:**
- `src/components/public/PublicHeader.tsx` - Logo import fix

### Shared Component Usage

All public pages now use the centralized `PublicHeader` and `PublicFooter` components from `src/components/public/` for Darkone 1:1 parity.

| Page | Route | Shared Components |
|------|-------|-------------------|
| Landing | `/` | PublicHeader, PublicFooter |
| Status Tracker | `/status` | PublicHeader, PublicFooter |
| Bouwsubsidie Wizard | `/bouwsubsidie/apply` | PublicHeader, PublicFooter |
| Housing Wizard | `/housing/register` | PublicHeader, PublicFooter |

---

## Phase 5 - CP6 Quality Gate Fix (2026-01-07)

### Official Logo Replacement

**Change:** Replaced Darkone default logo with official SoZaVo (VolksHuisvesting) logo across all pages.

**Logo Asset:** `src/assets/images/logo-sozavo.png`

**Files Updated:**
| File | Component | Description |
|------|-----------|-------------|
| `src/components/public/PublicHeader.tsx` | PublicHeader | Public pages header logo |
| `src/components/wrapper/LogoBox.tsx` | LogoBox | Admin sidebar logo |
| `src/app/(other)/auth/sign-in/components/SignIn.tsx` | SignIn | Login page logo |
| `src/app/(other)/auth/sign-up/components/SignUp.tsx` | SignUp | Registration page logo |
| `src/app/(other)/auth/reset-password/components/ResetPassword.tsx` | ResetPassword | Password reset logo |
| `src/app/(other)/auth/lock-screen/components/LockScreen.tsx` | LockScreen | Lock screen logo |

### Status Page Darkone 1:1 Fixes

**Issues Fixed:**
1. **Breadcrumb Removed** - Status page no longer displays breadcrumb per CP6 requirements
2. **Button Alignment Fixed** - "Back to Home" now uses proper Darkone Button component with centered icon/label
3. **Help Text Alignment** - Moved into Card footer with proper flex centering

**Root Cause of Live URL vs Editor Mismatch:**
- **Cause:** Deployment cache - Live URL was serving stale build artifacts
- **Not a code issue** - Editor View renders correct components
- **Fix:** User must click "Publish" and hard refresh browser to propagate latest build

### WGA Polish Plan (Public Pages)

**Government-Grade Visual Standards:**
1. Landing: Hero with dark overlay, no gradients, clean typography hierarchy
2. Status: No breadcrumb, proper card footer with centered button
3. Wizards: Consistent progress indicators, button spacing, card shadows
4. All pages: Official SoZaVo logo, Darkone components only, no custom icons
