# RESTORE POINT: v1.1-D4-B START

**Created:** 2026-01-23
**Phase:** v1.1-D4-B (Public Wizard Error Handling & Safe Failure States)
**Status:** IN PROGRESS

## Scope

Standardize error handling across Public Wizards:
- Bouwsubsidie Wizard submission errors
- Housing Registration Wizard submission errors
- Status Lookup errors

## Files to Modify

- src/app/(public)/bouwsubsidie/apply/page.tsx
- src/app/(public)/housing/register/page.tsx
- src/app/(public)/status/page.tsx

## Error Classification

| Error Type | Safe Message |
|------------|--------------|
| Network/Offline | Connection error message |
| Rate Limited (429) | Wait one hour message |
| Validation (400) | Check information message |
| Invalid Credentials (401) | Incorrect reference/token message |
| Server Error (500+) | Try again later message |
| Unknown | Generic safe fallback |

## Governance

- No new features
- No UI redesign
- No DB / RLS changes
- No Edge contract changes
- No internal error exposure
- Citizen-safe messages only
