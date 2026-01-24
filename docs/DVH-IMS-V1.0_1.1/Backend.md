# Backend Documentation

## VolksHuisvesting IMS - DVH-IMS-1.0

### Authentication Flow

**Post-Login Redirect Logic** (`src/app/(other)/auth/sign-in/useSignIn.ts`)

- If `redirectTo` query parameter exists → navigate to that URL
- If no `redirectTo` parameter → navigate to `/dashboards` (Admin Dashboard)

**Change History:**
| Date | Change | Reason |
|------|--------|--------|
| 2026-01-07 | Default redirect changed from `/` to `/dashboards` | Phase 5 introduced public landing at `/`, admin dashboard moved to `/dashboards` |

### Supabase Integration

- Authentication: `supabase.auth.signInWithPassword()`
- Session management via Supabase Auth
- RLS policies enforced at database level

### Route Protection

- Admin routes protected via `ProtectedRoute` wrapper
- Public routes accessible without authentication
- Staff Portal button redirects to `/auth/sign-in?redirectTo=/dashboards`

---

## Phase 5 - CP6 Quality Gate (2026-01-07)

### Public Pages Asset Resolution

**Issue Fixed:** Logo images were not rendering on public pages due to incorrect path reference.

**Solution:** Changed from static path (`/assets/images/logo-dark.png`) to ES6 module import (`import logoDark from '@/assets/images/logo-dark.png'`).

**Files Modified:**
- `src/components/public/PublicHeader.tsx` - Logo import fix

### Shared Component Usage

All public pages now use the centralized `PublicHeader` and `PublicFooter` components from `src/components/public/` for Darkone 1:1 parity.

| Page | Route | Shared Components |
|------|-------|-------------------|
| Landing | `/` | PublicHeader, PublicFooter |
| Status Tracker | `/status` | PublicHeader, PublicFooter |
| Bouwsubsidie Wizard | `/bouwsubsidie/apply` | PublicHeader, PublicFooter |
| Housing Wizard | `/housing/register` | PublicHeader, PublicFooter |

---

## Phase 5 - CP6 Quality Gate Fix (2026-01-07)

### Official Logo Replacement

**Change:** Replaced Darkone default logo with official SoZaVo (VolksHuisvesting) logo across all pages.

**Logo Asset:** `src/assets/images/logo-sozavo.png`

**Files Updated:**
| File | Component | Description |
|------|-----------|-------------|
| `src/components/public/PublicHeader.tsx` | PublicHeader | Public pages header logo |
| `src/components/wrapper/LogoBox.tsx` | LogoBox | Admin sidebar logo |
| `src/app/(other)/auth/sign-in/components/SignIn.tsx` | SignIn | Login page logo |
| `src/app/(other)/auth/sign-up/components/SignUp.tsx` | SignUp | Registration page logo |
| `src/app/(other)/auth/reset-password/components/ResetPassword.tsx` | ResetPassword | Password reset logo |
| `src/app/(other)/auth/lock-screen/components/LockScreen.tsx` | LockScreen | Lock screen logo |

### Status Page Darkone 1:1 Fixes

**Issues Fixed:**
1. **Breadcrumb Removed** - Status page no longer displays breadcrumb per CP6 requirements
2. **Button Alignment Fixed** - "Back to Home" now uses proper Darkone Button component with centered icon/label
3. **Help Text Alignment** - Moved into Card footer with proper flex centering

**Root Cause of Live URL vs Editor Mismatch:**
- **Cause:** Deployment cache - Live URL was serving stale build artifacts
- **Not a code issue** - Editor View renders correct components
- **Fix:** User must click "Publish" and hard refresh browser to propagate latest build

### WGA Polish Plan (Public Pages)

**Government-Grade Visual Standards:**
1. Landing: Hero with dark overlay, no gradients, clean typography hierarchy
2. Status: No breadcrumb, proper card footer with centered button
3. Wizards: Consistent progress indicators, button spacing, card shadows
4. All pages: Official SoZaVo logo, Darkone components only, no custom icons

---

## Edge Function Import Standards

### Supabase Client Import

All Edge Functions MUST use import maps via `supabase/functions/deno.json`:

**deno.json configuration:**
```json
{
  "imports": {
    "@supabase/supabase-js": "npm:@supabase/supabase-js@2"
  },
  "nodeModulesDir": "auto"
}
```

**Edge Function import:**
```typescript
// CORRECT - Uses import map, stable build
import { createClient } from '@supabase/supabase-js'

// FORBIDDEN - CDN dependency, causes 5xx build failures
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
```

