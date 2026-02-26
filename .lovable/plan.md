# DVH-IMS V1.7 -- Wizard Experience Enhancement

## Mobile-First Re-Architecture Implementation Plan

**Status**: Ready for Authorization
**DB Impact**: None | **Validation Impact**: None | **Workflow Impact**: None

---

## Phase A -- Shared Components (4 files)

### A1. WizardProgress.tsx -- Complete Rewrite

**Mobile (<768px)**: Replace current mobile bar with a sticky top bar (56px):

- Back arrow (step navigation)
- "Stap X van Y" with current step title below
- Slim ProgressBar showing percentage
- Wrapped in `position: sticky; top: 0; z-index: 1020` with `bg-white shadow-sm`

**Desktop (>=768px)**: Keep horizontal stepper but with improved spacing:

- Increase circle size back to 36px for better visibility
- Active step gets filled primary background
- Completed steps show check icon
- Remove `Col lg={10}` constraint -- use full width for better spacing with 11 steps

**Phase grouping layer**: Add optional `phaseGroups` prop to WizardProgress:

```text
phaseGroups = [
  { label: "Persoonlijk", steps: [0, 1, 2] },
  { label: "Situatie", steps: [3, 4, 5] },
  ...
]
```

On mobile, show phase label above "Stap X van Y". On desktop, render thin phase-group underline segments below the circles. Pure presentation -- no logic change.

### A2. WizardStep.tsx -- Sticky Bottom Nav on Mobile

- Add a `d-md-none` fixed bottom bar (56px) with Back/Next buttons
- Hide the existing inline button bar on mobile (`d-none d-md-flex`)
- Desktop button bar stays unchanged
- Add `pb-5` (80px) padding to content area on mobile to prevent overlap with sticky bar

### A3. WizardContainer.tsx -- No Changes Required

WizardContainer is not used by the wizards (they use direct `Container` in `page.tsx`). No modification needed.

### A4. Phase Group Config Files

Add `PHASE_GROUPS` constant to both `bouwsubsidie/apply/constants.ts` and `housing/register/constants.ts`:

**Bouwsubsidie (9 steps)**:


| Phase | Label       | Steps                          |
| ----- | ----------- | ------------------------------ |
| 1     | Persoonlijk | 0-2 (Intro, Personal, Contact) |
| 2     | Huishouden  | 3-4 (Household, Address)       |
| 3     | Aanvraag    | 5 (Context)                    |
| 4     | Documenten  | 6 (Documents)                  |
| 5     | Controle    | 7-8 (Review, Receipt)          |


**Housing (11 steps)**:


| Phase | Label                 | Steps                            |
| ----- | --------------------- | -------------------------------- |
| 1     | Persoonlijk           | 0-2 (Intro, Personal, Contact)   |
| 2     | Woning & Situatie     | 3-5 (Living, Preference, Reason) |
| 3     | Inkomen               | 6 (Income)                       |
| 4     | Urgentie & Documenten | 7-8 (Urgency, Documents)         |
| 5     | Controle              | 9-10 (Review, Receipt)           |


---

## Phase B -- Document Upload Accordion Mode (2 files)

### B1. New Component: DocumentUploadAccordion

Create `src/components/public/DocumentUploadAccordion.tsx`:

- Collapsed state: Single row showing doc label + status badge (Uploaded/Pending)
- Expanded state: Shows the existing dropzone (compact `p-3`)
- Uses React-Bootstrap `Accordion` component (already available via Radix, but we use RB Accordion for Darkone parity)
- Auto-expand first un-uploaded mandatory doc
- Uploaded docs show green check + filename in collapsed row

### B2. Update Step6Documents.tsx + Step8Documents.tsx

Replace the current grid of full cards with:

- Tab layout using RB `Tab` / `Nav`:
  - Tab 1: "Verplicht (X)" -- shows accordion of mandatory docs
  - Tab 2: "Optioneel (X)" -- shows accordion of optional docs
- Each accordion item wraps the existing `DocumentUploadItem` logic (no upload/storage changes)
- Summary card stays at the bottom

**Estimated scroll reduction**: ~60% on mobile (collapsed rows are ~48px vs ~180px per card)

---

## Phase C -- Page-Level Integration (2 files)

### C1. Bouwsubsidie page.tsx

