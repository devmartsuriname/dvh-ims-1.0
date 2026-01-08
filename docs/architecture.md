# Architecture Documentation

## VolksHuisvesting IMS - DVH-IMS-1.0

### Application Structure

```
src/
├── app/
│   ├── (admin)/          # Admin dashboard routes (protected)
│   ├── (public)/         # Public-facing routes (unauthenticated)
│   └── (other)/          # Auth and utility routes
├── assets/
│   └── images/
│       └── logo-sozavo.png  # Official VolksHuisvesting logo
├── components/
│   ├── layout/           # Admin layout components
│   ├── public/           # Public layout components
│   └── wrapper/          # Shared wrapper components (LogoBox, etc.)
├── layouts/
│   ├── AdminLayout.tsx   # Dark theme admin wrapper
│   ├── AuthLayout.tsx    # Authentication pages wrapper
│   └── PublicLayout.tsx  # Light theme public wrapper
└── routes/
    ├── index.tsx         # Route definitions
    └── router.tsx        # Router configuration
```

### Routing Architecture

| Route Pattern | Layout | Theme | Auth Required |
|---------------|--------|-------|---------------|
| `/` | PublicLayout | Light | No |
| `/status` | PublicLayout | Light | No |
| `/bouwsubsidie/*` | PublicLayout | Light | No |
| `/housing/*` | PublicLayout | Light | No |
| `/dashboards` | AdminLayout | Dark | Yes |
| `/admin/*` | AdminLayout | Dark | Yes |
| `/auth/*` | AuthLayout | Dark | No |

### Authentication Flow

1. User accesses protected route → redirected to `/auth/sign-in?redirectTo=<original>`
2. User submits credentials → Supabase authentication
3. On success:
   - If `redirectTo` exists → navigate to that URL
   - Otherwise → navigate to `/dashboards`

### Branding & Logo

**Official Logo:** `src/assets/images/logo-sozavo.png`

| Context | Component | Logo Height |
|---------|-----------|-------------|
| Public Header | `PublicHeader.tsx` | 48px |
| Admin Sidebar | `LogoBox.tsx` | 32px |
| Auth Pages | SignIn/SignUp/ResetPassword/LockScreen | 48px |

**Single Import Path:** All components import logo from `@/assets/images/logo-sozavo.png` for easy replacement.

### Change Log

| Date | Component | Change |
|------|-----------|--------|
| 2026-01-07 | useSignIn.ts | Default post-login redirect: `/` → `/dashboards` |
| 2026-01-07 | PublicHeader.tsx | Logo import changed to ES6 module for proper asset resolution |
| 2026-01-07 | status/page.tsx | Refactored to use shared PublicHeader/PublicFooter |
| 2026-01-07 | landing/page.tsx | Hero section enhanced with background image + dark overlay |
| 2026-01-07 | StatusForm.tsx | Button icon alignment fixed with flexbox centering |
| 2026-01-07 | All logos | Replaced Darkone default with official SoZaVo logo |
| 2026-01-07 | status/page.tsx | Removed breadcrumb, fixed "Back to Home" button alignment |

### Technology Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Darkone Admin Template, Bootstrap 5, SCSS
- **Backend**: Supabase (Auth, Database, RLS)
- **Routing**: React Router DOM v6

### Public Page Design Standards

**Darkone 1:1 Compliance:**
- All public pages use `react-bootstrap` components
- Shared header/footer from `src/components/public/`
- Icons via `@iconify/react` (mingcute set)
- Light theme applied via `PublicLayout` wrapper
- Premium government visual tone (no playful elements)
- NO breadcrumbs on Status page
- Buttons use proper flex centering for icon alignment

**Asset Management:**
- Images imported as ES6 modules (not static paths)
- Logo from `src/assets/images/logo-sozavo.png`
- Background patterns from `src/assets/images/`

### Live URL vs Editor Parity

**Root Cause of Discrepancies:**
- Deployment cache serving stale build artifacts
- Not a code defect - Editor View renders correctly

**Resolution Steps:**
1. Click "Publish" button in Lovable
2. Wait for deployment to complete (1-2 minutes)
3. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Verify all routes match Editor View

---

## RLS Security Model

### Overview

All 23 database tables have Row-Level Security (RLS) enabled with a Phase 1 allowlist security model.

**Full Policy Matrix:** See [RLS_POLICY_MATRIX.md](./RLS_POLICY_MATRIX.md)

### Security Posture (Phase 1)

| Attribute | Value |
|-----------|-------|
| Model | Single-email allowlist |
| Allowed Email | `info@devmart.sr` |
| Default Access | Deny all |
| RLS Status | Enabled on all tables |

### Table Categories

| Category | Tables | Access Pattern |
|----------|--------|----------------|
| Shared Core | person, household, household_member, contact_point, address | Admin allowlist |
| Bouwsubsidie | subsidy_case, subsidy_case_status_history, subsidy_document_*, social_report, technical_report, generated_document | Admin allowlist |
| Woning Registratie | housing_registration, housing_registration_status_history, housing_urgency, district_quota, allocation_*, assignment_record | Admin allowlist |
| Public Access | public_status_access | Admin allowlist (token validation deferred) |
| System | app_user_profile (user self), audit_event (append-only) | Special patterns |

### Immutable Patterns (By Design)

- **No DELETE** on any table — Records are immutable for audit compliance
- **No UPDATE** on history/status tables — Append-only for audit trail
- **No SELECT** on audit_event — Write-only; admin reads via Supabase Dashboard

### Change History

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-08 | Phase 9B-3 Responsiveness Fix | Mobile-first responsive polish for Neonwizard wizard layout |
| 2026-01-07 | RLS Security Model section added | Phase 8 security audit |

---

## Neonwizard Public UI Architecture (Phase 9B-3)

### Layout Strategy

The public wizard uses a two-column layout on desktop that switches to stacked layout on mobile:

**Desktop (1200px+):**
- Fixed left panel (420-490px) with background image
- Vertical step indicator on right edge of image
- Form content in remaining width
- Fixed action buttons bottom-right

**Mobile/Tablet (<1199px):**
- Full-width stacked layout
- Image banner at top (180-280px depending on breakpoint)
- Horizontal step indicator overlaid on image
- Form content scrollable below
- Static action buttons (centered or full-width)

### CSS Scoping

All Neonwizard styles are scoped under `.neonwizard-scope` class to prevent pollution of Darkone Admin UI.

**SCSS Structure:**
```
src/assets/scss/neonwizard/
├── style.scss          # Main entry, imports all partials
├── _template.scss      # Variables (colors, fonts)
├── _predefine.scss     # Base component styles
├── _wizard.scss        # Wizard-specific styles
├── _responsive.scss    # All responsive breakpoints (mobile-first)
└── _status-page.scss   # Status page restyle
```

### Step Indicator Behavior

| Viewport | Direction | Connection Lines | Current Step Ring |
|----------|-----------|------------------|-------------------|
| Desktop | Vertical | Vertical (#6b59d3) | 66px outer ring |
| Tablet | Horizontal | Horizontal (#6b59d3) | 50-57px outer ring |
| Mobile | Horizontal | Horizontal (#6b59d3) | 42-50px outer ring |

### Mobile-First Priority

The wizard targets mobile users primarily. Responsive SCSS is organized from smallest breakpoint up, ensuring optimal mobile experience first.