**Rationale:**
- Import maps with `nodeModulesDir: "auto"` resolve npm packages natively
- No external CDN dependency (esm.sh can return 522 errors)
- Version pinning in deno.json ensures reproducible builds

**Change History:**
| Date | Change | Reason |
|------|--------|--------|
| 2026-01-07 | Added deno.json with import map, replaced esm.sh | Build stability - esm.sh 522 errors |

---

## Edge Functions Security Checklist

All Edge Functions MUST implement the following security controls:

### 1. Authorization (REQUIRED)

```typescript
// Authorization header required
const authHeader = req.headers.get('Authorization')
if (!authHeader) {
  return new Response(
    JSON.stringify({ success: false, error: 'Missing authorization header', code: 'AUTH_MISSING' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// JWT validation via getUser()
const token = authHeader.replace('Bearer ', '')
const { data: { user }, error: userError } = await supabase.auth.getUser(token)
```

### 2. Allowlist/Role Check (REQUIRED for Phase 1)

```typescript
// Current Phase 1: Single email allowlist
if (user.email !== 'info@devmart.sr') {
  return new Response(
    JSON.stringify({ success: false, error: 'Unauthorized', code: 'AUTH_FORBIDDEN' }),
    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
```

### 3. Input Validation (REQUIRED)

```typescript
// UUID validation
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// Validate before processing
if (!isValidUUID(run_id)) {
  return new Response(
    JSON.stringify({ success: false, error: 'Invalid run_id format', code: 'VALIDATION_UUID' }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
```

### 4. Error Response Standards (REQUIRED)

- Return structured JSON with `success`, `error`, and `code` fields
- Never expose internal stack traces or system details
- Use generic error messages for security-sensitive failures

```typescript
// CORRECT - Safe error response
return new Response(
  JSON.stringify({ success: false, error: 'Processing error', code: 'INTERNAL_ERROR' }),
  { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
)

// FORBIDDEN - Exposes internal details
return new Response(JSON.stringify({ error: error.stack }), ...)
```

### 5. Logging Standards (REQUIRED)

```typescript
// CORRECT - Sanitized logs, no PII
console.log(`Allocation run started: run=${run_id.substring(0, 8)}...`)
console.error('Auth validation failed')

// FORBIDDEN - Exposes PII or secrets
console.error('User validation failed:', userError)
console.log(`User email: ${user.email}`)
```

### 6. Environment Variables (REQUIRED)

```typescript
// CORRECT - Check for undefined, use safe defaults
const supabaseUrl = Deno.env.get('SUPABASE_URL')
if (!supabaseUrl) {
  return new Response(
    JSON.stringify({ success: false, error: 'Server configuration error', code: 'CONFIG_ERROR' }),
    { status: 500, ... }
  )
}

// FORBIDDEN - Non-null assertion without check
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
```

### 7. Audit Logging (REQUIRED for state changes)

```typescript
// All state-changing operations must log to audit_event
await supabase.from('audit_event').insert({
  actor_user_id: user.id,
  entity_type: 'allocation_run',
  entity_id: run_id,
  action: 'CREATE',
  metadata_json: { /* safe metadata only */ }
})
```

---

## Audit Logging Governance

### Schema: `audit_event`

| Column | Type | Purpose |
|--------|------|---------|
| `actor_user_id` | UUID | Who performed the action |
| `action` | TEXT | What action (CREATE, UPDATE, etc.) |
| `entity_type` | TEXT | Which entity type |
| `entity_id` | UUID | Which entity instance |
| `occurred_at` | TIMESTAMPTZ | When (auto-populated) |
| `metadata_json` | JSONB | Safe metadata only |
| `reason` | TEXT | Optional context |
| `actor_role` | TEXT | Role at time of action |

### Rules (MANDATORY)

1. **All create/update operations MUST call `logAuditEvent()`** (via `useAuditLog` hook)
2. **Audit records are append-only** — No UPDATE or DELETE allowed
3. **Admin read access deferred** — SELECT denied; use Supabase Dashboard for now
4. **Edge Functions must audit state-changing operations** directly via INSERT

### RLS Protection

```sql
-- INSERT only for allowlist users, must match actor_user_id
CREATE POLICY "Allowlist users can insert audit_event" 
ON public.audit_event 
FOR INSERT 
WITH CHECK (
  (actor_user_id = auth.uid()) AND 
  (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text)
);

-- SELECT allowed for governance roles (v1.1-A)
CREATE POLICY "role_select_audit_event" ON public.audit_event
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'audit'::app_role) OR
  has_role(auth.uid(), 'system_admin'::app_role) OR
  has_role(auth.uid(), 'minister'::app_role) OR
  has_role(auth.uid(), 'project_leader'::app_role)
);
```

