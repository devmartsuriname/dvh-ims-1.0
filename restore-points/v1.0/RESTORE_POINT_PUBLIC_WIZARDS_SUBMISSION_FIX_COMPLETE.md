# Restore Point: PUBLIC_WIZARDS_SUBMISSION_FIX_COMPLETE

**Created:** 2026-01-14
**Phase:** Admin v1.1-D — Wizard Submission Failures Fix
**Status:** COMPLETE

## Summary

Both public wizards have been fixed to align with Edge Function contracts.

## Files Changed

### Bouwsubsidie Wizard (7 files)
- `src/app/(public)/bouwsubsidie/apply/types.ts` - Updated schema
- `src/app/(public)/bouwsubsidie/apply/constants.ts` - Updated initial form data
- `src/app/(public)/bouwsubsidie/apply/steps/Step1PersonalInfo.tsx` - Split full_name, required gender
- `src/app/(public)/bouwsubsidie/apply/steps/Step2ContactInfo.tsx` - Required email
- `src/app/(public)/bouwsubsidie/apply/steps/Step4Address.tsx` - Renamed address_line_1
- `src/app/(public)/bouwsubsidie/apply/steps/Step7Review.tsx` - Updated display

### Housing Registration Wizard (7 files)
- `src/app/(public)/housing/register/types.ts` - Updated schema
- `src/app/(public)/housing/register/constants.ts` - Updated initial form data
- `src/app/(public)/housing/register/steps/Step1PersonalInfo.tsx` - Split full_name, added gender
- `src/app/(public)/housing/register/steps/Step2ContactInfo.tsx` - Required email
- `src/app/(public)/housing/register/steps/Step3LivingSituation.tsx` - Renamed fields
- `src/app/(public)/housing/register/steps/Step8Review.tsx` - Updated display

## Field Mapping Changes

| Old Field | New Field | Wizard |
|-----------|-----------|--------|
| `full_name` | `first_name` + `last_name` | Both |
| (missing) | `gender` (required) | Housing |
| `gender` (optional) | `gender` (required) | Bouwsubsidie |
| `email` (optional) | `email` (required) | Both |
| `date_of_birth` (optional) | `date_of_birth` (required) | Both |
| `address_line` | `address_line_1` | Bouwsubsidie |
| `current_address` | `address_line_1` | Housing |
| `current_district` | `district` | Housing |

## Verification Checklist

- [ ] Bouwsubsidie wizard completes with valid data
- [ ] Bouwsubsidie submission returns HTTP 200
- [ ] Housing wizard completes with valid data
- [ ] Housing submission returns HTTP 200
- [ ] Admin modules still load correctly
- [ ] Public status tracking works

## Guardian Rules Compliance

- ✅ No Edge Function modifications
- ✅ No database schema changes
- ✅ No RLS policy changes
- ✅ Darkone 1:1 compliance maintained
- ✅ Minimal UI changes (field additions only)
