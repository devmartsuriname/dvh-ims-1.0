# Architecture Documentation

## VolksHuisvesting IMS - DVH-IMS-1.0

### Application Structure

```
src/
├── app/
│   ├── (admin)/          # Admin dashboard routes (protected)
│   ├── (public)/         # Public-facing routes (unauthenticated)
│   └── (other)/          # Auth and utility routes
├── assets/
│   └── images/
│       └── logo-sozavo.png  # Official VolksHuisvesting logo
├── components/
│   ├── layout/           # Admin layout components
│   ├── public/           # Public layout components
│   └── wrapper/          # Shared wrapper components (LogoBox, etc.)
├── layouts/
│   ├── AdminLayout.tsx   # Dark theme admin wrapper
│   ├── AuthLayout.tsx    # Authentication pages wrapper
│   └── PublicLayout.tsx  # Light theme public wrapper
└── routes/
    ├── index.tsx         # Route definitions
    └── router.tsx        # Router configuration
```

### Routing Architecture

| Route Pattern | Layout | Theme | Auth Required |
|---------------|--------|-------|---------------|
| `/` | PublicLayout | Light | No |
| `/status` | PublicLayout | Light | No |
| `/bouwsubsidie/*` | PublicLayout | Light | No |
| `/housing/*` | PublicLayout | Light | No |
| `/dashboards` | AdminLayout | Dark | Yes |
| `/admin/*` | AdminLayout | Dark | Yes |
| `/audit-log` | AdminLayout | Dark | Yes (Governance) |
| `/auth/*` | AuthLayout | Dark | No |

### Authentication Flow

1. User accesses protected route → redirected to `/auth/sign-in?redirectTo=<original>`
2. User submits credentials → Supabase authentication
3. On success:
   - If `redirectTo` exists → navigate to that URL
   - Otherwise → navigate to `/dashboards`

### Branding & Logo

**Official Logo:** `src/assets/images/logo-sozavo.png`

| Context | Component | Logo Height |
|---------|-----------|-------------|
| Public Header | `PublicHeader.tsx` | 48px |
| Admin Sidebar | `LogoBox.tsx` | 32px |
| Auth Pages | SignIn/SignUp/ResetPassword/LockScreen | 48px |

**Single Import Path:** All components import logo from `@/assets/images/logo-sozavo.png` for easy replacement.

### Change Log

| Date | Component | Change |
|------|-----------|--------|
| 2026-01-07 | useSignIn.ts | Default post-login redirect: `/` → `/dashboards` |
| 2026-01-07 | PublicHeader.tsx | Logo import changed to ES6 module for proper asset resolution |
| 2026-01-07 | status/page.tsx | Refactored to use shared PublicHeader/PublicFooter |
| 2026-01-07 | landing/page.tsx | Hero section enhanced with background image + dark overlay |
| 2026-01-07 | StatusForm.tsx | Button icon alignment fixed with flexbox centering |
| 2026-01-07 | All logos | Replaced Darkone default with official SoZaVo logo |
| 2026-01-07 | status/page.tsx | Removed breadcrumb, fixed "Back to Home" button alignment |
| 2026-01-09 | AuditLogFilters.tsx | Added Flatpickr base CSS import to fix oversized SVG chevrons |
| 2026-01-13 | TopNavigationBar | Global Search integrated with RLS-safe queries across 4 entities |

### Technology Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Darkone Admin Template, Bootstrap 5, SCSS
- **Backend**: Supabase (Auth, Database, RLS)
- **Routing**: React Router DOM v6

### Public Page Design Standards

**Darkone 1:1 Compliance:**
- All public pages use `react-bootstrap` components
- Shared header/footer from `src/components/public/`
- Icons via `@iconify/react` (mingcute set)
- Light theme applied via `PublicLayout` wrapper
- Premium government visual tone (no playful elements)
- NO breadcrumbs on Status page
- Buttons use proper flex centering for icon alignment

