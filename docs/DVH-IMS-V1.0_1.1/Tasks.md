# VolksHuisvesting IMS – Task Breakdown

**Status:** Active tracking document
**Version:** v1.8
**Last Updated:** 2026-03-07
**Authority:** Delroy (final)

---

## Current Status

| Field | Value |
|-------|-------|
| Current Phase | Phase 7 (Security Hardening) — COMPLETE |
| Version | v1.8 |
| Last Restore Point | `RESTORE_POINT_V1.8_PHASE_7_SECURITY_HARDENING` |
| Next Phase | Phase 8 (awaiting authorization) — see Execution_Plan.md |

---

## Phase 0 – Foundation & Governance ✅ COMPLETE

- [x] Initialize repositories
- [x] Apply Darkone Admin baseline
- [x] Configure Supabase project (Lovable Cloud)
- [x] Configure Auth (email/password)
- [x] Create `app_user_profile` table
- [x] Create `audit_event` table
- [x] Apply deny-all RLS skeleton
- [x] Verify Darkone Admin baseline intact
- [x] Verify build passes

**Restore Point:** Phase 0 complete

---

## Phase 1 – Shared Core ✅ COMPLETE

- [x] Create `person` table with RLS
- [x] Create `household` table with RLS
- [x] Create `household_member` table with RLS
- [x] Create `contact_point` table with RLS
- [x] Create `address` table with RLS
- [x] Verify cross-module data reuse

**Restore Point:** Phase 1 complete

---

## Phase 2 – Bouwsubsidie Module ✅ COMPLETE

- [x] Create `subsidy_case` table
- [x] Create `subsidy_case_status_history` table
- [x] Create `subsidy_document_requirement` table
- [x] Create `subsidy_document_upload` table
- [x] Create `social_report` table
- [x] Create `technical_report` table
- [x] Create `generated_document` table
- [x] Implement status machine
- [x] Create Admin UI: Case list page
- [x] Create Admin UI: Case detail page with tabs
- [x] Apply RLS per role

**Restore Point:** Phase 2 complete

---

## Phase 3 – Housing Registration ✅ COMPLETE

- [x] Create `housing_registration` table
- [x] Create `housing_registration_status_history` table
- [x] Create `housing_urgency` table
- [x] Create `housing_document_requirement` table
- [x] Create `housing_document_upload` table
- [x] Implement status machine
- [x] Create Admin UI: Registration list page
- [x] Create Admin UI: Registration detail page with tabs
- [x] Apply RLS per role

**Restore Point:** Phase 3 complete

---

## Phase 4 – Allocation Engine ✅ COMPLETE

- [x] Create `district_quota` table
- [x] Create `allocation_run` table
- [x] Create `allocation_candidate` table
- [x] Create `allocation_decision` table
- [x] Create `assignment_record` table
- [x] Implement allocation run logic (Edge Function: `execute-allocation-run`)
- [x] Create Admin UI: Quota management
- [x] Create Admin UI: Allocation runs
- [x] Apply RLS per role

**Restore Point:** Phase 4 complete

---

## Phase 5 – Public Wizards ✅ COMPLETE

- [x] Create public landing page (Light Theme)
- [x] Create Bouwsubsidie wizard (9 steps)
- [x] Create Housing Registration wizard (11 steps)
- [x] Create status tracking page
- [x] Implement reference number generation
- [x] Implement token-based access (SHA-256 hashing)
- [x] Deploy Edge Functions: `submit-bouwsubsidie-application`, `submit-housing-registration`, `lookup-public-status`
- [x] Apply rate limiting (5/hour per IP for submissions, 20/hour for status lookup)

**Restore Point:** Phase 5 complete

---

## Phase 6 – Reporting & Audit ✅ COMPLETE

- [x] Create KPI dashboard (Bouwsubsidie)
- [x] Create KPI dashboard (Housing)
- [x] Create Minister dashboard
- [x] Create audit log viewer (`/audit-log`)
- [x] Implement audit export (CSV)
- [x] Time range filtering (ALL/1M/6M/1Y)

**Restore Point:** Phase 6 complete

---

## Phase 7 – Security Hardening ✅ COMPLETE (v1.8)

- [x] Drop `anon_can_select_public_status_access` on `public_status_access` (HIGH)
- [x] Restrict `app_user_profile` self-update — prevent `district_code` and `is_active` modification (MEDIUM)
- [x] Add `role_insert_housing_document_upload` INSERT policy (MEDIUM)
- [x] Enable Leaked Password Protection (Supabase Pro tier, Dashboard setting)
- [x] Full RLS audit — no remaining `anon_` policies on application tables
- [x] Edge Function verification (`lookup-public-status` confirmed functional)
- [x] PageSpeed verification (Desktop 99/91, Mobile 83/85)

**Restore Point:** `RESTORE_POINT_V1.8_PHASE_7_SECURITY_HARDENING`

---

## Extended Phases (Per Execution_Plan.md)

| Phase | Name | Status |
|-------|------|--------|
| 8 | Security & Audit Readiness | COMPLETE |
| 9 | Public Wizard DB Integration | PENDING |
| 10 | Raadvoorstel DOCX Generation | PENDING |
| 11 | RBAC & District Access | PENDING |
| 12 | Final Hardening & Go-Live | PENDING |

---

## Pre-Phase: Documentation ✅ COMPLETE

- [x] Repository diagnosis completed
- [x] Documentation alignment matrix created
- [x] Consolidated Planning Report delivered
- [x] Execution Plan After Documentation delivered
- [x] Create `/docs/` folder
- [x] Create Master_PRD.md
- [x] Create Architecture_Security.md
- [x] Create Database_RLS.md
- [x] Create UX_Public_Wizard_Design_Uniformity.md
- [x] Create UX_Admin_Flows.md
- [x] Create Raadvoorstel_Template.md
- [x] Create Program_Planning_Phase_Gates.md
- [x] Create Execution_Plan.md
- [x] Create Tasks.md
- [x] Create Backend.md
- [x] Update README.md with IMS project context

---

**End of Task Breakdown**
