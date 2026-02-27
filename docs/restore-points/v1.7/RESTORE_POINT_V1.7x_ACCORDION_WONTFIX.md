# RESTORE POINT — V1.7.x Document Upload Accordion — Won't Fix (Editor-Only Artifact)

**Label:** V1.7x-Accordion-WontFix  
**Created:** 2026-02-27  
**Context:** DVH-IMS V1.7.x — DocumentUploadAccordion visibility investigation

---

## Decision

**Status:** Editor-only rendering artifact — Non-prod — Won't fix (for now).

**Validated in Live Preview:** PASS. The DocumentUploadAccordion dropzone renders correctly when expanding items in both Bouwsubsidie and Woningregistratie wizards under production-like conditions (Live Preview / published URL).

**Editor-only artifact observed:** In the Lovable editor/embedded preview context, the expanded accordion panel sometimes shows a blank/white area instead of the dropzone UI. This does NOT reproduce in the Live Preview or published deployment.

---

## What Was NOT Changed

- `src/components/public/DocumentUploadAccordion.tsx` — NO changes
- `src/assets/scss/components/_accordion.scss` — NO changes
- No `minHeight` injection
- No `Tab.Pane` `mountOnEnter`/`unmountOnExit` modifications
- No accordion overflow CSS overrides
- No DB, RLS, validation, submission, i18n, or storage changes

## Rationale

Implementing CSS/layout fixes for an editor-only rendering artifact risks regressions in a production flow that is already working correctly. The accordion component correctly:
- Renders dropzone on expand
- Maintains file state across tab switches (Verplicht/Optioneel)
- Keeps children mounted during collapse/expand transitions

## Re-open Criteria

This decision should be revisited ONLY if:
1. The blank accordion issue reproduces in Live Preview (production-like) with a clear repro path
2. End-user reports confirm the issue in the published deployment

## V1.7.x Changes Applied (Prior to This Decision)

| File | Change | Status |
|------|--------|--------|
| `src/components/public/WizardProgress.tsx` | Active step underline fix: `index <= currentStep` replaces `phase.steps.includes(currentStep)` | ✅ Implemented |

---

## VERIFICATION

- Live Preview (Housing /housing/register → Step 9 Documents): PASS (user-validated)
- Live Preview (Bouwsubsidie /bouwsubsidie/apply → Documents step): PASS (user-validated)
- No code changes committed for accordion — confirmed via diff review

## BLOCKERS / ERRORS

- NONE