**Asset Management:**
- Images imported as ES6 modules (not static paths)
- Logo from `src/assets/images/logo-sozavo.png`
- Background patterns from `src/assets/images/`

### Live URL vs Editor Parity

**Root Cause of Discrepancies:**
- Deployment cache serving stale build artifacts
- Not a code defect - Editor View renders correctly

**Resolution Steps:**
1. Click "Publish" button in Lovable
2. Wait for deployment to complete (1-2 minutes)
3. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
4. Verify all routes match Editor View

---

## RLS Security Model

### Overview

All 23 database tables have Row-Level Security (RLS) enabled with a Phase 1 allowlist security model.

**Full Policy Matrix:** See [RLS_POLICY_MATRIX.md](./RLS_POLICY_MATRIX.md)

### Security Posture (Phase 1)

| Attribute | Value |
|-----------|-------|
| Model | Single-email allowlist |
| Allowed Email | `info@devmart.sr` |
| Default Access | Deny all |
| RLS Status | Enabled on all tables |

### Table Categories

| Category | Tables | Access Pattern |
|----------|--------|----------------|
| Shared Core | person, household, household_member, contact_point, address | Admin allowlist |
| Bouwsubsidie | subsidy_case, subsidy_case_status_history, subsidy_document_*, social_report, technical_report, generated_document | Admin allowlist |
| Woning Registratie | housing_registration, housing_registration_status_history, housing_urgency, district_quota, allocation_*, assignment_record | Admin allowlist |
| Public Access | public_status_access | Admin allowlist (token validation deferred) |
| System | app_user_profile (user self), audit_event (append-only) | Special patterns |

### Immutable Patterns (By Design)

- **No DELETE** on any table — Records are immutable for audit compliance
- **No UPDATE** on history/status tables — Append-only for audit trail
- **No SELECT** on audit_event — Write-only; admin reads via Supabase Dashboard

### Change History

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-07 | RLS Security Model section added | Phase 8 security audit |
| 2026-01-09 | Governance routes added (/audit-log) | Admin v1.1-A Audit Log Interface |
| 2026-01-09 | Grid button pattern standardized | Admin v1.1-A Minor Fixes |

---

## Governance Module (Admin v1.1-A)

### Audit Log Interface

**Purpose:** Read-only interface for governance roles to review system activity.

**Route:** `/audit-log`

**Allowed Roles:**
- `system_admin`
- `minister`
- `project_leader`
- `audit`

**Features:**
- Paginated table view (25 rows per page)
- Filters: date range, action, entity type, actor
- Detail drawer with safe metadata display
- CSV export of filtered view

**Security Controls:**
- RLS-enforced SELECT on `audit_event`
- Page-level role check with redirect for unauthorized access
- Sensitive metadata fields (tokens, passwords, IPs) hidden from display
- No destructive actions (read-only)

---

## Dashboard KPI Data Layer (Admin v1.1-B)

### Data Hooks

**File:** `src/app/(admin)/dashboards/hooks/useDashboardData.ts`

| Hook | Purpose | Source Tables | Accepts TimeRange |
|------|---------|---------------|-------------------|
| `useDashboardKPIs` | Card KPIs (totals, status counts) | `housing_registration`, `subsidy_case` | No |
| `useMonthlyTrends` | Monthly chart data | `housing_registration`, `subsidy_case`, `allocation_decision` | Yes |
| `useDistrictApplications` | District map aggregation | `housing_registration`, `subsidy_case` | No |
| `useStatusBreakdown` | Status pie chart | `subsidy_case` | Yes |
| `useRecentCases` | Recent cases table | `subsidy_case` + `person` | No |
| `useRecentRegistrations` | Recent registrations table | `housing_registration` + `person` | No |

### Time Range Filtering (v1.1-B Step B2.2 + Decoupling Fix)

**Per-Widget State Pattern (v1.1-B Bugfix):**

Each widget owns its own TimeRange state. There is NO global TimeRange.

