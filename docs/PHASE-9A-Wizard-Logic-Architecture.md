# Phase 9A: Wizard Logic Architecture

**Status:** COMPLETED  
**Approved:** 2026-01-08  
**Restore Point:** PHASE-9A-ARCHITECTURE-COMPLETE

---

## 1. Current State Analysis

### 1.1 IMS Wizard Current Architecture

**Bouwsubsidie Wizard** (`/bouwsubsidie/apply`)
- **Route:** `/bouwsubsidie/apply`
- **Main Component:** `src/app/(public)/bouwsubsidie/apply/page.tsx`
- **Steps:** 9 total (Step 0-8)
  - Step 0: Introduction
  - Step 1: Personal Info
  - Step 2: Contact Info
  - Step 3: Household
  - Step 4: Address
  - Step 5: Application Context
  - Step 6: Documents
  - Step 7: Review
  - Step 8: Receipt (confirmation)

**Housing Registration Wizard** (`/housing/register`)
- **Route:** `/housing/register`
- **Main Component:** `src/app/(public)/housing/register/page.tsx`
- **Steps:** 10 total (Step 0-9)
  - Step 0: Introduction
  - Step 1: Personal Info
  - Step 2: Contact Info
  - Step 3: Living Situation
  - Step 4: Housing Preference
  - Step 5: Reason
  - Step 6: Income
  - Step 7: Urgency
  - Step 8: Review
  - Step 9: Receipt (confirmation)

### 1.2 State Handling Pattern

Both wizards use identical state management:

```typescript
// In page.tsx (wizard container)
const [currentStep, setCurrentStep] = useState(0)
const [formData, setFormData] = useState<FormType>(INITIAL_FORM_DATA)
const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
const [isSubmitting, setIsSubmitting] = useState(false)
```

**State Flow:**
- `currentStep`: Integer index (0-based)
- `formData`: Single object containing all form fields
- `updateFormData`: Partial merge function passed to each step
- Navigation: `handleNext()` / `handleBack()` functions

### 1.3 Validation Pattern

Each step uses `react-hook-form` + `yup`:
- Schema defined per step
- `handleSubmit()` triggers validation before `onNext()`
- Errors displayed inline below fields
- `nextDisabled` prop controls button state

### 1.4 Where Wizard Logic Lives

| Concern | Location |
|---------|----------|
| Step routing | `page.tsx` (switch statement) |
| Form state | `page.tsx` (useState) |
| Step validation | Individual step components |
| Form types | `types.ts` per wizard |
| Constants/options | `constants.ts` per wizard |
| Step UI wrapper | `src/components/public/WizardStep.tsx` |
| Progress indicator | `src/components/public/WizardProgress.tsx` |
| Layout | `src/layouts/PublicLayout.tsx` |

---

## 2. Neonwizard UI Mapping

### 2.1 Neonwizard Step Structure

Neonwizard has 5 visual steps (template demo content):
- Step 1: Service selection (3 cards)
- Step 2: Personal info + document upload
- Step 3: Service type + language + comments
- Step 4: Budget + support + optimization
- Step 5: Final date/plan selection + submit

### 2.2 IMS-to-Neonwizard Mapping Strategy

**Landing Page (`/`) - Service Selection**

| Neonwizard Step 1 | IMS Mapping |
|-------------------|-------------|
| \"Corporate Services\" | Bouwsubsidie |
| \"Freelancing Services\" | Housing Registration |
| \"Development\" | Check Status |

**Service selection determines route:**
- Bouwsubsidie → `/bouwsubsidie/apply`
- Housing Registration → `/housing/register`
- Check Status → `/status`

### 2.3 Bouwsubsidie Wizard (9 IMS steps → 5 Neonwizard visual steps)

| IMS Step | Content | Neonwizard Visual Step |
|----------|---------|------------------------|
| 0 | Introduction | Step 1 (service confirmed) |
| 1 | Personal Info | Step 2 |
| 2 | Contact Info | Step 2 (combined) |
| 3 | Household | Step 3 |
| 4 | Address | Step 3 (combined) |
| 5 | Application Context | Step 4 |
| 6 | Documents | Step 4 (combined) |
| 7 | Review | Step 5 |
| 8 | Receipt | Confirmation (outside stepper) |

**Approach:** Group IMS steps logically into 5 Neonwizard visual steps. Internal sub-steps within each visual step.

### 2.4 Housing Wizard (10 IMS steps → 5 Neonwizard visual steps)

