# DVH-IMS Changelog

---

## V1.8.0 — Phase 7: Security Hardening

**Date:** 2026-03-07

### Changed (Database — RLS)
- **Migration A:** Dropped `anon_can_select_public_status_access` on `public_status_access` (HIGH severity)
- **Migration B:** Replaced `Users can update own profile` on `app_user_profile` — added `WITH CHECK` to prevent `district_code` and `is_active` self-modification (MEDIUM severity)
- **Migration C:** Created `role_insert_housing_document_upload` INSERT policy on `housing_document_upload` (MEDIUM severity)

### Changed (Platform)
- Leaked Password Protection enabled (Supabase Pro tier, Dashboard setting)

### Verified
- Zero `anon_` policies remaining on application tables
- `lookup-public-status` Edge Function confirmed functional (uses service role, unaffected by policy removal)
- PageSpeed: Homepage Desktop 99 / Mobile 83, Wizard Desktop 91 / Mobile 85

### Restore Point
- `RESTORE_POINT_V1.8_PHASE_7_SECURITY_HARDENING`

---

## V1.7.x — Phase 6: PageSpeed & Verification

**Date:** 2026-03-01 – 2026-03-07

### Verified
- PageSpeed scores within acceptable production ranges
- Admin dashboards and document flows manually verified
- All KPI dashboards functional

---

## V1.7.x — Phase 5: Accessibility & Polish

**Date:** 2026-03-01

### Changed
- Wizard constants refactored to derive from shared config (`src/config/documentRequirements.ts`)
- Applicant list avatar initials fallback (deterministic color, no static avatar images)

---

## V1.7.x — Phase 4: Structure Cleanup

**Date:** 2026-02-28

### Changed
- Added `is_active` column to `subsidy_document_requirement` (non-breaking)
- Soft-deprecated 3 unused document requirements (BUILDING_PERMIT, CONSTRUCTION_PLAN, COST_ESTIMATE)
- Housing DB label alignment (staging)

---

## V1.7.x — Phase 3: Dead Code & Redundant Policy Removal

**Date:** 2026-02-27

### Removed (Database — RLS)
- 6 redundant anonymous RLS policies:
  - `anon_can_select_person_for_status` (person)
  - `anon_can_select_subsidy_case_status` (subsidy_case)
  - `anon_can_select_housing_registration_status` (housing_registration)
  - `anon_can_select_subsidy_status_history` (subsidy_case_status_history)
  - `anon_can_select_housing_status_history` (housing_registration_status_history)
  - `anon_can_insert_audit_event` (audit_event)

### Rationale
All public flows use Edge Functions with `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS. These policies were pure attack surface.

---

## V1.7.x — Critical Bugfix: Housing Registration Regex

**Date:** 2026-03-01

### Fixed
- Double-escaped backslashes in `submit-housing-registration` Edge Function caused 100% validation failure on email and date_of_birth fields
- Corrected regex escaping to match working `submit-bouwsubsidie-application` pattern

---

## V1.7.x — Bugfix: Housing Submit Failure

**Date:** 2026-03-01

### Fixed
- Person lookup-first pattern: reuses existing person by `national_id` instead of failing on unique constraint
- Reference number retry loop (max 3 attempts) for collision handling
- Correlation ID logging added to all log lines

---

## V1.7.0 — WizardProgress Active Step Underline Fix

**Date:** 2026-02-27

### Changed
- `src/components/public/WizardProgress.tsx`: Replaced phase-level underline coloring with step-level logic. Only completed and current steps show `bg-primary` underline.

### Impact
- Applies to both Bouwsubsidie (9 steps) and Woningregistratie (11 steps) via the shared `WizardProgress` component.

---

## V1.7.x — DocumentUploadAccordion Visibility (Won't Fix)

**Date:** 2026-02-27
**Decision:** Editor-only rendering artifact — No production fix required.

---

**End of Changelog**