```
Dashboard Page
    │
    ├── Cards (KPI Sparklines)
    │   └── SPARKLINE_TIME_RANGE: '1Y' (constant, decoupled)
    │       └── useSparklineData('1Y')
    │
    ├── Chart (Monthly Trends)
    │   ├── trendsRange: TimeRange (local state)
    │   └── useMonthlyTrends(trendsRange)
    │
    └── SaleChart (Cases-by-Status)
        ├── statusRange: TimeRange (local state)
        └── useStatusBreakdown(statusRange)
```

**Widget State Ownership:**

| Widget | State Variable | Default | Controlled By |
|--------|----------------|---------|---------------|
| Monthly Trends | `trendsRange` (local in Chart.tsx) | `'1Y'` | Own buttons |
| Cases-by-Status | `statusRange` (local in SaleChart.tsx) | `'1Y'` | Own buttons |
| KPI Sparklines | Fixed `'1Y'` constant | `'1Y'` | None (stable) |

**TimeRange Type:**
```typescript
export type TimeRange = 'ALL' | '1M' | '6M' | '1Y'
```

**Filter Calculation:**
- ALL = no constraint
- 1M = `now() - 30 days`
- 6M = `now() - 180 days`
- 1Y = `now() - 365 days`

**Query Filter Applied:**
```typescript
if (cutoff) {
  query = query.gte('created_at', cutoff) // or 'decided_at' for allocation_decision
}
```

### KPI Calculation Logic

| KPI | Calculation | Notes |
|-----|-------------|-------|
| Total Registrations | `COUNT(housing_registration)` | All records |
| Total Subsidy Cases | `COUNT(subsidy_case)` | All records |
| Pending Applications | `COUNT(subsidy_case WHERE status IN ('received', 'pending_documents'))` | v1.1-B fix |
| Approved Applications | `COUNT(subsidy_case WHERE status = 'approved')` | |
| Rejected Applications | `COUNT(subsidy_case WHERE status = 'rejected')` | |

### District Code Normalization

Database uses 3-letter codes (PAR, WAA, etc.), UI map uses 2-letter codes (PM, WA, etc.).

Alias mapping applied in `useDistrictApplications`:

| DB Code | UI Code | District |
|---------|---------|----------|
| PAR | PM | Paramaribo |
| WAA | WA | Wanica |
| NIC | NI | Nickerie |
| COR | CO | Coronie |
| SAR | SA | Saramacca |
| COM | CM | Commewijne |
| MAR | MA | Marowijne |
| PAB | PA | Para |
| BRO | BR | Brokopondo |
| SIP | SI | Sipaliwini |

---

## Dashboard Sparkline Data Layer (Admin v1.1-B Step B2.3)

### useSparklineData Hook

**File:** `src/app/(admin)/dashboards/hooks/useDashboardData.ts`

**Purpose:** Fetch time-bucketed historical data for KPI card sparklines.

**Signature:**
```typescript
export const useSparklineData = (timeRange: TimeRange = '1Y'): { data: SparklineData; loading: boolean }
```

### Data Flow (Per-Widget Decoupled)

```
Cards Component
    └── SPARKLINE_TIME_RANGE: '1Y' (constant)
         └── useSparklineData('1Y')
              ├── registrations[] → Housing Registrations card
              ├── subsidyCases[] → Subsidy Applications card
              ├── pendingCases[] → Pending Applications card
              └── approvedCases[] → Approved Applications card
```

Note: KPI sparklines are decoupled from chart TimeRange controls. They use a fixed '1Y' range.

### Bucketing Algorithm

| TimeRange | Bucket Type | Count | Calculation |
|-----------|-------------|-------|-------------|
| 1M | Daily | 30 | `new Date(year, month, day - i)` |
| 6M | Weekly | 26 | `now - (i * 7 days)` |
| 1Y / ALL | Monthly | 12 | `new Date(year, month - i, 1)` |

### Zero-Fill Fallback

If query fails or returns no data, returns arrays filled with 0 to prevent chart rendering errors:

