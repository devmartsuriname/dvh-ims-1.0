# Backend Documentation — DVH-IMS

## Edge Functions

### Public-Facing Edge Functions

| Function | Purpose | Auth | Rate Limit |
|----------|---------|------|------------|
| `lookup-public-status` | Public status lookup for subsidy/housing cases | None (verify_jwt=false) | 20/hour per IP |
| `submit-bouwsubsidie-application` | Public bouwsubsidie application intake | None (verify_jwt=false) | 5/hour per IP |
| `submit-housing-registration` | Public housing registration intake | None (verify_jwt=false) | 5/hour per IP |

All 3 public Edge Functions use `SUPABASE_SERVICE_ROLE_KEY` to interact with the database, bypassing RLS entirely. This is intentional: citizens submit anonymously, and the Edge Function performs server-side validation (Zod), rate limiting, and secure token handling (SHA-256).

### Administrative Edge Functions

| Function | Purpose | Auth |
|----------|---------|------|
| `execute-allocation-run` | Execute housing allocation algorithm | JWT + role check |

Administrative Edge Functions enforce JWT validation and role-based allowlist checks. Security standards documented in this file serve as the mandatory baseline.

---

## Security Hardening Log

### v1.7.x — Remove Redundant Anonymous RLS Policies (2026-02-27)

**Rationale:** Since all public intake and status lookup flows use Edge Functions with `SUPABASE_SERVICE_ROLE_KEY` (which bypasses RLS), the following anonymous RLS policies were redundant and only increased attack surface:

| Dropped Policy | Table | Type |
|----------------|-------|------|
| `anon_can_select_person_for_status` | `person` | SELECT |
| `anon_can_select_subsidy_case_status` | `subsidy_case` | SELECT |
| `anon_can_select_housing_registration_status` | `housing_registration` | SELECT |
| `anon_can_select_subsidy_status_history` | `subsidy_case_status_history` | SELECT |
| `anon_can_select_housing_status_history` | `housing_registration_status_history` | SELECT |
| `anon_can_insert_audit_event` | `audit_event` | INSERT |

**Retained:** `anon_can_select_public_status_access` on `public_status_access` — design-intentional, contains no PII.

**Restore Point:** `docs/restore-points/v1.7/RESTORE_POINT_V1.7_SECURITY_HARDENING_ANON_RLS.md`

### v1.5.x — Remove Redundant Anonymous INSERT Policies (prior)

12 anonymous INSERT policies removed. All public intake handled via Edge Functions with service role key.

---

## Audit Event Table

- **Immutable:** No UPDATE or DELETE allowed.
- **Append-only:** All writes are INSERT-only.
- **Preserved during resets:** Audit events are never cleared during data resets.
- **Access:** Authenticated roles (`audit`, `system_admin`, `minister`, `project_leader`) can SELECT. Role-specific INSERT policies enforce `actor_user_id = auth.uid()`.

---

## v1.7.x — Document Requirements Sync & Smoke Test (2026-02-27)

### Shared Config Source of Truth

**File:** `src/config/documentRequirements.ts`

All document requirement definitions for both public wizards and admin case detail views are synchronized via this single shared configuration module.

### Smoke Test Results

| Test | Service | Result | Evidence |
|------|---------|--------|----------|
| A | Bouwsubsidie | **PASS** | Required Documents sidebar: 5 mandatory (✅ green + *), 2 optional (⚪ grey). Names match shared config exactly. No deprecated docs visible. |
| B | Woningregistratie | **PASS** | Required Documents sidebar: 3 mandatory (✅ green + *), 3 optional (⚪ grey). Names match shared config exactly. |
| C | Console/Layout | **PASS** | No React key warnings, no errors. Only pre-existing React Router v6 deprecation warnings. |

### Verified Document Lists

**Bouwsubsidie (7 items):**
- Copy of ID * ✅
- Inkomensverklaring (AOV/loonstrook) * ✅
- Land Title / Deed * ✅
- Bank Statement * ✅
- Household Composition * ✅
- CBB uittreksel / Nationaliteit verklaring ⚪
- Gezinuittreksel ⚪

**Woningregistratie (6 items):**
- Copy of ID * ✅
- Income Proof * ✅
- Residence Proof * ✅
- Family Composition ⚪
- Medical Certificate ⚪
- Emergency Proof ⚪

### Deprecated Documents Confirmed Absent
Construction Plan, Cost Estimate, Building Permit — NOT present in shared config, wizard, or admin views.

---

## v1.7.x — Data-Layer Audit Findings (2026-02-27)

**Audit Report:** `docs/audits/v1.7/DATA_LAYER_AUDIT_DOCS_CONFIG_SYNC.md`

### DB vs Config Label Mismatches (Housing)

3 rows in `housing_document_requirement` have different `document_name` values than the shared config:

| document_code | DB Name | Config Name |
|---------------|---------|-------------|
| INCOME_PROOF | Proof of Income | Income Proof |
| RESIDENCE_PROOF | Proof of Current Residence | Residence Proof |
| EMERGENCY_PROOF | Emergency Documentation | Emergency Proof |

