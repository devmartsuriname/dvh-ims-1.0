

# DVH-IMS V1.7.x -- Wizard Step Label Optimization

## What Changes

**Single file**: `src/i18n/locales/nl.json`

Three translation values under `wizard.steps`:

| Key | Before | After |
|-----|--------|-------|
| `wizard.steps.personalInfo` | Persoonsgegevens | Gegevens |
| `wizard.steps.contact` | Contactgegevens | Contact |
| `wizard.steps.receipt` | Ontvangstbewijs | Receipt |

## What Does NOT Change

- Step IDs, enums, routing keys, validation keys, database references
- Form section titles inside step pages (e.g., `housing.step1.title` stays "Persoonsgegevens", `bouwsubsidie.step1.title` stays "Persoonsgegevens")
- Review section headers (`sectionPersonal`, `sectionContact`) stay unchanged
- WizardProgress.tsx logic untouched
- Step order, numbering, underline logic, progress fill logic all unchanged
- Constants files (`constants.ts`) use `titleKey` references which resolve through i18n -- no changes needed there

## Why Only nl.json

Both wizards share the same `wizard.steps.*` translation keys (confirmed in both `bouwsubsidie/apply/constants.ts` and `housing/register/constants.ts`). The labels render through `t(step.titleKey)` in `WizardProgress.tsx`. Changing the translation value applies to both services automatically.

## Scope

- Lines ~60-67 in `src/i18n/locales/nl.json`
- 3 string replacements, zero logic changes

## Deliverables

1. Code change in `src/i18n/locales/nl.json`
2. Restore point `.md`
3. Doc updates (`backend.md`, `architecture.md`)
4. Browser verification screenshots (desktop + mobile, both wizards)
5. Smoke test PASS/FAIL table