```typescript
// On error
setData({
  registrations: new Array(bucketCount).fill(0),
  subsidyCases: new Array(bucketCount).fill(0),
  pendingCases: new Array(bucketCount).fill(0),
  approvedCases: new Array(bucketCount).fill(0),
})
```

### RLS Compliance

All queries use the authenticated Supabase client. No service role bypass.

---

## Admin v1.1-C: Global Search Bugfix (2026-01-13)

### SCSS Variable Fix

**Issue:** Build failure - undefined `$font-size-xs` in `_search-results.scss`.

**Fix:** Replaced with existing `$font-size-sm` (2 occurrences: lines 60, 103).

**File:** `src/assets/scss/components/_search-results.scss`

**Restore Point:** `ADMIN_V1_1_C_GLOBAL_SEARCH_BUGFIX_COMPLETE`

---

## Admin v1.1-D: Public Wizard Submission Fix (2026-01-14)

### Frontend Schema Alignment

Both public wizards had payload mismatches with their Edge Functions:

| Wizard | Old Fields | New Fields |
|--------|------------|------------|
| Bouwsubsidie | `full_name`, `address_line` | `first_name` + `last_name`, `address_line_1` |
| Housing | `full_name`, `current_address`, `current_district` | `first_name` + `last_name`, `address_line_1`, `district` |

### Required Fields Added

- `gender` (both wizards)
- `email` (both wizards)
- `date_of_birth` (both wizards)

### Status Lookup Fix

Edge Function `lookup-public-status` incorrectly treated Supabase JOIN person data as an array.

**Fix:** Changed from array extraction (`personData.length > 0`) to single object cast.

### Files Modified

**Bouwsubsidie:**
- `src/app/(public)/bouwsubsidie/apply/types.ts`
- `src/app/(public)/bouwsubsidie/apply/constants.ts`
- `src/app/(public)/bouwsubsidie/apply/steps/Step1PersonalInfo.tsx`
- `src/app/(public)/bouwsubsidie/apply/steps/Step2ContactInfo.tsx`
- `src/app/(public)/bouwsubsidie/apply/steps/Step4Address.tsx`
- `src/app/(public)/bouwsubsidie/apply/steps/Step7Review.tsx`

**Housing Registration:**
- `src/app/(public)/housing/register/types.ts`
- `src/app/(public)/housing/register/constants.ts`
- `src/app/(public)/housing/register/steps/Step1PersonalInfo.tsx`
- `src/app/(public)/housing/register/steps/Step2ContactInfo.tsx`
- `src/app/(public)/housing/register/steps/Step3LivingSituation.tsx`
- `src/app/(public)/housing/register/steps/Step8Review.tsx`

**Edge Function:**
- `supabase/functions/lookup-public-status/index.ts`

**Restore Point:** `RESTORE_POINT_v1.1-D_BACKEND_IMPACT_CHECK_COMPLETE`

---

## Admin v1.1-D: D1 — Empty State Standardization

### Standard Pattern

All admin module tables with GridJS follow this standardized empty state pattern:

```tsx
{loading ? (
  <div className="text-center py-4">
    <Spinner animation="border" variant="primary" />
  </div>
) : items.length === 0 ? (
  <p className="text-muted text-center py-4">No [items] found. Click "[Action]" to create one.</p>
) : (
  <Grid data={gridData} ... />
)}
```

### CSS Classes Used

- `text-muted` — Subdued text color (Darkone theme compliant)
- `text-center` — Center alignment
- `py-4` / `py-5` — Vertical padding

### Files Updated

| Module | File | Empty State Message |
|--------|------|---------------------|
| Allocation Runs | `src/app/(admin)/allocation-runs/components/RunTable.tsx` | "No allocation runs found. Click 'Execute Run' to start one." |
| Allocation Quotas | `src/app/(admin)/allocation-quotas/components/QuotaTable.tsx` | "No district quotas found. Click 'New Quota' to create one." |
| Dashboard Trends | `src/app/(admin)/dashboards/components/Chart.tsx` | "No activity data available for the selected period." |

