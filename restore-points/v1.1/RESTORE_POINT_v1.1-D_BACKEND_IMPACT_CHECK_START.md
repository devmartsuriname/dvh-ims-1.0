# Restore Point: v1.1-D Backend Impact Check — START

**Created:** 2026-01-14
**Purpose:** Fix applicant_name showing "Unknown" on public status lookup page
**Scope:** Edge Function fix only — `lookup-public-status/index.ts`

## Problem
The `lookup-public-status` Edge Function incorrectly treats Supabase JOIN results for `person` as an array when they are single objects. This causes `.length` checks to fail, defaulting to "Unknown".

## Evidence
- Database contains correct data: `first_name`, `last_name` populated
- Edge Function code checks `personData.length > 0` on an object (fails)
- Result: `applicant_name` defaults to `"Unknown"`

## Changes Planned
1. Fix Bouwsubsidie path (~lines 267-268): Remove array-based extraction
2. Fix Housing path (~lines 323-324): Remove array-based extraction
3. Treat `person` as single object, not array

## Rollback Instructions
If issues occur after this fix:
1. Revert `supabase/functions/lookup-public-status/index.ts` to previous version
2. Redeploy Edge Function
3. Verify status lookup returns to previous behavior

## Files to be Modified
- `supabase/functions/lookup-public-status/index.ts`

## Guardian Rules Compliance
- No database schema changes
- No RLS changes
- No frontend changes
- Minimal Edge Function modification only
