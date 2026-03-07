# Restore Point: Phase 5 Start

**Created:** 2026-03-07
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Phase:** 5 — Household Children Capture & Case Integration
**Status:** PRE-IMPLEMENTATION

## Scope

- Add ChildInput type + children field to wizard types
- Dynamic children UI in Step3Household
- Children summary in Step7Review
- Edge function persistence to subsidy_household_child
- Admin case detail children display
- i18n keys (en + nl)

## Files to be Modified

- src/app/(public)/bouwsubsidie/apply/types.ts
- src/app/(public)/bouwsubsidie/apply/constants.ts
- src/app/(public)/bouwsubsidie/apply/steps/Step3Household.tsx
- src/app/(public)/bouwsubsidie/apply/steps/Step7Review.tsx
- supabase/functions/submit-bouwsubsidie-application/index.ts
- src/app/(admin)/subsidy-cases/[id]/page.tsx
- src/i18n/locales/en.json
- src/i18n/locales/nl.json

## Rollback

Revert all files listed above to their state before this restore point.
