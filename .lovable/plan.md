# DVH-IMS V1.6 -- Wizard Layout Standardization Plan

## Scope

Bouwsubsidie (9 steps) + Woningregistratie (11 steps) public wizards.
Documentation only. No implementation.

---

## SECTION 1 -- Layout Grid Definition

### Current State


| Property                      | Current Value                 | Source                    |
| ----------------------------- | ----------------------------- | ------------------------- |
| Main container max-width      | 800px (inline style)          | `page.tsx` both wizards   |
| Progress bar inner col        | `Col lg={10}` (~83% of 800px) | `WizardProgress.tsx`      |
| Outer card padding            | `p-4` (24px)                  | `page.tsx` Card.Body      |
| Inner WizardStep card padding | `p-4` (24px)                  | `WizardStep.tsx` CardBody |
| Form row gutter               | `g-3` (16px)                  | All step components       |
| Background                    | `bg-light` on `<main>`        | `page.tsx`                |


### Issues Identified

- **Double card nesting**: `page.tsx` wraps content in `Card > Card.Body p-4`, then each step's `WizardStep` adds another `Card shadow-sm > CardBody p-4`. This creates **48px total padding** on desktop (24+24), plus each form step wraps fields in yet another `Card border-0 shadow-none > Card.Body p-0`. Three card levels deep.
- 800px max-width is reasonable for form steps but cramped for the document upload page with 7 cards.
- No responsive breakpoint adjustments below 800px (relies on Bootstrap grid defaults).

### Proposed Standardization


| Token                   | Value        | Rationale                                       |
| ----------------------- | ------------ | ----------------------------------------------- |
| Container max-width     | 860px        | Slightly wider for document page breathing room |
| Outer padding (desktop) | 32px (`p-4`) | Keep current                                    |
| Outer padding (mobile)  | 16px (`p-3`) | Reduce on `< md`                                |
| Form gutter             | `g-3` (16px) | Keep current -- standard Bootstrap              |
| Vertical rhythm base    | 8px system   | Align all margins/paddings to 8px multiples     |


**Key structural change**: Remove the redundant inner `Card border-0 shadow-none > Card.Body p-0` wrapper inside every form step. Content sits directly inside `WizardStep`. This eliminates one nesting level and removes dead spacing.

### Complexity: **Medium** (JSX structural change in every step file)

---

## SECTION 2 -- Progress Bar Redesign

### Current State

- 40px circles with step numbers or checkmarks
- Labels below each circle: `maxWidth: 100`, `fontSize: 0.75rem`, `whiteSpace: nowrap`, `overflow: hidden`, `textOverflow: ellipsis`
- Progress line: 2px, positioned absolute, spans 10%-90% width
- Bouwsubsidie: 9 steps (Introductie through Ontvangstbewijs)
- Woningregistratie: 11 steps (more crowded)

### Issues Identified

- With 11 steps (Housing), labels are severely truncated ("Persoonsgegevens" becomes "Persoonsgegeve...")
- Step circles at 40px with 11 items create ~44px per step on 800px container = cramped
- No mobile/tablet adaptation -- same layout on all screen sizes
- Labels overflow on screens below ~768px

### Proposed Redesign

**Desktop (>= 768px)**:

- Reduce circle size from 40px to 32px
- Label font: keep 0.75rem but allow 2-line wrapping (remove `whiteSpace: nowrap`)
- Set label `maxWidth: 80px` with `wordBreak: break-word`
- Progress line height: keep 2px

**Tablet (576px - 767px)**:

- Hide labels entirely, show only numbered circles
- Reduce circle to 28px

**Mobile (< 576px)**:

- Show only: "Stap X van Y" text indicator (no circles)
- Single progress bar (Bootstrap ProgressBar) showing percentage

### Complexity: **Medium** (CSS + conditional JSX in `WizardProgress.tsx`)

---

## SECTION 3 -- Form Standardization

### Current State