### Usage (Frontend)

```typescript
import { useAuditLog } from '@/hooks/useAuditLog'

const { logAuditEvent } = useAuditLog()

await logAuditEvent({
  action: 'CREATE',
  entityType: 'subsidy_case',
  entityId: newCase.id,
  metadata: { status: 'received' }
})
```

---

## Security Model Overview (Phase 1)

### Current Posture: Single-Email Allowlist

| Attribute | Value |
|-----------|-------|
| Security Model | Allowlist (Phase 1) |
| Allowed Email | `info@devmart.sr` |
| RLS Enforcement | All 23 tables |
| Default Access | Deny all |

### Design Decisions

1. **No anonymous access** — All data operations require authentication
2. **Single allowlist email** — Simplifies Phase 1; RBAC deferred
3. **Append-only history tables** — No UPDATE/DELETE for audit trail
4. **No DELETE on core tables** — Immutable records for compliance

### Action Items (Outside Codebase)

| Item | Location | Status |
|------|----------|--------|
| Enable Leaked Password Protection | Supabase Dashboard > Auth > Security | PENDING |
| Enable MFA (future) | Supabase Dashboard > Auth > MFA | DEFERRED |

### Deferred to Future Phases

- Role-Based Access Control (RBAC)
- District-level access scoping
- Admin read access to audit_event
- Public wizard anonymous submission

---

## Change History

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-07 | Phase 8 security documentation added | Security + Audit Readiness |
| 2026-01-07 | Edge Functions Security Checklist | Standardize security controls |
| 2026-01-07 | Audit Logging Governance | Document append-only pattern |
| 2026-01-09 | Admin v1.1-A: Audit Log Interface | Read-only audit log for governance roles |

---

## Admin v1.1-A: Audit Log Interface (Read-Only)

### Overview

A read-only Audit Log interface was added for governance roles to review system activity.

**Route:** `/audit-log`

**Access:** `system_admin`, `minister`, `project_leader`, `audit`

### Components

| Component | Path | Purpose |
|-----------|------|---------|
| Page | `src/app/(admin)/audit-log/page.tsx` | Main page wrapper with access control |
| Table | `src/app/(admin)/audit-log/components/AuditLogTable.tsx` | Data table with pagination |
| Filters | `src/app/(admin)/audit-log/components/AuditLogFilters.tsx` | Date range, action, entity, actor filters |
| Drawer | `src/app/(admin)/audit-log/components/AuditDetailDrawer.tsx` | Detail view (excludes sensitive fields) |
| Export | `src/app/(admin)/audit-log/components/AuditExportButton.tsx` | CSV export of filtered view |
| Hook | `src/hooks/useAuditEvents.ts` | Paginated data fetching |

### Security

- **RLS Enforced:** All reads go through authenticated Supabase client
- **No Service Role Bypass:** Client uses anon key only
- **Sensitive Field Filtering:** Metadata fields containing tokens, passwords, IPs are hidden
- **Page-Level Access Control:** Non-authorized roles redirected to dashboard

### RLS Policy Update

Extended SELECT access on `audit_event` table:

```sql
CREATE POLICY "role_select_audit_event" ON public.audit_event
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'audit'::app_role) OR
  has_role(auth.uid(), 'system_admin'::app_role) OR
  has_role(auth.uid(), 'minister'::app_role) OR
  has_role(auth.uid(), 'project_leader'::app_role)
);
```

---

## Admin v1.1-A Minor Fixes (2026-01-09)

### Households Module - View Button Fix

**Issue:** Actions column in Households table was missing a View button formatter.

**Fix:** Added `html` formatter with data attribute pattern and event delegation.

**File:** `src/app/(admin)/households/components/HouseholdTable.tsx`

### Allocation Quotas Module - Edit Button Fix

**Issue:** Edit button used `window.dispatchEvent` which suffered from listener timing issues.

**Fix:** Replaced with data attribute pattern (`data-quota-edit`) and document-level event delegation via useEffect.

**File:** `src/app/(admin)/allocation-quotas/components/QuotaTable.tsx`

### Pattern Used

Both tables now use the same reliable pattern for Grid.js button actions:
1. Button uses `data-*` attribute containing the row ID
2. useEffect adds document click listener
3. Event delegation via `closest()` selector
4. Direct handler invocation

---

## Admin v1.1-A - Audit Log Flatpickr CSS Fix (2026-01-09)

### Audit Log Module - Flatpickr Base CSS Import

**Issue:** AuditLogFilters component imported `react-flatpickr` without the required base CSS, causing unstyled SVG chevrons to render at uncontrolled sizes below the Audit Log table.

