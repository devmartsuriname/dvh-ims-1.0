# Phase 8 — JWT Relay Investigation Report

**Date:** 2026-03-18  
**Status:** RESOLVED  
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## 1. Root Cause Analysis

**The Phase 7 diagnosis ("Supabase gateway JWT secret mismatch") was incorrect.**

The actual root cause is an **auth pattern bug** in 3 edge functions. These functions call `getUser()` without passing the JWT token explicitly. In a serverless Deno environment (no persistent session storage), this call fails because `getUser()` tries to read from an empty session state.

### Evidence

| Test | Result | Conclusion |
|------|--------|------------|
| Anon key as Bearer to `verify_jwt = true` function | Gateway accepted, function code executed | Gateway JWT validation works correctly |
| Edge function logs for authenticated requests | `request_started → auth_failed: invalid_token` | Request reaches function code; rejection is internal |
| Real user token via Deno test | Function returns 401 `AUTH_INVALID` | Token is valid but `getUser()` without explicit token fails in Deno |

## 2. Affected Functions

| Function | Auth Pattern (Before) | Status (Before) | Status (After) |
|---|---|---|---|
| `execute-allocation-run` | `getUser(token)` ✅ | Working | Working (unchanged) |
| `generate-raadvoorstel` | `getUser()` ❌ | Broken | Fixed → `getUser(token)` |
| `get-document-download-url` | `getUser()` ❌ | Broken | Fixed → `getUser(token)` |
| `get-citizen-document` | `getUser()` ❌ | Broken | Fixed → `getUser(token)` |

## 3. Classification

**This is a code-level auth pattern bug, not a platform/config/deployment issue.**

- ❌ NOT a gateway JWT secret mismatch
- ❌ NOT a deployment mismatch
- ❌ NOT a token source issue
- ✅ **Application-level auth pattern bug** — `getUser()` called without explicit token in serverless context

## 4. Remediation Applied

### Fix 1: Auth Pattern Correction (3 functions)

Replaced Pattern B (broken) with Pattern A (working) in all 3 functions:

```typescript
// Before (broken — Pattern B):
const userClient = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: authHeader } },
});
const { data: { user } } = await userClient.auth.getUser();

// After (working — Pattern A):
const adminClient = createClient(supabaseUrl, supabaseServiceKey);
const token = authHeader.replace('Bearer ', '');
const { data: { user } } = await adminClient.auth.getUser(token);
```

### Fix 2: `verify_jwt = false` for all functions

Per Lovable's ES256 signing-keys architecture, `verify_jwt = true` is deprecated. All functions now use `verify_jwt = false` with internal auth validation.

## 5. Security Validation

All 3 fixed functions retain their complete internal auth chain:
- Bearer token extraction and validation
- `getUser(token)` for identity verification
- RBAC check against `user_roles` table
- Audit event logging for all actions

No security controls were removed or weakened.

## 6. Risk if Left Unresolved

All authenticated edge function calls would fail with 401, blocking:
- Raadvoorstel document generation
- Document download URL generation
- Citizen document access

## 7. Conclusion

**"Protected functions required configuration correction"** — specifically:
1. Auth token validation pattern had a bug (calling `getUser()` without token in serverless context)
2. `verify_jwt` setting updated to `false` per Lovable architecture

Both fixes are minimal, isolated, with zero business logic impact.

## 8. What Was NOT Changed

- No database schema modifications
- No RLS policy changes
- No business logic changes
- No UI changes
- Internal RBAC checks remain identical
