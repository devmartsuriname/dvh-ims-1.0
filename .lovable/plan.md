# Phase 8 — JWT Relay Investigation Report & Remediation Plan

## Root Cause Analysis

**The Phase 7 diagnosis was wrong.** There is no "Supabase gateway JWT secret mismatch."

### Evidence

**Test 1: Gateway accepts the anon key for `verify_jwt = true` functions**

- Sent anon key as Bearer token to `generate-raadvoorstel` (which has `verify_jwt = true`)
- Gateway accepted it — request reached function code
- Function returned its own `AUTH_INVALID` (not gateway 401)
- This proves the gateway's JWT verification uses the same HS256 secret as the project

**Test 2: Edge function logs confirm requests reach function code**

```
request_started → auth_failed: invalid_token
```

The function code runs. The `auth_failed: invalid_token` is emitted by the function's own `getUser()` call, not the gateway.

**Test 3: Deno test with real user token gets 401 from function code**

- `getAdminToken()` succeeds (auth logs confirm login at 19:38:39Z)
- Token is passed as `Authorization: Bearer <token>`
- Function returns 401 with `AUTH_INVALID` — the function's own error response

### Actual Root Cause: Auth Pattern Bug in 3 Functions

There are **two different auth patterns** in the codebase:

**Pattern A — `execute-allocation-run` (WORKS):**

```typescript
const supabase = createClient(supabaseUrl, supabaseServiceKey)
const token = authHeader.replace('Bearer ', '')
const { data: { user } } = await supabase.auth.getUser(token)
//                                                      ^^^^^ explicit token
```

**Pattern B — `generate-raadvoorstel`, `get-document-download-url`, `get-citizen-document` (BROKEN):**

```typescript
const userClient = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: authHeader } },
})
const { data: { user } } = await userClient.auth.getUser()
//                                                       ^ no token argument
```

In Pattern B, `getUser()` is called without a token. In server-side Deno context, the Supabase client has no persistent session storage — `getUser()` without an explicit token tries to read from an empty session state and fails.

Pattern A works because the token is passed explicitly to `getUser(token)`.

### Additionally: `verify_jwt` Setting

Per Lovable's architecture (ES256 signing keys), `verify_jwt = true` is deprecated and should be `false` for all functions. However, this is a **secondary** issue — the gateway does accept the project's JWTs. The primary blocker is the auth pattern bug.

## Affected Functions


| Function                    | `verify_jwt` | Auth Pattern                 | Status  |
| --------------------------- | ------------ | ---------------------------- | ------- |
| `execute-allocation-run`    | `false` ✅    | Pattern A (explicit token) ✅ | Working |
| `generate-raadvoorstel`     | `true` ❌     | Pattern B (no token) ❌       | Broken  |
| `get-document-download-url` | `true` ❌     | Pattern B (no token) ❌       | Broken  |
| `get-citizen-document`      | `true` ❌     | Pattern B (no token) ❌       | Broken  |


## Remediation Plan

### Fix 1: Auth pattern — switch to explicit `getUser(token)` (3 functions)

Replace Pattern B with Pattern A in all 3 functions. Example for `generate-raadvoorstel`:

```typescript
// Before (broken):
const userClient = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: authHeader } },
});
const { data: { user }, error: userError } = await userClient.auth.getUser();

// After (working):
const token = authHeader.replace('Bearer ', '');
const adminClient = createClient(supabaseUrl, supabaseServiceKey);
const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
```

This is the same pattern already working in `execute-allocation-run`. No business logic change — only how the token is passed to the auth API.

### Fix 2: Set `verify_jwt = false` for all 3 functions

Per Lovable's signing-keys architecture:

```toml
[functions.generate-raadvoorstel]
verify_jwt = false

[functions.get-document-download-url]
verify_jwt = false

[functions.get-citizen-document]
verify_jwt = false
```

### Fix 3: Update Deno tests

Update test assertions — after Fix 1, authenticated requests will pass the auth gate and reach the validation layer, so tests expecting 400 should now pass.

### Fix 4: Generate investigation report

Create `docs/DVH-IMS/V1.8/PHASE_8_JWT_RELAY_INVESTIGATION_REPORT.md` with all findings.

## What Will NOT Change

- No database schema modifications
- No RLS policy changes
- No business logic changes
- No UI changes
- The internal RBAC checks remain identical

**NOTE — Security and Auth Validation Consideration:**

The root cause (missing explicit token in getUser()) is correctly identified and must be fixed.

However, switching verify_jwt = false removes gateway-level JWT validation and shifts full responsibility to application-level auth checks.

Before applying this change:

- Confirm that all edge functions implement strict internal token validation

- Ensure no service_role key exposure in logs, responses, or client-accessible code

- Validate that token verification is consistent across all entry points

If these guarantees cannot be confirmed, retain verify_jwt = true and resolve compatibility instead of disabling gateway validation.  
  
**Conclusion**

**"Protected functions require configuration correction"** — specifically:

1. The auth token validation pattern has a bug (calling `getUser()` without token in serverless context)
2. The `verify_jwt` setting should be `false` per Lovable architecture

Both are minimal, isolated fixes with zero business logic impact.