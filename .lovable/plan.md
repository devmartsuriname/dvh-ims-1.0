# Phase 9D — Edge Function Shared Module Extraction

## Current Duplication Analysis


| Pattern                            | Duplicated In                     | Identical?                                          |
| ---------------------------------- | --------------------------------- | --------------------------------------------------- |
| `corsHeaders`                      | All 7 functions                   | Yes                                                 |
| `checkRateLimit` + map + constants | lookup, bouwsubsidie, housing (3) | Same pattern, different RATE_LIMIT values (5 or 20) |
| `VALID_DISTRICTS`                  | bouwsubsidie, housing (2)         | Yes (identical array)                               |
| `isValidUUID`                      | execute-allocation-run only (1)   | N/A — single source, extract for reuse              |


## Shared Modules to Create

### 1. `supabase/functions/_shared/cors.ts`

Export `corsHeaders` object. All 7 functions import from here instead of defining inline.

### 2. `supabase/functions/_shared/rate-limit.ts`

Export `createRateLimiter(limit, windowMs)` factory that returns `{ check(ip): boolean }`. Each function creates its own instance with its own Map and limits — preserving per-function isolation.

- lookup: `createRateLimiter(20, 3600000)`
- bouwsubsidie: `createRateLimiter(5, 3600000)`
- housing: `createRateLimiter(5, 3600000)`

### 3. `supabase/functions/_shared/constants.ts`

Export `VALID_DISTRICTS` array. Used by bouwsubsidie and housing.

### 4. `supabase/functions/_shared/validators.ts`

Export `isValidUUID(str)`. Used by execute-allocation-run, available for future use.

## Files Modified


| File                                       | Change                                                        |
| ------------------------------------------ | ------------------------------------------------------------- |
| `_shared/cors.ts`                          | **NEW**                                                       |
| `_shared/rate-limit.ts`                    | **NEW**                                                       |
| `_shared/constants.ts`                     | **NEW**                                                       |
| `_shared/validators.ts`                    | **NEW**                                                       |
| `health-check/index.ts`                    | Replace inline corsHeaders with import                        |
| `lookup-public-status/index.ts`            | Replace corsHeaders, rate-limit pattern with imports          |
| `submit-bouwsubsidie-application/index.ts` | Replace corsHeaders, rate-limit, VALID_DISTRICTS with imports |
| `submit-housing-registration/index.ts`     | Replace corsHeaders, rate-limit, VALID_DISTRICTS with imports |
| `execute-allocation-run/index.ts`          | Replace corsHeaders, isValidUUID with imports                 |
| `generate-raadvoorstel/index.ts`           | Replace corsHeaders with import                               |
| `get-document-download-url/index.ts`       | Replace corsHeaders with import                               |
| `docs/backend.md`                          | **NEW** — document shared module architecture                 |
| `docs/architecture.md`                     | **NEW** — document Edge Function shared pattern               |


## File Accounting


| Metric                    | Count                         |
| ------------------------- | ----------------------------- |
| New files                 | 6 (4 shared modules + 2 docs) |
| Modified files            | 7 (all Edge Functions)        |
| **Total file operations** | **13**                        |


## NOTE — Verification and doc discipline

Approved with the following execution constraints:

1. health-check must preserve the exact current response contract

   (status + timestamp only, no extra internal details)

2. rate-limit extraction must preserve per-function isolation exactly;

   each function must keep its own Map instance and current limit values

3. docs/[backend.md](http://backend.md) and docs/[architecture.md](http://architecture.md) should be UPDATED if they already exist,

   not recreated as new files unless they truly do not exist in the repo

4. after implementation, provide a strict function-by-function verification matrix

   for all 7 affected Edge Functions confirming no response or behavior changes  
  
Constraints Preserved

- Zero business logic changes
- Zero response format changes
- Rate limit values unchanged (5/hr submit, 20/hr lookup)
- Per-function rate limit isolation maintained (each gets own Map instance)
- All logging, correlation IDs, error handling untouched
- CORS headers byte-identical
- No schema/RLS/auth changes