**Root Cause:** The Darkone SCSS (`_flatpicker.scss`) only provides theme overrides and assumes base Flatpickr CSS is already loaded. Without it, SVG elements in the calendar picker had no sizing constraints.

**Fix:** Added `import 'flatpickr/dist/flatpickr.min.css'` before the Flatpickr component import.

**File:** `src/app/(admin)/audit-log/components/AuditLogFilters.tsx`

**Restore Point:** `ADMIN_V1_1_A_AUDITLOG_FIX_COMPLETE`

---

## Admin v1.1-B: Dashboard KPI Correctness (2026-01-09)

### Pending Applications KPI Fix

**Issue:** "Pending Applications" KPI only counted `status = 'received'`, missing 5 cases with `status = 'pending_documents'`.

**Fix:** Changed query to use `.in('status', ['received', 'pending_documents'])`.

**Business Logic:** Both statuses represent applications awaiting processing.

**File:** `src/app/(admin)/dashboards/hooks/useDashboardData.ts`

### District Applications Aggregation Fix

**Issue:** District applications map dropped records due to code mismatch between database (3-letter: PAR, WAA) and UI (2-letter: PM, WA).

**Fix:** Added deterministic alias mapping in aggregation layer:

```typescript
const DISTRICT_CODE_ALIASES: Record<string, string> = {
  'PAR': 'PM', // Paramaribo
  'WAA': 'WA', // Wanica
  'NIC': 'NI', // Nickerie
  'COR': 'CO', // Coronie
  'SAR': 'SA', // Saramacca
  'COM': 'CM', // Commewijne
  'MAR': 'MA', // Marowijne
  'PAB': 'PA', // Para
  'BRO': 'BR', // Brokopondo
  'SIP': 'SI', // Sipaliwini
}
```

**File:** `src/app/(admin)/dashboards/hooks/useDashboardData.ts`

**Restore Point:** `ADMIN_V1_1_B_DASH_KPI_FIX_COMPLETE`

---

## Admin v1.1-B: Dashboard Time Range Filters (2026-01-09)

### Time Range Filtering

**Purpose:** Enable functional time range filtering (ALL/1M/6M/1Y) for Monthly Trends and Cases-by-Status charts.

**Time Window Definitions:**
| Filter | Calculation | Description |
|--------|-------------|-------------|
| ALL | No constraint | All historical data |
| 1M | `now() - 30 days` | Last 30 days |
| 6M | `now() - 180 days` | Last 180 days |
| 1Y | `now() - 365 days` | Last 365 days |

**Implementation:**
- Added `TimeRange` type: `'ALL' | '1M' | '6M' | '1Y'`
- Added `getTimeRangeCutoff()` helper using UTC timestamps
- Updated `useMonthlyTrends(timeRange)` to accept filter parameter
- Updated `useStatusBreakdown(timeRange)` to accept filter parameter
- Filters applied at Supabase query level using `.gte()` on timestamp columns
- Shared state managed at dashboard page level

**Timestamp Fields Used:**
| Table | Field |
|-------|-------|
| `housing_registration` | `created_at` |
| `subsidy_case` | `created_at` |
| `allocation_decision` | `decided_at` |

**Files Modified:**
- `src/app/(admin)/dashboards/page.tsx` - Shared timeRange state
- `src/app/(admin)/dashboards/hooks/useDashboardData.ts` - TimeRange type and filter logic
- `src/app/(admin)/dashboards/components/Chart.tsx` - Interactive filter buttons
- `src/app/(admin)/dashboards/components/SaleChart.tsx` - Synced filter display (read-only)

**Restore Point:** `ADMIN_V1_1_B_DASH_TIMEFILTERS_COMPLETE`

---

## Admin v1.1-B: Dashboard Sparklines (2026-01-09)

### Sparkline Real Data Implementation

**Purpose:** Replace static placeholder sparkline series in KPI cards with real, data-derived series.

**Hook Added:** `useSparklineData(timeRange: TimeRange)`

**Returns:**
```typescript
interface SparklineData {
  registrations: number[]   // Housing registrations over time
  subsidyCases: number[]    // All subsidy cases over time
  pendingCases: number[]    // Pending cases (received + pending_documents)
  approvedCases: number[]   // Approved cases over time
}
```

### Bucketing Rules

| TimeRange | Bucket Type | Count | Description |
|-----------|-------------|-------|-------------|
| 1M | Daily | 30 | Day boundaries (00:00:00 - 23:59:59) |
| 6M | Weekly | 26 | 7-day windows from current date |
| 1Y / ALL | Monthly | 12 | Calendar month boundaries |

