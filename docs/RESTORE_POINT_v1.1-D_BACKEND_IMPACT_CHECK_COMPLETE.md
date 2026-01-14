# Restore Point: v1.1-D Backend Impact Check — COMPLETE

**Created:** 2026-01-14
**Status:** ✅ FIX APPLIED AND VERIFIED

## Problem Resolved

The `/status` page displayed "Unknown" for applicant name despite correct database data.

## Root Cause

The `lookup-public-status` Edge Function incorrectly treated Supabase JOIN results for `person` as arrays when they are single objects:
- Code used `personData.length > 0` check
- `.length` on an object returns `undefined`
- This caused fallback to "Unknown"

## Fix Applied

**File:** `supabase/functions/lookup-public-status/index.ts`

### Bouwsubsidie Path (Lines 267-268)

**Before:**
```typescript
const personData = caseData.person as unknown as { first_name: string; last_name: string }[] | null
const person = personData && personData.length > 0 ? personData[0] : null
```

**After:**
```typescript
// Person is a single object from Supabase JOIN, not an array
const person = caseData.person as unknown as { first_name: string; last_name: string } | null
```

### Housing Path (Lines 323-324)

**Before:**
```typescript
const personData = regData.person as unknown as { first_name: string; last_name: string }[] | null
const person = personData && personData.length > 0 ? personData[0] : null
```

**After:**
```typescript
// Person is a single object from Supabase JOIN, not an array
const person = regData.person as unknown as { first_name: string; last_name: string } | null
```

## Verification Checklist

### Public Flows
- [x] Housing Registration status lookup → Applicant name displays as "first_name last_name"
- [x] Bouwsubsidie status lookup → Applicant name displays correctly
- [x] No console errors on `/status` page
- [x] Edge Function logs show successful responses (HTTP 200)

### Admin Smoke Checks
- [x] Dashboard loads
- [x] Registrations module loads
- [x] Subsidy Cases module loads
- [x] Audit Log loads

## No Further Backend Changes Required

The frontend wizard schema alignment (v1.1-D prior step) correctly populates `first_name` and `last_name` in the database. The Edge Function now correctly reads and returns these values.

## Guardian Rules Compliance

- ✅ No database schema changes
- ✅ No RLS changes
- ✅ No frontend changes (this step)
- ✅ Minimal Edge Function modification only
- ✅ Darkone Admin preserved
- ✅ Module boundaries maintained

## Rollback Instructions

If issues occur after this fix:
1. Revert `supabase/functions/lookup-public-status/index.ts` to use array extraction pattern
2. Redeploy Edge Function
3. Verify status lookup returns to previous behavior

## Documentation Updated

- `/docs/backend.md` — Added v1.1-D section
- `/docs/architecture.md` — Added v1.1-D section
