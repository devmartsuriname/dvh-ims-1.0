# Restore Point — V1.7.x Wizard Step Label Optimization

**ID:** V1.7x-StepLabels
**Date:** 2026-02-27
**Author:** Lovable (authorized by Delroy)

## Change Summary

Shortened 3 wizard step labels in `src/i18n/locales/nl.json` to prevent text wrapping in the desktop wizard header.

| Key | Before | After |
|-----|--------|-------|
| `wizard.steps.personalInfo` | Persoonsgegevens | Gegevens |
| `wizard.steps.contact` | Contactgegevens | Contact |
| `wizard.steps.receipt` | Ontvangstbewijs | Receipt |

## Files Changed

- `src/i18n/locales/nl.json` (3 string replacements, zero logic changes)

## What Was NOT Changed

- Step IDs, enums, routing keys, validation keys, database references
- Form section titles inside step pages
- Review section headers
- WizardProgress.tsx logic
- Constants files

## Rollback

Revert the 3 values in `src/i18n/locales/nl.json` to their original strings listed above.