### Data Sources

| KPI Card | Source Table | Timestamp Field | Filter |
|----------|--------------|-----------------|--------|
| Housing Registrations | `housing_registration` | `created_at` | None |
| Subsidy Applications | `subsidy_case` | `created_at` | None |
| Pending Applications | `subsidy_case` | `created_at` | `status IN ('received', 'pending_documents')` |
| Approved Applications | `subsidy_case` | `created_at` | `status = 'approved'` |

### Zero-Fill Fallback Rule

If data fetch fails or returns empty, the hook returns zero-filled arrays of the correct length (30/26/12 based on timeRange) to prevent NaN/undefined in charts.

**Restore Point:** `ADMIN_V1_1_B_DASH_SPARKLINES_COMPLETE`

---

## Admin v1.1-B: Per-Widget TimeRange Decoupling (2026-01-09)

### State Ownership (Per-Widget)

**Issue Fixed:** TimeRange controls were globally shared, causing all widgets to update when any TimeRange button was clicked.

**Solution:** Each widget now owns its own local TimeRange state.

### Widget State Ownership

| Widget | State Variable | Location | Default | Controlled By |
|--------|----------------|----------|---------|---------------|
| Monthly Trends | `trendsRange` | `Chart.tsx` (local state) | `'1Y'` | Own buttons |
| Cases-by-Status | `statusRange` | `SaleChart.tsx` (local state) | `'1Y'` | Own buttons |
| KPI Sparklines | `SPARKLINE_TIME_RANGE` | `Cards.tsx` (constant) | `'1Y'` | None (stable) |

### Behavior

- Clicking Monthly Trends TimeRange buttons → ONLY Monthly Trends updates
- Clicking Cases-by-Status TimeRange buttons → ONLY Cases-by-Status updates
- KPI card sparklines are decoupled and do NOT change when chart buttons are clicked

### Files Modified

- `src/app/(admin)/dashboards/page.tsx` - Removed shared `timeRange` state
- `src/app/(admin)/dashboards/components/Chart.tsx` - Added local `trendsRange` state
- `src/app/(admin)/dashboards/components/SaleChart.tsx` - Added local `statusRange` state
- `src/app/(admin)/dashboards/components/Cards.tsx` - Uses fixed `'1Y'` constant for sparklines

**Restore Point:** `ADMIN_V1_1_B_DASH_TIMERANGE_DECOUPLE_COMPLETE`

---

## Admin v1.1-C: Global Search Bugfix (2026-01-13)

### SCSS Variable Error

**Issue:** Build failure due to undefined `$font-size-xs` variable in `_search-results.scss`.

**Error:**
```
[plugin:vite:css] [sass] Undefined variable.
60 |     font-size: $font-size-xs;
                    ^^^^^^^^^^^^^
src/assets/scss/components/_search-results.scss 60:14
```

**Root Cause:** The project's SCSS variables only define `$font-size-sm`, `$font-size-base`, and `$font-size-lg`. The variable `$font-size-xs` does not exist.

**Fix:** Replaced `$font-size-xs` with `$font-size-sm` at lines 60 and 103.

**File Modified:** `src/assets/scss/components/_search-results.scss`

**Verification:** App compiles successfully, global search functions correctly.

**Restore Point:** `ADMIN_V1_1_C_GLOBAL_SEARCH_BUGFIX_COMPLETE`

---

## Admin v1.1-D: Public Status Lookup — Applicant Name Fix (2026-01-14)

### Issue

The `/status` page displayed "Unknown" for applicant name despite correct database data.

### Root Cause

The `lookup-public-status` Edge Function incorrectly treated Supabase JOIN results as arrays:
- Used `personData.length > 0` check on a single object
- `.length` on an object returns `undefined`, causing fallback to "Unknown"

### Fix

Updated `supabase/functions/lookup-public-status/index.ts`:
- Line 267-268: Bouwsubsidie path — treat `person` as single object
- Line 323-324: Housing path — treat `person` as single object

**Before:**
```typescript
const personData = caseData.person as unknown as { first_name: string; last_name: string }[] | null
const person = personData && personData.length > 0 ? personData[0] : null
```

**After:**
```typescript
const person = caseData.person as unknown as { first_name: string; last_name: string } | null
```

### Verification

- Housing Registration lookup: Applicant name displays correctly
- Bouwsubsidie lookup: Applicant name displays correctly
- No console errors on `/status` page
- Edge Function returns HTTP 200

**Restore Point:** `RESTORE_POINT_v1.1-D_BACKEND_IMPACT_CHECK_COMPLETE`