| Element                | Current                                            | Consistent?          |
| ---------------------- | -------------------------------------------------- | -------------------- |
| Step title             | `h4 fw-bold mb-1`                                  | Yes (via WizardStep) |
| Step description       | `p text-muted mb-0`                                | Yes (via WizardStep) |
| Header-to-content gap  | `mb-4` (24px)                                      | Yes                  |
| Content-to-buttons gap | `mb-4` (24px)                                      | Yes                  |
| Button bar             | `pt-3 border-top`, flex space-between              | Yes                  |
| Field label            | `Form.Label` (Bootstrap default)                   | Yes                  |
| Field-to-field gap     | `g-3` (16px via Row gutter)                        | Yes                  |
| Error message          | `text-danger small mt-1`                           | Yes                  |
| Help text              | Mixed (`Form.Text` vs `div.text-muted.small.mt-1`) | **No**               |


### Issues Identified

- Help text inconsistency: Some steps use `Form.Text`, others use `div.text-muted.small`
- Some steps add extra spacing via inner Card wrappers (the `Card border-0 shadow-none` pattern)
- Introduction step has `mb-4` on inner card but form steps use `g-3` in Row
- Step5Context (Bouwsubsidie) has `mt-4` on the info box, breaking the `g-3` rhythm

### Proposed Rules


| Rule               | Standard                                        |
| ------------------ | ----------------------------------------------- |
| Step title         | `h4 fw-bold mb-1` (no change)                   |
| Step description   | `p text-muted mb-0` (no change)                 |
| Section-to-content | `mb-4` (24px, no change)                        |
| Field gutter       | `g-3` (16px, no change)                         |
| Help text          | Always `Form.Text className="text-muted"`       |
| Error text         | Always `div className="text-danger small mt-1"` |
| Info boxes         | `mt-3` within Row, not `mt-4`                   |
| Button bar         | No change needed                                |


### Complexity: **Low** (CSS-only for help text; minor JSX for consistency)

---

## SECTION 4 -- Document Upload Page Optimization

### Current State

- Single-column layout: 7 upload cards stacked vertically (Bouwsubsidie)
- Each card: `Card mb-3 > Card.Body p-3` with 40px icon circle, label, badge, then full-width dropzone with `p-4` padding
- Dropzone internal padding: 32px (`p-4`)
- Estimated viewport height consumed: ~2800px for 7 cards (5 required + 2 optional)
- Housing: 3 cards (3 mandatory), same structure but much shorter

### Issues Identified

- Excessive vertical scroll on Bouwsubsidie document step (~4-5 screen heights on desktop)
- Dropzone `p-4` (32px) is generous -- each empty card is ~180px tall
- No visual separation between Required and Optional sections
- All cards look identical except for badge color

### Proposed Optimization

**2-Column Layout (Desktop >= 992px)**:

- Required documents: 2 columns, 3 rows (5 items, last row has 1 item centered or left-aligned)
- Optional documents: 2 columns, 1 row (2 items)
- Estimated height reduction: ~45%

**Compact Card Density**:

- Reduce dropzone padding from `p-4` to `p-3` (save 16px per card)
- Reduce icon circle from 40px to 32px
- Keep all interactive areas accessible (min touch target 44px maintained via dropzone)

**Required vs Optional Separation**:

- Add section headers: "Verplichte documenten (5)" and "Optionele documenten (2)"
- Visual divider (`<hr>` or `border-top mt-4 pt-4`) between sections

**Estimated Scroll Reduction**: ~40-50% on desktop

### Complexity: **Medium** (JSX restructuring of Step6Documents layout + CSS)

---

## SECTION 5 -- Visual Consistency Rules

### Current State


| Element            | Current                                                          |
| ------------------ | ---------------------------------------------------------------- |
| Headings           | h2 (WizardContainer title), h4 (step title), h6 (section titles) |
| Card border-radius | Bootstrap default (0.375rem / 6px)                               |
| Card shadow        | `shadow-sm` on outer card, `shadow-none` on inner cards          |
| Info boxes         | `bg-light rounded p-3`                                           |
| Primary color      | Bootstrap primary (mapped via Darkone SCSS)                      |
| Badge styles       | Bootstrap `bg-warning text-dark`, `bg-success`, `bg-secondary`   |


