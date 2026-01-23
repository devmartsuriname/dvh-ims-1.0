# Restore Point: PUBLIC_WIZARDS_SUBMISSION_FIX_START

**Created:** 2026-01-14
**Phase:** Admin v1.1-D — Wizard Submission Failures Fix
**Status:** PRE-FIX

## Purpose

This restore point marks the state of the codebase BEFORE implementing frontend schema alignment fixes for both public wizards.

## Issue Being Addressed

Both public wizards fail at final submission with HTTP 400 validation errors due to frontend payload schema mismatches with Edge Function contracts.

### Bouwsubsidie Wizard Mismatches

| Frontend Field | Edge Function Expects | Status |
|----------------|----------------------|--------|
| `full_name` | `first_name` + `last_name` | MISMATCH |
| `gender` (optional) | `gender` (required) | MISMATCH |
| `date_of_birth` (optional) | `date_of_birth` (required) | MISMATCH |
| `email` (optional) | `email` (required) | MISMATCH |
| `address_line` | `address_line_1` | MISMATCH |

### Housing Registration Wizard Mismatches

| Frontend Field | Edge Function Expects | Status |
|----------------|----------------------|--------|
| `full_name` | `first_name` + `last_name` | MISMATCH |
| (missing) | `gender` (required) | MISSING |
| `date_of_birth` (optional) | `date_of_birth` (required) | MISMATCH |
| `email` (optional) | `email` (required) | MISMATCH |
| `current_address` | `address_line_1` | MISMATCH |
| `current_district` | `district` | MISMATCH |

## Files to be Modified

### Bouwsubsidie Wizard
- `src/app/(public)/bouwsubsidie/apply/types.ts`
- `src/app/(public)/bouwsubsidie/apply/constants.ts`
- `src/app/(public)/bouwsubsidie/apply/page.tsx`
- `src/app/(public)/bouwsubsidie/apply/steps/Step1PersonalInfo.tsx`
- `src/app/(public)/bouwsubsidie/apply/steps/Step2ContactInfo.tsx`
- `src/app/(public)/bouwsubsidie/apply/steps/Step4Address.tsx`
- `src/app/(public)/bouwsubsidie/apply/steps/Step7Review.tsx`

### Housing Registration Wizard
- `src/app/(public)/housing/register/types.ts`
- `src/app/(public)/housing/register/constants.ts`
- `src/app/(public)/housing/register/page.tsx`
- `src/app/(public)/housing/register/steps/Step1PersonalInfo.tsx`
- `src/app/(public)/housing/register/steps/Step2ContactInfo.tsx`
- `src/app/(public)/housing/register/steps/Step3LivingSituation.tsx`
- `src/app/(public)/housing/register/steps/Step8Review.tsx`

## Rollback Procedure

If fix implementation fails, revert all modified files to their state at this restore point.

## Guardian Rules Compliance

- ✅ No Edge Function modifications
- ✅ No database schema changes
- ✅ No RLS policy changes
- ✅ No UI redesign (minimal field changes only)
- ✅ Darkone 1:1 compliance maintained