- Pass `phaseGroups` to `WizardProgress`
- No other changes (860px container, shadow-sm card all stay)

### C2. Housing page.tsx

- Pass `phaseGroups` to `WizardProgress`
- Same pattern as Bouwsubsidie

---

## Phase D -- Layout Density Polish (All step files)

- Standardize outer card padding to `p-3` on mobile via `p-3 p-md-4` on the page-level `Card.Body`
- No per-step file changes needed -- the padding change is in `page.tsx` only

---

## Files Modified Summary


| File                                                            | Action                            | Complexity |
| --------------------------------------------------------------- | --------------------------------- | ---------- |
| `src/components/public/WizardProgress.tsx`                      | Major rewrite                     | High       |
| `src/components/public/WizardStep.tsx`                          | Add sticky bottom nav             | Medium     |
| `src/components/public/DocumentUploadAccordion.tsx`             | New file                          | Medium     |
| `src/app/(public)/bouwsubsidie/apply/constants.ts`              | Add PHASE_GROUPS                  | Low        |
| `src/app/(public)/housing/register/constants.ts`                | Add PHASE_GROUPS                  | Low        |
| `src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx`  | Tabs + accordion                  | Medium     |
| `src/app/(public)/housing/register/steps/Step8Documents.tsx`    | Tabs + accordion                  | Medium     |
| `src/app/(public)/bouwsubsidie/apply/page.tsx`                  | Pass phaseGroups + mobile padding | Low        |
| `src/app/(public)/housing/register/page.tsx`                    | Pass phaseGroups + mobile padding | Low        |
| `src/i18n/locales/nl.json`                                      | Phase group labels                | Low        |
| `src/i18n/locales/en.json`                                      | Phase group labels                | Low        |
| `restore-points/v1.7/DVH-IMS-V1.7-pre-wizard-rearchitecture.md` | New restore point                 | Low        |


**Total**: 12 files (2 new, 10 modified)

---

## What Does NOT Change

- No Yup schema modifications
- No react-hook-form logic changes
- No submit handler changes
- No edge function changes
- No database migrations
- No RLS changes
- No storage path changes
- No i18n key removals (only additions)
- No role/permission changes

---

## Governance Controls

1. Restore point created before any code change
2. Implementation follows Phase A -> B -> C -> D sequentially
3. Hard stop after each phase for verification
4. Smoke test both wizards after completion
5. Mobile breakpoint regression at 375px, 576px, 768px, 992px

---

## Risk Analysis


| Risk                                          | Mitigation                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| Sticky nav overlapping form content on mobile | Add `pb-5` spacer to WizardStep content                                    |
| Accordion state loss on re-render             | Controlled accordion state in parent component                             |
| Phase groups breaking step counting           | Phase groups are presentation-only; internal `currentStep` index unchanged |
| Tab switch resetting upload state             | Upload state lives in parent formData, not in tab component                |


---

ADDITIONAL GOVERNANCE REQUIREMENTS BEFORE APPROVAL

1. FORM STATE PERSISTENCE GUARANTEE

   - Confirm that accordion expand/collapse does NOT unmount DocumentUploadItem.

   - Confirm that tab switching does NOT reset react-hook-form state.

   - Explicitly document that upload state is stored in parent formData and not in accordion local state.

2. SCROLL POSITION CONTROL

   - After Next / Previous navigation, wizard must scroll to top of content container.

   - Sticky header must not hide first visible form field.

   - Add explicit scroll restoration logic if needed.

3. ACCESSIBILITY ENFORCEMENT

   - Sticky top progress must retain aria-current.

   - Accordion items must be keyboard navigable.

   - Tabs must have proper role="tablist" semantics.

   - No focus trap created by sticky bottom nav.

4. PERFORMANCE CHECK

   - Confirm no additional re-render loops introduced by phaseGroups mapping.

   - Confirm mobile performance smoothness on low-end devices.

5. HARD STOP RULE

   - After Phase A completion (WizardProgress rewrite), STOP for visual verification before proceeding to Phase B.  
  
Success Criteria

1. Mobile scroll reduced by at least 40% on document step
2. Step progression clearly visible on all breakpoints
3. Sticky navigation always accessible on mobile
4. Phase grouping provides cognitive structure without logic changes
5. No console errors
6. No workflow regression