### Issues Identified

- Outer page card has `shadow-sm` but WizardStep also adds `shadow-sm` = double shadow on desktop
- Introduction step process cards use `bg-light rounded` but no shadow
- Landing page (home) uses different visual weight than wizard pages

### Proposed Rules


| Rule              | Standard                                                                    |
| ----------------- | --------------------------------------------------------------------------- |
| Heading scale     | h4 for step titles, h6 for section labels, p.fw-semibold for sub-labels     |
| Outer card        | `shadow-sm` only on the page-level card                                     |
| Inner step card   | `border-0 shadow-none` (already correct, but remove WizardStep `shadow-sm`) |
| Border radius     | Bootstrap default (no custom)                                               |
| Info/notice boxes | `bg-light rounded p-3` uniformly                                            |
| Padding system    | 8/16/24/32px (Bootstrap p-1 through p-4)                                    |


**Key fix**: Remove `shadow-sm` from `WizardStep.tsx`'s Card since the parent page already provides the shadow wrapper.

### Complexity: **Low** (single class removal in WizardStep.tsx)

---

## SECTION 6 -- Risk Analysis

### What Could Break Visually

- Removing the inner `Card` wrapper from step components could affect spacing if any step relies on Card.Body padding
- Progress bar responsive changes could cause layout shift during resize
- 2-column document layout needs careful testing on tablet breakpoints
- Removing WizardStep shadow-sm changes the visual weight of the step container

### What Must Remain Unchanged

- Form validation logic (all Yup schemas, react-hook-form bindings)
- Submit flow and edge function contracts
- Document upload functionality (react-dropzone, Supabase storage)
- i18n key references
- Button labels and navigation flow
- Accessibility: tab order, label-input associations, ARIA attributes

### Impact on Validation Logic

- **None.** All changes are CSS/layout. No form logic, validation schemas, or data flow is affected.

---

## Implementation Summary


| Section               | Change Type        | Complexity | Files Affected                                             |
| --------------------- | ------------------ | ---------- | ---------------------------------------------------------- |
| 1. Layout Grid        | JSX + inline style | Medium     | 2 page.tsx + all 20 step files (remove inner Card wrapper) |
| 2. Progress Bar       | JSX + CSS          | Medium     | WizardProgress.tsx                                         |
| 3. Form Standards     | CSS class changes  | Low        | ~5 step files (help text alignment)                        |
| 4. Document Upload    | JSX restructure    | Medium     | Step6Documents.tsx + Step8Documents.tsx                    |
| 5. Visual Consistency | CSS class removal  | Low        | WizardStep.tsx                                             |
| 6. Risk               | N/A                | N/A        | N/A                                                        |


**Total files to modify**: ~24 files
**Estimated implementation phases**: 2 (Phase A: shared components + layout; Phase B: per-step cleanup)

---

**Note: ADDITIONAL CONTROL REQUIREMENTS BEFORE IMPLEMENTATION:**

1. Capture baseline DOM + spacing snapshot before removing inner Card wrappers.

2. Explicitly validate accessibility (aria-current, keyboard tab flow) after progress redesign.

3. Perform visual regression checks at 576px / 768px / 992px / 1200px breakpoints.

4. No form logic, validation schema, or submit flow may be modified during layout refactor.  
  
Classification of Changes

**Purely CSS (class changes only)**:

- Help text standardization (Form.Text vs div swap)
- Shadow removal from WizardStep
- Padding adjustments on mobile

**Structural JSX changes required**:

- Remove inner Card wrapper from all step components
- Document upload 2-column layout with section headers
- Progress bar responsive breakpoints (conditional rendering)

**Responsiveness changes**:

- Progress bar mobile/tablet variants
- Container padding responsive classes
- Document upload column layout breakpoint

---

*Await explicit approval before moving to implementation phase.*