### Previously Compliant Modules

| Module | File | Status |
|--------|------|--------|
| Persons | `PersonTable.tsx` | ✓ Already compliant |
| Households | `HouseholdTable.tsx` | ✓ Already compliant |
| Subsidy Cases | `CaseTable.tsx` | ✓ Already compliant |
| Housing Registrations | `RegistrationTable.tsx` | ✓ Already compliant |

**Restore Point:** `RESTORE_POINT_v1.1-D_D1_EMPTY_STATE_COMPLETE`

---

## Admin v1.1-D: D2 — Notification Hygiene

### Standard Pattern

All admin modules use the unified notification helper for consistent user feedback:

**File:** `src/utils/notify.ts`

```typescript
import { notify } from '@/utils/notify'

// Success notifications
notify.success('Record created successfully')

// Error notifications  
notify.error('Failed to load data')

// Info notifications
notify.info('Processing in progress')

// Warning notifications
notify.warn('Please review before submitting')
```

### Notification Rules

| Type | Use Case | Behavior |
|------|----------|----------|
| `success` | CRUD operations, status changes | Auto-dismiss 3s, top-right |
| `error` | Failed operations, validation errors | Auto-dismiss 3s, top-right |
| `info` | Informational messages | Auto-dismiss 3s, top-right |
| `warn` | Warnings, cautionary messages | Auto-dismiss 3s, top-right |

### Default Options

```typescript
{
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
}
```

### Files Updated

| Module | File | Change |
|--------|------|--------|
| Allocation Quotas | `QuotaTable.tsx` | `toast` → `notify` |
| Allocation Runs | `RunTable.tsx`, `RunExecutorModal.tsx`, `[id]/page.tsx` | `toast` → `notify` |
| Allocation Decisions | `DecisionTable.tsx`, `DecisionFormModal.tsx` | `toast` → `notify` |
| Allocation Assignments | `AssignmentTable.tsx`, `AssignmentFormModal.tsx` | `toast` → `notify` |
| Persons | `PersonFormModal.tsx` | `toast` → `notify` |
| Households | `[id]/page.tsx` | `toast` → `notify` |
| Subsidy Cases | `CaseFormModal.tsx`, `[id]/page.tsx` | `toast` → `notify` |
| Housing Registrations | `RegistrationFormModal.tsx`, `UrgencyAssessmentForm.tsx`, `[id]/page.tsx` | `toast` → `notify` |

### What Is NOT Changed

- **Auth module**: SignIn/SignUp continue using `NotificationContext` (different UX context)
- **Database**: No schema changes
- **RLS**: No policy changes
- **Edge Functions**: No server-side changes

**Restore Point:** `RESTORE_POINT_ADMIN_v1.1_D_D2_NOTIFICATION_HYGIENE_COMPLETE`

---

## Admin v1.1-D: D3 — Form Validation Standardization

### Standard Pattern

All admin CRUD forms use Bootstrap inline validation:

```tsx
<Form.Select
  isInvalid={!!validationErrors.fieldName}
  onChange={(e) => { handleChange(e); clearFieldError('fieldName') }}
>
  ...
</Form.Select>
{validationErrors.fieldName && (
  <Form.Control.Feedback type="invalid">
    {validationErrors.fieldName}
  </Form.Control.Feedback>
)}
```

### Validation Rules

| Rule | Implementation |
|------|----------------|
| Validation trigger | On form submit only |
| Error display | Inline `Form.Control.Feedback` |
| Error clearing | On field change |
| Backend errors | `notify.error()` only |
| Validation scope | DB NOT NULL constraints only |

### Files Updated

