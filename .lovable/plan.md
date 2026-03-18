# Phase 7 — Test Execution Validation Plan

## Build Error (Must Fix First)

Two edge functions have a TypeScript error preventing deployment:

```
TS2345: Argument of type 'string' is not assignable to parameter of type '"PAR" | "WAA" | ...
```

In both `submit-bouwsubsidie-application/index.ts` (line 101) and `submit-housing-registration/index.ts` (line 107), `VALID_DISTRICTS.includes(input.district as string)` fails because `VALID_DISTRICTS` is declared with `as const`, making it a readonly tuple of literal types. The `.includes()` method expects a parameter matching the tuple's element type, not a plain `string`.

**Fix:** Cast to `ReadonlyArray<string>` before calling `.includes()`:

```typescript
if (input.district && !(VALID_DISTRICTS as ReadonlyArray<string>).includes(input.district as string)) {
```

This is a type-level-only fix — zero business logic change.

## Test Inventory

### Vitest (Frontend Unit Tests) — 4 files


| File                                     | Scope                                |
| ---------------------------------------- | ------------------------------------ |
| `src/hooks/useUserRole.test.ts`          | RBAC hook (roles, district, loading) |
| `src/context/useAuthContext.test.tsx`    | Auth context provider                |
| `src/lib/subsidyCaseTransitions.test.ts` | State machine transitions            |
| `src/constants/statusBadges.test.ts`     | Badge config completeness            |


Command: `npm test` (runs `vitest run`)

### Deno (Edge Function Integration Tests) — 3 files


| File                                                         | Scope                              |
| ------------------------------------------------------------ | ---------------------------------- |
| `supabase/functions/generate-raadvoorstel/index.test.ts`     | Auth + UUID validation gates       |
| `supabase/functions/get-document-download-url/index.test.ts` | Auth + input validation gates      |
| `supabase/functions/get-citizen-document/index.test.ts`      | Auth + path traversal + RBAC gates |


These are live integration tests hitting the deployed Supabase functions. They require network access and a valid admin account (`info@devmart.sr`).

## Execution Plan

### Step 1 — Fix build error (minimal, type-only)

- Change line 101 in `submit-bouwsubsidie-application/index.ts`
- Change line 107 in `submit-housing-registration/index.ts`
- Both: wrap `VALID_DISTRICTS` in `(VALID_DISTRICTS as ReadonlyArray<string>)` before `.includes()`

### Step 2 — Run Vitest tests

- Execute `npm test` via the test runner
- Capture pass/fail counts and any error output

### Step 3 — Run Deno edge function tests

- Execute all 3 test files using the Deno test tool
- Capture pass/fail and any auth/network errors

### Step 4 — Generate verification report

- Create `docs/DVH-IMS/V1.8/PHASE_7_TEST_EXECUTION_VALIDATION_REPORT.md`
- Update `docs/backend.md` and `docs/architecture.md` with results

**NOTE — Type Safety Consideration:**

The applied fix using (VALID_DISTRICTS as ReadonlyArray<string>) intentionally relaxes TypeScript type safety to resolve the build error.

This is acceptable for this phase as a minimal, non-breaking fix.

However, a future improvement phase should consider restoring strict typing using:

typeof VALID_DISTRICTS[number]

and enforcing stronger input typing at the boundary level to preserve compile-time guarantees.  
  
What Will NOT Be Changed

- No business logic modifications
- No database schema changes
- No RLS policy changes
- No test rewrites — only the two type-cast fixes in production code