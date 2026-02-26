# DVH-IMS V1.6 — Wizard Layout Standardization

## Status: IMPLEMENTED

## Changes Applied

### Section 1 — Layout Grid
- Container max-width: 800px → **860px** (both wizards)
- Removed redundant inner `Card border-0 shadow-none > Card.Body p-0` wrappers from all step components
- Content now sits directly inside `WizardStep`

### Section 2 — Progress Bar Redesign
- Circle size: 40px → **32px**
- Labels: 2-line wrapping with `wordBreak: break-word`, `maxWidth: 80px`
- **Tablet (576-767px)**: Circles only, labels hidden (`d-none d-md-block`)
- **Mobile (<576px)**: "Stap X van Y" text + Bootstrap ProgressBar
- Added `aria-current="step"` for accessibility

### Section 3 — Form Standardization
- Help text standardized to `Form.Text className="text-muted"` across all steps
- Info box margins: `mt-4` → `mt-3` for consistent rhythm

### Section 4 — Document Upload Optimization
- **2-column layout** on desktop (`Col md={6}`) for both Bouwsubsidie and Housing
- Section headers: "Verplichte documenten (X)" and "Optionele documenten (X)"
- Visual divider (`<hr>`) between required and optional sections
- Dropzone padding: `p-4` → `p-3`
- Icon circle: 40px → 32px
- Card `mb-3` class removed (handled by Row `g-3` gutter)

### Section 5 — Visual Consistency
- `shadow-sm` removed from `WizardStep.tsx` Card (parent page provides shadow)

## Files Modified

### Shared Components
1. `src/components/public/WizardProgress.tsx` — Full rewrite (responsive)
2. `src/components/public/WizardStep.tsx` — shadow-sm → shadow-none

### Bouwsubsidie Wizard
3. `src/app/(public)/bouwsubsidie/apply/page.tsx` — maxWidth 860
4. `src/app/(public)/bouwsubsidie/apply/steps/Step0Introduction.tsx` — Remove inner Card
5. `src/app/(public)/bouwsubsidie/apply/steps/Step1PersonalInfo.tsx` — Remove inner Card
6. `src/app/(public)/bouwsubsidie/apply/steps/Step2ContactInfo.tsx` — Remove inner Card
7. `src/app/(public)/bouwsubsidie/apply/steps/Step3Household.tsx` — Remove inner Card
8. `src/app/(public)/bouwsubsidie/apply/steps/Step4Address.tsx` — Remove inner Card + Form.Text
9. `src/app/(public)/bouwsubsidie/apply/steps/Step5Context.tsx` — Remove inner Card + Form.Text
10. `src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx` — 2-col layout + sections

### Housing Wizard
11. `src/app/(public)/housing/register/page.tsx` — maxWidth 860
12. `src/app/(public)/housing/register/steps/Step0Introduction.tsx` — Remove inner Card
13. `src/app/(public)/housing/register/steps/Step1PersonalInfo.tsx` — Remove inner Card
14. `src/app/(public)/housing/register/steps/Step2ContactInfo.tsx` — Remove inner Card
15. `src/app/(public)/housing/register/steps/Step3LivingSituation.tsx` — Remove inner Card + Form.Text
16. `src/app/(public)/housing/register/steps/Step4HousingPreference.tsx` — Remove inner Card + mt-3
17. `src/app/(public)/housing/register/steps/Step5Reason.tsx` — Remove inner Card
18. `src/app/(public)/housing/register/steps/Step6Income.tsx` — Remove inner Card + Form.Text + mt-3
19. `src/app/(public)/housing/register/steps/Step7Urgency.tsx` — Remove inner Card + Form.Text
20. `src/app/(public)/housing/register/steps/Step8Documents.tsx` — 2-col layout + sections

## Confirmations
- No form validation logic modified
- No database changes
- No edge function changes
- No i18n key changes
- No RLS or storage changes
- Accessibility: aria-current added to progress bar
