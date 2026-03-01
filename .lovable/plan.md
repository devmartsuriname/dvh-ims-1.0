# DVH-IMS v1.7.x — BUGFIX: Woningregistratie Submit Failure (Staging)

## Root Cause (Confirmed from Edge Function Logs)

The edge function `submit-housing-registration` fails on two distinct database constraint violations:

1. `**person_national_id_key` unique constraint** -- When a citizen with the same `national_id` already exists in the `person` table (e.g., from a prior submission attempt or from a Bouwsubsidie application), the INSERT fails.
2. `**housing_registration_reference_number_key` unique constraint** -- The reference number generator queries for the highest existing number, but a prior failed attempt may have already inserted that reference number (partially committed state).

**Failure sequence observed in logs:**

- Attempt 1: Reference `WR-2026-002967` generated, registration INSERT fails (duplicate reference_number from a prior run)
- Attempt 2: Same reference `WR-2026-002967` generated again, person INSERT fails (person already created in attempt 1)

**Why Bouwsubsidie works:** Same bug exists there but hasn't been triggered yet (no duplicate national_id in test data). Both functions share the same fragile pattern.

**Category:** DB unique constraint violation (NOT an RLS issue, NOT a Phase 8 regression).

## Fix Scope (Minimal, Housing Only)

### Change 1: Edge Function -- Handle Existing Person (Upsert Pattern)

In `supabase/functions/submit-housing-registration/index.ts`:

Replace the person INSERT (lines 297-317) with a lookup-first-then-insert pattern:

```text
// Try to find existing person by national_id
const { data: existingPerson } = await supabase
  .from('person')
  .select('id')
  .eq('national_id', input.national_id)
  .maybeSingle()

let personId: string

if (existingPerson) {
  personId = existingPerson.id
  console.log(`[submit-housing] Found existing person for national_id`)
} else {
  // Create new person
  const { data: personData, error: personError } = await supabase
    .from('person')
    .insert({ ... })
    .select('id')
    .single()
  
  if (personError) { ... return error }
  personId = personData.id
}
```

### Change 2: Edge Function -- Retry Reference Number on Conflict

Replace the single reference number generation with a retry loop (max 3 attempts) that catches duplicate reference_number errors:

```text
let referenceNumber: string
let registrationData: any
let attempts = 0
const MAX_ATTEMPTS = 3

while (attempts < MAX_ATTEMPTS) {
  referenceNumber = await generateReferenceNumber(supabase)
  const { data, error } = await supabase
    .from('housing_registration')
    .insert({ reference_number: referenceNumber, ... })
    .select('id')
    .single()
  
  if (!error) {
    registrationData = data
    break
  }
  
  if (error.message.includes('duplicate key') && error.message.includes('reference_number')) {
    attempts++
    continue
  }
  
  // Non-duplicate error -- fail immediately
  return error response
}
```

### Change 3: Improved Error Logging

Add a correlation ID to all error responses (console only, no PII) so failures can be traced:

```text
const correlationId = crypto.randomUUID()
console.log(`[submit-housing] correlation=${correlationId} Processing submission`)
// Include correlationId in all error console.error calls
```

### Change 4: Documentation Updates

- Create `docs/restore-points/v1.7/RESTORE_POINT_V1_7_HOUSING_SUBMIT_FAIL.md`
- Update `docs/backend.md` -- Add "Housing submit failure fix" entry
- Update `docs/DVH-IMS-V1.0_1.1/architecture.md` -- Add Change History entry

## Files Modified


| File                                                                 | Change                                                                     |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `supabase/functions/submit-housing-registration/index.ts`            | Person lookup-first pattern + reference number retry + correlation logging |
| `docs/restore-points/v1.7/RESTORE_POINT_V1_7_HOUSING_SUBMIT_FAIL.md` | Restore point                                                              |
| `docs/backend.md`                                                    | Bugfix entry                                                               |
| `docs/DVH-IMS-V1.0_1.1/architecture.md`                              | Change History entry                                                       |


## Files NOT Modified

- No frontend/wizard code changes needed
- No shared config changes
- No DB schema or RLS changes
- No Bouwsubsidie edge function changes (same bug exists but out of scope per instructions)

## Verification Plan

1. Deploy updated edge function to staging
2. Submit a housing registration with a NEW national_id -- should succeed
3. Submit again with the SAME national_id -- should succeed (reuses existing person)
4. Confirm record appears in `housing_registration` table with status `received`
5. Quick Bouwsubsidie smoke test -- confirm no regression

  
**NOTE — Transaction Safety Requirement (Mandatory)**

All submission logic inside submit-housing-registration must execute within a single transactional boundary.

Either:

1) Use a database transaction (BEGIN / COMMIT / ROLLBACK via Supabase RPC or transaction wrapper), OR

2) Implement compensating cleanup logic if any step after person creation fails.

Reason:

We must prevent partially committed state (e.g., person inserted but registration failed, or registration inserted but document linkage failed).

If transactional safety cannot be guaranteed, DO NOT proceed with deployment.

No partial commits allowed.  
  
Constraints

- Staging environment only
- No production promotion
- No DB/schema changes
- HARD STOP after verification + report