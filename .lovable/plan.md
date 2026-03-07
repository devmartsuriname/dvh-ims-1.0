# Add Server-Side Amount Validation to Edge Function

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Current State

The Edge Function at `supabase/functions/submit-bouwsubsidie-application/index.ts` already:

- Accepts `estimated_amount` in the interface (line 66)
- Extracts and trims it in `validateInput` (line 154)
- Maps it to `requested_amount` via `parseFloat()` at line 444

No numeric or limit validation exists.

## Changes

**File:** `supabase/functions/submit-bouwsubsidie-application/index.ts`

### Change 1: Add amount validation before the subsidy_case INSERT (before line 436)

```typescript
// Validate estimated amount
const parsedAmount = input.estimated_amount ? parseFloat(input.estimated_amount) : null

if (parsedAmount !== null && isNaN(parsedAmount)) {
  return new Response(
    JSON.stringify({ success: false, error: 'Invalid subsidy amount value' }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

if (parsedAmount !== null && parsedAmount > 150000) {
  return new Response(
    JSON.stringify({ success: false, error: 'Requested subsidy amount cannot exceed SRD 150,000' }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
```

### Change 2: Use `parsedAmount` in the INSERT (line 444)

Replace:

```typescript
requested_amount: input.estimated_amount ? parseFloat(input.estimated_amount) : null,
```

With:

```typescript
requested_amount: parsedAmount,
```

### Change 3: Update `/docs/backend.md`

Add a validation rules section documenting the SRD 150,000 cap.

## What does NOT change

- Database schema
- RLS policies
- Workflow logic
- Admin UI
- Wizard frontend

## NOTE — Add one end-to-end verification before approval

The validation logic is acceptable, but the smoke test is incomplete for this task.

Add the following verification after the Edge Function tests:

1. Browser E2E submission

- Submit one real Bouwsubsidie case through the public wizard

- Set Step 6 "Geschat bedrag (SRD)" to:

  - 35000

- Complete submission successfully

2. Admin verification

Open the created case in admin and confirm that the amount is visible as `requested_amount` in:

- case detail overview

- and at least one downstream admin surface that already displays the amount

  (director panel, minister panel, archive, or raadvoorstel preview)

3. Invalid browser verification

Attempt one browser submission with:

- estimated_amount = 200000

Confirm the submission is rejected and the frontend shows the returned error.

Do not change schema, workflow, or admin UI.

Only extend the verification to prove the full data path:

wizard → edge function → database → admin display.  
  
**After Implementation**

Deploy the Edge Function, then perform the smoke test via `supabase--curl_edge_functions` with three payloads:

- Test Case A: `estimated_amount: "35000"` — expect success
- Test Case B: `estimated_amount: "150000"` — expect success
- Test Case C: `estimated_amount: "200000"` — expect 400 rejection