| IMS Step | Content | Neonwizard Visual Step |
|----------|---------|------------------------|
| 0 | Introduction | Step 1 (service confirmed) |
| 1 | Personal Info | Step 2 |
| 2 | Contact Info | Step 2 (combined) |
| 3 | Living Situation | Step 3 |
| 4 | Housing Preference | Step 3 (combined) |
| 5 | Reason | Step 4 |
| 6 | Income | Step 4 (combined) |
| 7 | Urgency | Step 4 (combined) |
| 8 | Review | Step 5 |
| 9 | Receipt | Confirmation (outside stepper) |

### 2.5 Mismatches Identified

| Issue | Description | Resolution |
|-------|-------------|------------|
| Step count | IMS has 9-10 steps, Neonwizard has 5 visual steps | Group IMS steps into Neonwizard visual steps |
| Progress bar | Neonwizard shows \"X of 5\", IMS tracks all steps | Decouple visual progress from internal step index |
| Introduction | IMS has Step 0 acknowledgment, Neonwizard does not | Integrate acknowledgment into Step 1 content |
| Receipt | IMS has dedicated receipt step, Neonwizard ends at Step 5 | Receipt renders without stepper (full-width) |

---

## 3. State Management Strategy

### 3.1 Recommended Model

**Preserve existing IMS state model.** No new state machine required.

```typescript
// Existing pattern (KEEP)
const [currentStep, setCurrentStep] = useState(0)  // IMS step index
const [formData, setFormData] = useState<FormType>(INITIAL_FORM_DATA)

// NEW: Visual step mapping
const getVisualStep = (imsStep: number): number => {
  // Maps IMS step index to Neonwizard visual step (1-5)
  if (imsStep <= 0) return 1
  if (imsStep <= 2) return 2
  if (imsStep <= 4) return 3
  if (imsStep <= 6) return 4
  if (imsStep <= 7) return 5
  return 5 // Receipt shows no stepper
}
```

### 3.2 State Persistence

| Method | IN SCOPE v1.0 | Notes |
|--------|---------------|-------|
| Memory (useState) | YES | Current implementation |
| localStorage | NO | Not required for v1.0 |
| Backend (database) | NO | Phase 9B+ scope |

### 3.3 What Stays Unchanged

- Form data types (`types.ts`)
- Initial form data (`constants.ts`)
- Validation schemas (per step)
- Submit handlers
- Route paths

---

## 4. Navigation and Flow Control

### 4.1 Entry Flow

```
Landing (/)
    │
    ├── Select Bouwsubsidie → /bouwsubsidie/apply
    │
    ├── Select Housing → /housing/register
    │
    └── Select Status → /status
```

### 4.2 Wizard Navigation

**Next/Back Behavior (unchanged):**
- BACK: `setCurrentStep(prev => Math.max(prev - 1, 0))`
- NEXT: Validate current step → `setCurrentStep(prev => prev + 1)`

**Visual Step Update:**
- `NeonwizardLayout` receives `currentStep={getVisualStep(imsStep)}`
- Progress bar updates based on visual step, not IMS step

### 4.3 Service Selection Branching

Landing page Step 1 becomes a routing decision point:
- Selection stored in session/memory
- Click triggers `navigate()` to appropriate route
- No form data persisted at landing (stateless selection)

### 4.4 Status Page Flow

Status page is a separate flow:
- Entry: `/status`
- Uses `NeonwizardLayout` with `currentStep={1}` (static)
- No stepper progression (single-screen lookup)
- Result displays in Neonwizard content area

---

## 5. Validation and Error Handling (Design Only)

### 5.1 Validation Location

**Unchanged from current implementation:**
- Each IMS step component contains its own validation schema
- `react-hook-form` + `yup` pattern preserved
- Validation runs on `handleSubmit()` before navigation

### 5.2 Error Display in Neonwizard UI

**Approach:**
- Replace Neonwizard's generic `form-control` inputs with IMS form components
- Error messages render below fields using existing `.text-danger` pattern
- Neonwizard SCSS provides styling for error states

### 5.3 What Must Remain Unchanged

- Validation schemas per step
- Required field rules
- Error message content
- Validation timing (on Next, not on blur)
- Submit button disabled state logic

---

## 6. Security and Governance Check

### 6.1 RLS Impact

**NONE.** Phase 9B does not touch database tables or RLS policies.

| Concern | Impact |
|---------|--------|
| RLS policies | No changes |
| Table structure | No changes |
| Edge functions | No changes |
| Audit logging | No changes |