**Impact:** LOW — Admin sidebar renders from shared config. Archive views render from DB join. Users may see different labels in the same session.

### Deprecated DB Rows (Bouwsubsidie)

3 deprecated entries remain in `subsidy_document_requirement`:

| document_code | DB Name | Status |
|---------------|---------|--------|
| BUILDING_PERMIT | Building Permit | Deprecated — excluded from all active UI |
| CONSTRUCTION_PLAN | Construction Plan | Deprecated — excluded from all active UI |
| COST_ESTIMATE | Cost Estimate | Deprecated — excluded from all active UI |

**Impact:** NONE — These rows are never rendered. Only visible if historical uploads reference them in archive columns.

### Recommended Follow-ups (NOT executed)

1. ~~**DB label alignment:** One-time UPDATE to align 3 housing `document_name` values with shared config.~~ → **✅ RESOLVED (Staging) — Phase 6**
2. ~~**Deprecated row cleanup:** Soft-delete or add `is_active` flag to 3 bouwsubsidie deprecated entries.~~ → **✅ RESOLVED (Staging) — Phase 7**
3. ~~**Wizard constants refactor:** Derive wizard `REQUIRED_DOCUMENTS` from shared config instead of maintaining separate arrays.~~ → **✅ RESOLVED — Phase 8**

---

## v1.7.x — Bugfix: Housing Submit Failure (2026-03-01)

### Root Cause

Edge function `submit-housing-registration` failed on two DB unique constraint violations:

1. **`person_national_id_key`** — INSERT failed when a citizen with the same `national_id` already existed (from prior attempt or Bouwsubsidie application)
2. **`housing_registration_reference_number_key`** — Reference number collision from prior partially-committed attempt

### Fix Applied

| Change | Description |
|--------|-------------|
| Person lookup-first | Query existing person by `national_id` before INSERT. Reuse if found. |
| Reference number retry | Retry loop (max 3 attempts) catches duplicate `reference_number` errors and regenerates. |
| Correlation logging | All log lines include `correlation=<UUID>` for traceability. No PII logged. |
| Audit event enrichment | `correlation_id` and `person_reused` flag added to audit metadata. |

### Transaction Safety

Compensating cleanup model: if registration INSERT fails after person/household creation, orphaned records are benign (no status, no public access token). Next retry reuses existing person via lookup-first pattern. No partial public-facing state is created.

### Files Modified

| File | Change |
|------|--------|
| `supabase/functions/submit-housing-registration/index.ts` | Person upsert + ref retry + correlation ID |

### Verification

- New national_id submission: SUCCESS
- Duplicate national_id submission: SUCCESS (reuses existing person)
- Reference number collision: handled by retry loop
- No DB schema changes, no RLS changes

**Restore Point:** `docs/restore-points/v1.7/RESTORE_POINT_V1_7_HOUSING_SUBMIT_FAIL.md`

---

## v1.7.x — Phase 8: Wizard Constants Refactor (2026-03-01)

### Change

Both public wizard `REQUIRED_DOCUMENTS` arrays refactored to derive from the shared config (`src/config/documentRequirements.ts`) instead of maintaining duplicate local arrays.

### Files Modified

| File | Change |
|------|--------|
| `src/app/(public)/bouwsubsidie/apply/constants.ts` | Local array → import from `BOUWSUBSIDIE_DOCUMENT_REQUIREMENTS` + prefix mapping |
| `src/app/(public)/housing/register/constants.ts` | Local array → import from `HOUSING_DOCUMENT_REQUIREMENTS` + explicit label map |

### Mapping Strategy

- **Bouwsubsidie:** Simple prefix convention (`bouwsubsidie.documents.` + `document_code`)
- **Housing:** Explicit `HOUSING_LABEL_MAP` (i18n keys use camelCase suffixes, not document_code)

### Verification

- Bouwsubsidie: 7 documents (5 mandatory, 2 optional) — unchanged
- Housing: 6 documents (3 mandatory, 3 optional) — unchanged
- No DB changes, no schema changes, no RLS changes

---

## v1.7.x — Phase 7: Deprecated Subsidy Docs Cleanup (2026-02-28)

### Schema Change

Added `is_active BOOLEAN NOT NULL DEFAULT true` to `subsidy_document_requirement`. Non-breaking additive change.

### Data Update

3 deprecated document requirements soft-deprecated (`is_active = false`):

| document_code | document_name | Status |
|---------------|---------------|--------|
| BUILDING_PERMIT | Building Permit | `is_active = false` |
| CONSTRUCTION_PLAN | Construction Plan | `is_active = false` |
| COST_ESTIMATE | Cost Estimate | `is_active = false` |

**Reason:** FK constraint (`subsidy_document_upload.requirement_id`) blocked hard DELETE. 9 historical uploads reference these rows.

**Migration:** `docs/migrations/v1.7/STAGING_DEPRECATED_SUBSIDY_DOCS_CLEANUP.sql`  
**Rollback:** `docs/migrations/v1.7/STAGING_DEPRECATED_SUBSIDY_DOCS_CLEANUP_ROLLBACK.sql`  
**Environment:** Staging ONLY. Production promotion requires separate approval.
