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
