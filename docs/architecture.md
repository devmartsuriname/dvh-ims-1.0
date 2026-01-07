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

### Technology Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Darkone Admin Template, Bootstrap 5, SCSS
- **Backend**: Supabase (Auth, Database, RLS)
- **Routing**: React Router DOM v6
