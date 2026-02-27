# DVH-IMS V1.7 -- Wizard Header Restructure

## Chosen Model: Option A

Step circles + step titles only on desktop. Phase labels removed from header. Phase grouping remains as subtle colored line segments beneath circles.

---

## Before / After

### Desktop (>=768px)

**Before**: Circles with numbers/checks + step title labels below circles + phase group underline bars + phase group text labels below underlines = 4 visual layers competing.

**After**: Circles with numbers/checks + step title labels below circles + phase group underline bars (no text). Phase text labels removed entirely. Result: 3 clean layers with the underline being a subtle visual grouping cue, not a label.

### Mobile (<768px)

**Before**: Back arrow + phase label + "Stap X van Y" + step title text (right-aligned) + progress bar = 4 text elements in 56px bar.

**After**: Back arrow + phase label + "Stap X van Y" + progress bar. Step title text removed from sticky bar (it already appears as h4 in the content area below). Result: 3 text elements, no redundancy with the page h4.

---

## Implementation (2 changes in 1 file)

### File: `src/components/public/WizardProgress.tsx`

**Change 1 -- Mobile**: Remove the step title `<span>` on line 99-101 that shows `steps[currentStep]?.title` in the sticky bar. The `d-flex justify-content-between` wrapper simplifies to just the step counter.

**Change 2 -- Desktop**: Remove the phase label `<small>` block (lines 207-221) that renders `t(phase.labelKey)` text below the underline segments. Also remove the extra spacing div on line 228. The colored underline segments remain as the sole phase grouping indicator.

### No other files changed.

---

## Resulting Visual Hierarchy

```text
DESKTOP:
  [1] ---- [2] ---- [3] ---- [4] ---- ...
  Intro   Persoon  Contact  Huish.   ...
  ========         ========          (subtle colored underlines, no text)

MOBILE (sticky bar):
  < Persoonlijk
    Stap 2 van 9
  [====-------] (progress bar)

  (below, in card):
  h4: "Persoonlijke Gegevens"
```

---

NOTE — Scope Confirmation

This WizardProgress.tsx component is shared by BOTH:

1. Bouwsubsidie Wizard

2. Woningregistratie Wizard

The header restructuring must be verified visually and functionally in BOTH flows.

Acceptance criteria:

- Desktop header cleaned in both services

- Mobile sticky bar cleaned in both services

- No layout regressions in either flow

- Phase underline grouping works correctly in both wizards

- Step counter remains accurate

Do not consider task complete until both services are verified.  
  
Technical Detail

- Lines removed: ~18 lines total
- No props changed, no interface changes
- `phaseGroups` prop still used for underline color logic
- `getCurrentPhase()` still used for mobile phase label
- No validation, submission, or i18n key changes