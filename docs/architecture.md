# Architecture Documentation

## VolksHuisvesting IMS - DVH-IMS-1.0

### Application Structure

```
src/
├── app/
│   ├── (admin)/          # Admin dashboard routes (protected)
│   ├── (public)/         # Public-facing routes (unauthenticated)
│   └── (other)/          # Auth and utility routes
├── components/
│   ├── layout/           # Admin layout components
│   └── public/           # Public layout components
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

### Change Log

| Date | Component | Change |
|------|-----------|--------|
| 2026-01-07 | useSignIn.ts | Default post-login redirect: `/` → `/dashboards` |
| 2026-01-07 | PublicHeader.tsx | Logo import changed to ES6 module for proper asset resolution |
| 2026-01-07 | status/page.tsx | Refactored to use shared PublicHeader/PublicFooter |
| 2026-01-07 | landing/page.tsx | Hero section enhanced with background image + dark overlay |
| 2026-01-07 | StatusForm.tsx | Button icon alignment fixed with flexbox centering |

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

**Asset Management:**
- Images imported as ES6 modules (not static paths)
- Logo from `src/assets/images/logo-dark.png`
- Background patterns from `src/assets/images/`
