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
