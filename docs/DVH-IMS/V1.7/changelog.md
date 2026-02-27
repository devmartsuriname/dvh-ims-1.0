# DVH-IMS V1.7.x Changelog

## V1.7.0 — WizardProgress Active Step Underline Fix

**Date:** 2026-02-27

### Changed
- `src/components/public/WizardProgress.tsx`: Replaced phase-level underline coloring (`phase.steps.includes(currentStep)`) with step-level logic (`index <= currentStep`). Only completed and current steps now show `bg-primary` underline; future steps show `bg-light`.

### Impact
- Applies to both Bouwsubsidie (9 steps) and Woningregistratie (11 steps) via the shared `WizardProgress` component.
- No DB, RLS, validation, or i18n changes.

---

## V1.7.x — DocumentUploadAccordion Visibility (Won't Fix)

**Date:** 2026-02-27  
**Decision:** Editor-only rendering artifact — No production fix required.

### Details
- Blank/white area observed when expanding accordion items in Lovable editor preview.
- Validated in Live Preview (production-like): dropzone renders correctly for both wizards.
- No code changes applied. See restore point: `docs/restore-points/v1.7/RESTORE_POINT_V1.7x_ACCORDION_WONTFIX.md`.