| Module | File | Fields Validated |
|--------|------|------------------|
| Subsidy Cases | `CaseFormModal.tsx` | applicant, household, district, amount |
| Housing Registrations | `RegistrationFormModal.tsx` | household, applicant, district |
| Urgency Assessment | `UrgencyAssessmentForm.tsx` | category, points |
| Allocation Quotas | `QuotaFormModal.tsx` | district, periodStart, periodEnd, totalQuota |
| Allocation Assignments | `AssignmentFormModal.tsx` | registration, assignmentDate |
| Households | `HouseholdFormModal.tsx` | headOfHousehold |

### What Is NOT Changed

- **PersonFormModal**: Gender select excluded (not inline validated)
- **Auth module**: Uses NotificationContext (different UX context)
- **Database**: No schema changes
- **RLS**: No policy changes
- **Edge Functions**: No server-side changes

**Restore Point:** `RESTORE_POINT_ADMIN_v1.1_D_D3_FORM_VALIDATION_COMPLETE`

---

## Admin v1.2: Modal UI Standards (2026-01-24)

### Authoritative Modal Pattern (Darkone 1:1)

All admin modals MUST follow this standardized pattern:

```tsx
<Modal show={...} onHide={...} size="lg" centered>
  <Modal.Header closeButton>
    <Modal.Title>...</Modal.Title>
  </Modal.Header>
  <Form onSubmit={...}>
    <Modal.Body>...</Modal.Body>
    <Modal.Footer>
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary" type="submit">Submit</Button>
    </Modal.Footer>
  </Form>
</Modal>
```

### Required Properties

| Property | Value | Rationale |
|----------|-------|-----------|
| `size` | `"lg"` | ~800px width — optimal for 2-column form layouts |
| `centered` | `true` | Vertical + horizontal centering for consistent UX |

### Compliant Modals (8 Total)

| Module | Component | Status |
|--------|-----------|--------|
| Persons | PersonFormModal | ✅ Compliant |
| Households | HouseholdFormModal | ✅ Compliant |
| Subsidy Cases | CaseFormModal | ✅ Compliant |
| Housing Registrations | RegistrationFormModal | ✅ Compliant |
| District Quotas | QuotaFormModal | ✅ Compliant |
| Allocation Runs | RunExecutorModal | ✅ Compliant |
| Allocation Decisions | DecisionFormModal | ✅ Compliant |
| Allocation Assignments | AssignmentFormModal | ✅ Compliant |

### Forbidden Practices

- ❌ Custom CSS for modal sizing
- ❌ SCSS overrides for modal positioning
- ❌ Per-module size variants (`sm`, `xl`)
- ❌ Top-aligned modals (missing `centered`)
- ❌ Mixed positioning behaviors

**Restore Point:** `RESTORE_POINT_MODAL_STANDARDIZATION_COMPLETE`

---

## V1.7.x — WizardProgress Active Step Underline Fix (2026-02-27)

### Change

**File:** `src/components/public/WizardProgress.tsx`

Replaced phase-level underline coloring with step-level logic:

```
BEFORE: phase.steps.includes(currentStep) ? 'bg-primary' : 'bg-light'
AFTER:  index <= currentStep ? 'bg-primary' : 'bg-light'
```

Only completed and current steps show `bg-primary` underline. Future steps always show `bg-light`.

### Impact

- Applies to both Bouwsubsidie (9 steps) and Woningregistratie (11 steps) via shared `WizardProgress` component.
- No DB, RLS, validation, or i18n changes.

**Restore Point:** `V1.7x-WizardProgress-Underline-Fix`

---

## V1.7.x — DocumentUploadAccordion Visibility (2026-02-27)

### Decision: Editor-Only Artifact — Won't Fix

**Observation:** Expanding accordion items on the Documents step sometimes shows a blank/white area in the Lovable editor preview.

**Validation:** Tested in Live Preview (production-like): dropzone renders correctly for both Bouwsubsidie and Woningregistratie wizards. No production issue.

**Action:** No code changes applied. No CSS, Tab.Pane, or layout modifications.

**Re-open criteria:** Only if the issue reproduces in Live Preview with a clear repro path.

**Restore Point:** `V1.7x-Accordion-WontFix`
