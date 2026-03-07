

# Fix: Map `estimated_amount` → `requested_amount` in Edge Function

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Root Cause

The wizard collects `estimated_amount` (string) in Step 5, sends the full `formData` to the `submit-bouwsubsidie-application` Edge Function. However:

1. The Edge Function's `BouwsubsidieInput` interface does **not** include `estimated_amount`, `application_reason`, or `is_calamity`
2. The `subsidy_case` INSERT (line 434-443) does **not** map `estimated_amount` → `requested_amount`
3. The DB column `subsidy_case.requested_amount` (numeric, nullable) exists and is already displayed throughout the admin UI (case detail, director panel, minister panel, archive, Raadvoorstel)

The admin displays `requested_amount` correctly when populated — the value is simply never written during public submission.

No columns exist for `application_reason` or `is_calamity` either, but those are out of scope for this task.

## Fix (Edge Function only)

**File:** `supabase/functions/submit-bouwsubsidie-application/index.ts`

### Change 1: Add field to `BouwsubsidieInput` interface (line ~47-68)
Add `estimated_amount?: string` to the interface.

### Change 2: Extract field in `validateInput` (line ~137-156)
Add: `estimated_amount: input.estimated_amount ? String(input.estimated_amount).trim() : undefined`

### Change 3: Map to DB column in subsidy_case INSERT (line ~434-443)
Add: `requested_amount: input.estimated_amount ? parseFloat(input.estimated_amount) : null`

## What does NOT change
- No schema changes
- No admin UI changes (already displays `requested_amount`)
- No wizard changes
- No RLS changes
- No workflow logic changes
- `application_reason` and `is_calamity` are NOT addressed (no DB columns exist — separate task if needed)

