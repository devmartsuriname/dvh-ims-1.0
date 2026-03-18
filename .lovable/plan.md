

# Fix: execute-allocation-run — Gateway JWT Rejection

## Root Cause

In `supabase/config.toml`, `execute-allocation-run` has `verify_jwt = true`. The Supabase gateway validates the JWT **before** forwarding to the function. Due to the JWT secret mismatch identified in Phase 7, the gateway rejects valid user tokens with a 401, and the function code never executes (hence no request logs — only boot logs).

The function already implements its own full auth chain internally (lines 64–108): extracts the Bearer token, calls `supabase.auth.getUser(token)`, and performs RBAC checks against `user_roles`.

## Fix

**File: `supabase/config.toml`**

Set `verify_jwt = false` for `execute-allocation-run`. The function's internal auth is sufficient and more granular (RBAC check for `system_admin` / `project_leader`).

```toml
[functions.execute-allocation-run]
verify_jwt = false
```

This is the same pattern already used by `submit-bouwsubsidie-application`, `submit-housing-registration`, `lookup-public-status`, `health-check`, and `track-qr-scan`.

No business logic changes. No schema changes. No RLS changes.

