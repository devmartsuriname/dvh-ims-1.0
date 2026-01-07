# VolksHuisvesting IMS – Task Breakdown

**Status:** Active tracking document
**Purpose:** Phase-by-phase task tracking for execution
**Authority:** Delroy (final)

---

## Current Status

| Field | Value |
|-------|-------|
| Current Phase | Pre-Phase 0 (Documentation) |
| Last Restore Point | N/A |
| Last Authorization | Documentation creation authorized |

---

## Pre-Phase: Documentation (CURRENT)

### ✅ Completed Tasks
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

### ⏳ Pending Tasks
- [ ] Update README.md with IMS project context
- [ ] Authorization for Phase 0

---

## Phase 0 – Foundation & Governance

### Tasks
- [ ] Enable Lovable Cloud (Supabase)
- [ ] Configure Auth (email/password)
- [ ] Create app_user_profile table
- [ ] Create audit_event table
- [ ] Apply deny-all RLS skeleton
- [ ] Verify Darkone Admin baseline intact
- [ ] Verify build passes

### Gate Criteria
- [ ] Architecture & Security document aligned
- [ ] No build errors
- [ ] Auth functional

### Restore Point
- [ ] Create restore point after completion

---

## Phase 1 – Shared Core

### Tasks
- [ ] Create person table with RLS
- [ ] Create household table with RLS
- [ ] Create household_member table with RLS
- [ ] Create contact_point table with RLS
- [ ] Create address table with RLS
- [ ] Verify cross-module data reuse

### Gate Criteria
- [ ] All Shared Core tables created
- [ ] RLS policies applied and tested
- [ ] Data accessible from both modules

### Restore Point
- [ ] Create restore point after completion

---

## Phase 2 – Bouwsubsidie Module

### Tasks
- [ ] Create subsidy_case table
- [ ] Create subsidy_case_status_history table
- [ ] Create subsidy_document_requirement table
- [ ] Create subsidy_document_upload table
- [ ] Create social_report table
- [ ] Create technical_report table
- [ ] Create generated_document table
- [ ] Implement status machine
- [ ] Implement Raadvoorstel DOCX generation (Edge Function)
- [ ] Create Admin UI: Case list page
- [ ] Create Admin UI: Case detail page with tabs
- [ ] Apply RLS per role

### Gate Criteria
- [ ] End-to-end case flow functional
- [ ] All status transitions audited
- [ ] Raadvoorstel generates valid DOCX

### Restore Point
- [ ] Create restore point after completion

---

## Phase 3 – Housing Registration

### Tasks
- [ ] Create housing_registration table
- [ ] Create housing_registration_status_history table
- [ ] Create housing_urgency table
- [ ] Create public_status_access table
- [ ] Implement status machine
- [ ] Create Admin UI: Registration list page
- [ ] Create Admin UI: Registration detail page with tabs
- [ ] Apply RLS per role

### Gate Criteria
- [ ] Registration flow functional
- [ ] Urgency scoring auditable
- [ ] Status history complete

### Restore Point
- [ ] Create restore point after completion

---

## Phase 4 – Allocation Engine

### Tasks
- [ ] Create district_quota table
- [ ] Create allocation_run table
- [ ] Create allocation_candidate table
- [ ] Create allocation_decision table
- [ ] Create assignment_record table
- [ ] Implement allocation run logic (Edge Function)
- [ ] Create Admin UI: Quota management
- [ ] Create Admin UI: Allocation runs
- [ ] Apply RLS per role

### Gate Criteria
- [ ] Allocation respects quotas
- [ ] All decisions auditable
- [ ] Assignment records complete

### Restore Point
- [ ] Create restore point after completion

---

## Phase 5 – Public Wizards

### Tasks
- [ ] Create public landing page (Light Theme)
- [ ] Create Bouwsubsidie wizard (9 steps)
- [ ] Create Housing Registration wizard (10 steps)
- [ ] Create status tracking page
- [ ] Implement reference number generation
- [ ] Implement token-based access
- [ ] Apply rate limiting

### Gate Criteria
- [ ] Wizards complete and usable
- [ ] No internal data exposed
- [ ] Light Theme only

### Restore Point
- [ ] Create restore point after completion

---

## Phase 6 – Reporting & Audit

### Tasks
- [ ] Create report_snapshot table
- [ ] Create KPI dashboard (Bouwsubsidie)
- [ ] Create KPI dashboard (Housing)
- [ ] Create Minister dashboard
- [ ] Create audit log viewer
- [ ] Implement audit export

### Gate Criteria
- [ ] All KPIs functional
- [ ] Full audit trail accessible
- [ ] Export working

### Restore Point
- [ ] Create restore point after completion

---

## Phase 7 – Hardening & Go-Live

### Tasks
- [ ] Performance testing
- [ ] Security validation
- [ ] Final RLS review
- [ ] Production deployment checklist
- [ ] Minister approval

### Gate Criteria
- [ ] No critical issues
- [ ] All gates passed
- [ ] Production-ready

### Restore Point
- [ ] Final production snapshot

---

**End of Task Breakdown**
