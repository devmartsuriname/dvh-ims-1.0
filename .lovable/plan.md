# DVH-IMS V1.7.x -- WizardProgress Active Step Underline Fix

## Root Cause

In `WizardProgress.tsx` line 190-191, the phase underline segment uses:

```
phase.steps.includes(currentStep) ? 'bg-primary' : 'bg-light'
```

This colors ALL steps in the current phase group with `bg-primary`. When on Step 1 (index 0), if steps 0-2 share the "Persoonlijk" phase group, steps 2 and 3 also show a primary-colored underline -- creating the false impression they are active/reached.

## Fix (Single File, ~2 Lines Changed)

**File**: `src/components/public/WizardProgress.tsx`

**Change**: Replace the phase underline color logic (line 191) from phase-level to step-level:

```text
BEFORE: phase.steps.includes(currentStep) ? 'bg-primary' : 'bg-light'
AFTER:  index <= currentStep ? 'bg-primary' : 'bg-light'
```

This ensures only completed steps and the current step show the primary-colored underline. Future steps always show `bg-light`, regardless of phase grouping.

## Result

- Phase grouping structure is preserved (rounded corners on first/last step of each phase remain).
- The underline acts as a progress indicator: filled up to current step, empty beyond.
- Consistent with the filled progress line already rendered above the circles.

## Scope Confirmation

- No DB, validation, submission, RLS, or i18n changes.
- No mobile layout changes (mobile uses progress bar, not underline segments).
- Applies to both Bouwsubsidie (9 steps) and Woningregistratie (11 steps) via the shared component.

Note: Verification Detail:

Confirm correct behavior when:

- currentStep = 0 (first step)

- currentStep = last step

- Transition from last step of one phase to first step of next phase

Ensure no visual jump or underline gap at phase boundaries.  
  
Deliverables

1. Code fix in WizardProgress.tsx
2. Restore point file
3. Doc updates (backend.md, architecture.md)
4. Browser verification screenshots for both wizards (Step 1 + Step 2, desktop + mobile)