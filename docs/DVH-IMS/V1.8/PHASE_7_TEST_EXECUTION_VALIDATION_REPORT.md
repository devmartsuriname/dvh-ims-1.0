# Phase 7 — Test Execution Validation Report

**Date:** 2026-03-18
**Executed By:** Claude (Governance-Controlled Validation)
**Authority:** Delroy

---

## 1. Environment Status

| Component | Status | Version |
|-----------|--------|---------|
| Node.js | ✅ Available | v20+ |
| Deno | ✅ Available | v2+ |
| Vitest | ✅ Configured | 3.2.4 |
| package.json `test` script | ✅ Present (`vitest run`) |
| vitest.config.ts | ✅ Valid |
| src/test/setup.ts | ✅ Valid |

---

## 2. Pre-Execution Fixes Applied

### 2a. Build Error — VALID_DISTRICTS type cast (2 files)

**Files modified:**
- `supabase/functions/submit-bouwsubsidie-application/index.ts` (line 101)
- `supabase/functions/submit-housing-registration/index.ts` (line 107)

**Change:** `VALID_DISTRICTS.includes(...)` → `(VALID_DISTRICTS as ReadonlyArray<string>).includes(...)`

**Justification:** `VALID_DISTRICTS` is declared `as const`, making `.includes()` reject plain `string` arguments. The cast is type-level only — zero business logic change.

### 2b. Vitest Config — Exclude Deno test files

**File:** `vitest.config.ts`

**Change:** Added `include: ['src/**/*.{test,spec}.{ts,tsx}']` and `exclude: ['supabase/**', 'node_modules/**']` to prevent Vitest from collecting Deno edge function tests (which use `https://` imports incompatible with Node).

### 2c. vi.mock Hoisting Fix (2 files)

**Files modified:**
- `src/hooks/useUserRole.test.ts`
- `src/context/useAuthContext.test.tsx`

**Change:** Replaced top-level `const mockX = vi.fn()` declarations (referenced inside `vi.mock()` factory) with `vi.hoisted()` pattern. Vitest hoists `vi.mock()` above all variable declarations, causing `ReferenceError: Cannot access 'mockX' before initialization`. Using `vi.hoisted()` ensures mock variables are initialized before the hoisted mock factory runs.

---

## 3. Vitest Results (Frontend Unit Tests)

**Command:** `npm test` → `vitest run`

| Suite | Tests | Status |
|-------|-------|--------|
| `src/constants/statusBadges.test.ts` | 25 | ✅ PASS |
| `src/lib/subsidyCaseTransitions.test.ts` | 49 | ✅ PASS |
| `src/context/useAuthContext.test.tsx` | 7 | ✅ PASS |
| `src/hooks/useUserRole.test.ts` | 11 | ✅ PASS |

**Total: 4/4 suites passed — 92/92 tests passed**

---

## 4. Deno Results (Edge Function Integration Tests)

**Command:** `supabase--test_edge_functions` (Deno test runner with `--allow-net`)

### 4a. Auth Gate Tests (no token / malformed token → 401)

| Test | Function | Status |
|------|----------|--------|
| No Authorization header → 401 | generate-raadvoorstel | ✅ PASS |
| Malformed token → 401 | generate-raadvoorstel | ✅ PASS |
| No Authorization header → 401 | get-document-download-url | ✅ PASS |
| Malformed token → 401 | get-document-download-url | ✅ PASS |
| No Authorization header → 401 | get-citizen-document | ✅ PASS |

**5/5 auth gate tests PASS** — confirms all 3 functions reject unauthenticated requests.

### 4b. Authenticated Validation Tests (valid token + invalid payload → 400)

| Test | Function | Expected | Actual | Status |
|------|----------|----------|--------|--------|
| Missing case_id | generate-raadvoorstel | 400 | 401 | ❌ BLOCKED |
| Invalid UUID case_id | generate-raadvoorstel | 400 | 401 | ❌ BLOCKED |
| Missing document_id | get-document-download-url | 400 | 401 | ❌ BLOCKED |
| Invalid UUID document_id | get-document-download-url | 400 | 401 | ❌ BLOCKED |
| Path traversal | get-citizen-document | 400 | 401 | ❌ BLOCKED |
| Invalid path format | get-citizen-document | 400 | 401 | ❌ BLOCKED |
| Valid housing path | get-citizen-document | 200/500 | 401 | ❌ BLOCKED |
| Valid bouwsubsidie path | get-citizen-document | 200/500 | 401 | ❌ BLOCKED |

**0/8 authenticated tests pass — ALL BLOCKED**

### 4c. Root Cause Analysis

All 3 functions have `verify_jwt = true` in `supabase/config.toml`. The Supabase edge function relay performs JWT verification at the gateway level BEFORE function code runs. Valid auth tokens obtained via `supabase.auth.signInWithPassword` are rejected by the gateway with `{"code":401,"message":"Invalid JWT"}`.

**Verification:** A valid access_token was obtained via curl (HTTP 200 from `/auth/v1/token`), then used in a function call — same 401 rejection. Meanwhile, `submit-bouwsubsidie-application` (`verify_jwt = false`) accepts requests normally and returns proper validation errors.

**Diagnosis:** This is a **Supabase platform configuration issue** — the edge function relay's JWT verification key does not match the auth service's signing key. This cannot be resolved from code.

**Required action:** Check the Supabase dashboard → Settings → API → JWT Secret and ensure it matches the edge function relay configuration. Alternatively, set `verify_jwt = false` for these functions and rely on the functions' internal JWT validation (already implemented in all 3 functions).

---

## 5. Summary

| Category | Result |
|----------|--------|
| Build errors | ✅ RESOLVED (type cast fix) |
| Vitest (frontend) | ✅ VERIFIED — 92/92 tests pass |
| Deno auth gates | ✅ VERIFIED — 5/5 tests pass |
| Deno authenticated tests | ❌ BLOCKED — platform JWT config issue |

### Verdict: **PARTIALLY VERIFIED**

- Frontend test layer: **VERIFIED** — fully functional, all 92 tests pass
- Edge function auth gates: **VERIFIED** — unauthenticated requests correctly rejected
- Edge function validation gates: **NOT VERIFIED** — blocked by Supabase JWT relay configuration mismatch

---

## 6. Required Next Steps

1. **Resolve JWT verification mismatch** — Check Supabase dashboard JWT configuration for edge functions
2. **Re-run Deno authenticated tests** after JWT issue is resolved
3. **Future improvement:** Replace `(VALID_DISTRICTS as ReadonlyArray<string>)` cast with proper `typeof VALID_DISTRICTS[number]` input typing at boundary level
