# Restore Point: DVH-IMS V1.7

**Created**: 2026-02-26
**Phase**: Pre-Wizard Experience Enhancement
**Context**: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

## Baseline State

- V1.6 Wizard Layout Standardization complete
- Container: 860px max-width
- WizardProgress: 32px circles, responsive breakpoints
- WizardStep: border-0 shadow-none card wrapper
- Document upload: 2-column grid with required/optional sections
- Both wizards (Bouwsubsidie 9 steps, Housing 11 steps) functional

## Files Modified in V1.7

- src/components/public/WizardProgress.tsx (rewrite)
- src/components/public/WizardStep.tsx (sticky bottom nav)
- src/app/(public)/bouwsubsidie/apply/constants.ts (PHASE_GROUPS)
- src/app/(public)/housing/register/constants.ts (PHASE_GROUPS)
- src/app/(public)/bouwsubsidie/apply/page.tsx (phaseGroups prop)
- src/app/(public)/housing/register/page.tsx (phaseGroups prop)
- src/i18n/locales/nl.json (phase labels)
- src/i18n/locales/en.json (phase labels)

## Rollback

Revert all files listed above to their V1.6 state.