### 6.2 Auth Changes

**NONE.** Public wizards remain unauthenticated (citizen-facing).

| Concern | Impact |
|---------|--------|
| Auth context | Not used by public routes |
| JWT claims | Not applicable |
| Session handling | No changes |

### 6.3 Anon Escalation Risk

**NONE.** No new permissions or capabilities granted.

- Public routes remain public
- No database writes from client (mock submission only in current state)
- Status lookup uses reference + token pattern (unchanged)

### 6.4 Phase 9B Must NOT Touch

| Protected Element | Reason |
|-------------------|--------|
| `src/layouts/AdminLayout.tsx` | Admin UI isolation |
| `src/assets/scss/style.scss` | Darkone SCSS |
| Any `(admin)` route components | Scope violation |
| Database tables | Phase 9 is UI-only |
| RLS policies | Security boundary |
| Edge functions | Backend isolation |
| `audit_event` table | Governance boundary |

---

## 7. Phase 9B Readiness Checklist

### 7.1 Preconditions

| Condition | Status | Notes |
|-----------|--------|-------|
| Phase 8.5 complete | ✅ DONE | Neonwizard visual shells ready |
| NeonwizardLayout functional | ✅ DONE | Renders with currentStep prop |
| NeonwizardStep1-5 components exist | ✅ DONE | Static visual shells |
| IMS wizard logic documented | ✅ DONE | This document |
| Routing structure defined | ✅ DONE | publicRoutes in routes/index.tsx |

### 7.2 Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| CSS conflicts between Neonwizard and IMS forms | Medium | Low | Use `.neonwizard-scope` wrapper consistently |
| Step grouping feels awkward | Low | Medium | Can adjust grouping without logic changes |
| Progress bar math incorrect | Low | Low | Pure visual, easy to fix |
| Form components don't fit Neonwizard layout | Medium | Medium | May need wrapper divs with Neonwizard classes |

### 7.3 GO / NO-GO Criteria

**GO Conditions:**
- ✅ All preconditions met
- ✅ This document approved by Delroy
- ✅ Phase 8.5 restore point verified
- ✅ No outstanding blockers

**NO-GO Conditions:**
- Unresolved CSS isolation issues
- Missing Neonwizard visual components
- Incomplete step mapping documentation
- Governance violations detected

---

## 8. Implementation Approach for Phase 9B

### 8.1 Recommended Strategy: Adapter Pattern

Do NOT modify existing IMS step components. Create Neonwizard-wrapped versions:

```
NeonwizardBouwsubsidieWizard
└── NeonwizardLayout (visual shell)
    └── IMS form content (existing logic)
```

### 8.2 File Structure (Proposed)

```
src/app/(public)/
├── landing/
│   └── page.tsx  (NeonwizardLayout + Service Selection)
├── bouwsubsidie/
│   └── apply/
│       └── page.tsx  (NeonwizardLayout + IMS step logic)
├── housing/
│   └── register/
│       └── page.tsx  (NeonwizardLayout + IMS step logic)
└── status/
    └── page.tsx  (NeonwizardLayout + lookup form)
```

### 8.3 Migration Steps (Preview)

1. Update Landing page to use service selection routing
2. Wrap Bouwsubsidie wizard in NeonwizardLayout
3. Map IMS steps to visual steps
4. Replace progress indicator with Neonwizard stepper
5. Repeat for Housing wizard
6. Adapt Status page to Neonwizard layout
7. Verify all routes function correctly
8. Remove unused Darkone public components

---

## 9. Executive Summary

**Phase 9A Analysis Complete.**

**Key Findings:**
1. IMS wizard logic is well-structured and can be preserved
2. Neonwizard UI shells are ready for integration
3. Step grouping (9-10 IMS steps → 5 visual steps) is the main complexity
4. No database, RLS, or auth changes required
5. CSS isolation via `.neonwizard-scope` is sufficient

**Recommended Approach:**
- Keep all IMS wizard logic intact
- Wrap existing step content in Neonwizard layout structure
- Use adapter function to map IMS step index to visual step
- Service selection on landing routes to appropriate wizard

**Phase 9B Authorization Required To:**
1. Implement landing page service selection routing
2. Wrap wizard pages in NeonwizardLayout
3. Integrate IMS step content into Neonwizard visual structure
4. Adapt status page to Neonwizard theme

---

**Document Status:** FINALIZED  
**Phase Status:** COMPLETED  
**Next Phase:** 9B (Awaiting Authorization)
