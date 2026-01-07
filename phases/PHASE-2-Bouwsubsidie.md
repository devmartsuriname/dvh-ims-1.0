# Phase 2 — Bouwsubsidie Module

**Project:** VolksHuisvesting IMS (DVH-IMS-1.0)  
**Status:** Documentation Only  
**Authority:** Delroy (Final)

---

## A. Phase Objective

Implement the complete Bouwsubsidie (Housing Construction Subsidy) case management module:
- Full case lifecycle from intake to decision
- Document requirement tracking
- Social and technical field reports
- Status-based workflow with audit trail
- Raadvoorstel (Council Proposal) DOCX generation
- Ministerial approval workflow

---

## B. Explicit Scope (ALLOWED)

| Category | Allowed Actions |
|----------|-----------------|
| Database | Create `subsidy_case` table |
| Database | Create `subsidy_case_status_history` table |
| Database | Create `subsidy_document_requirement` table |
| Database | Create `subsidy_document_upload` table |
| Database | Create `social_report` table |
| Database | Create `technical_report` table |
| Database | Create `generated_document` table |
| Database | Create RLS policies for all Bouwsubsidie tables |
| Database | Create status transition validation |
| UI | Create Case List page (Admin) |
| UI | Create Case Detail page with tabs |
| UI | Create Document management UI |
| UI | Create Social Report submission UI |
| UI | Create Technical Report submission UI |
| UI | Create Raadvoorstel generation UI |
| Integration | Create `generate-raadvoorstel` Edge Function |
| Integration | Create `case-documents` Storage bucket |
| Integration | Create `generated-documents` Storage bucket |

---

## C. Explicit Out of Scope (FORBIDDEN)

| Category | Forbidden Actions |
|----------|-------------------|
| Modules | Housing Registration tables or logic |
| Modules | Allocation tables or logic |
| Shared Core | Modifications to Person/Household tables |
| UI | Public-facing pages (deferred to Phase 5) |
| UI | Wizard components (deferred to Phase 5) |
| UI | Layout modifications |
| UI | SCSS changes |

---

## D. Database Impact (DOCUMENTATION ONLY)

### Tables to Create

#### `subsidy_case`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| reference_number | text | NO | - | BS-YYYY-NNNN format |
| household_id | uuid | NO | - | FK to household |
| applicant_person_id | uuid | NO | - | FK to person |
| district_code | text | NO | - | District identifier |
| current_status | text | NO | 'received' | Current status |
| intake_date | timestamptz | NO | now() | Date received |
| assigned_frontdesk_id | uuid | YES | - | Assigned officer |
| assigned_social_worker_id | uuid | YES | - | Assigned social worker |
| assigned_inspector_id | uuid | YES | - | Assigned inspector |
| created_at | timestamptz | NO | now() | Creation timestamp |
| updated_at | timestamptz | NO | now() | Last update |

#### `subsidy_case_status_history`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| case_id | uuid | NO | - | FK to subsidy_case |
| from_status | text | YES | - | Previous status |
| to_status | text | NO | - | New status |
| changed_by | uuid | NO | - | Actor user ID |
| reason | text | YES | - | Reason for change |
| changed_at | timestamptz | NO | now() | Timestamp |

#### `subsidy_document_requirement`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| case_id | uuid | NO | - | FK to subsidy_case |
| document_type | text | NO | - | Type of document |
| is_required | boolean | NO | true | Required flag |
| is_received | boolean | NO | false | Received flag |
| received_at | timestamptz | YES | - | When received |
| verified_by | uuid | YES | - | Verifier user ID |

#### `subsidy_document_upload`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| requirement_id | uuid | NO | - | FK to requirement |
| storage_path | text | NO | - | Path in storage |
| original_filename | text | NO | - | Original name |
| file_size | integer | NO | - | Size in bytes |
| mime_type | text | NO | - | MIME type |
| uploaded_by | uuid | NO | - | Uploader user ID |
| uploaded_at | timestamptz | NO | now() | Upload timestamp |

#### `social_report`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| case_id | uuid | NO | - | FK to subsidy_case |
| field_worker_id | uuid | NO | - | FK to user |
| visit_date | date | NO | - | Date of visit |
| household_assessment | jsonb | NO | - | Assessment data |
| recommendation | text | NO | - | Recommendation |
| is_final | boolean | NO | false | Finalized flag |
| submitted_at | timestamptz | YES | - | Submission time |
| created_at | timestamptz | NO | now() | Creation timestamp |

#### `technical_report`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| case_id | uuid | NO | - | FK to subsidy_case |
| inspector_id | uuid | NO | - | FK to user |
| inspection_date | date | NO | - | Date of inspection |
| construction_assessment | jsonb | NO | - | Assessment data |
| estimated_cost | numeric | YES | - | Cost estimate |
| recommendation | text | NO | - | Recommendation |
| is_final | boolean | NO | false | Finalized flag |
| submitted_at | timestamptz | YES | - | Submission time |
| created_at | timestamptz | NO | now() | Creation timestamp |

#### `generated_document`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| case_id | uuid | NO | - | FK to subsidy_case |
| document_type | text | NO | - | raadvoorstel/other |
| storage_path | text | NO | - | Path in storage |
| version | integer | NO | 1 | Version number |
| is_concept | boolean | NO | true | Concept flag |
| generated_by | uuid | NO | - | Generator user ID |
| generated_at | timestamptz | NO | now() | Generation time |
| approved_by | uuid | YES | - | Approver (Minister) |
| approved_at | timestamptz | YES | - | Approval time |

### Status Model

```
received → screening → needs_more_docs → fieldwork → 
approved_for_council → council_doc_generated → finalized
                                            → rejected
```

### RLS Policy Matrix

| Table | Policy | Operation | Expression |
|-------|--------|-----------|------------|
| subsidy_case | District users can read | SELECT | District match or national |
| subsidy_case | Frontdesk can create | INSERT | Role = frontdesk |
| subsidy_case | Authorized can update | UPDATE | Role-based |
| social_report | Assigned worker can edit | UPDATE | field_worker_id match |
| social_report | Final reports immutable | UPDATE | is_final = false |
| technical_report | Assigned inspector can edit | UPDATE | inspector_id match |
| technical_report | Final reports immutable | UPDATE | is_final = false |
| generated_document | Project Leader can generate | INSERT | Role check |

---

## E. UI Impact (DOCUMENTATION ONLY)

### Admin Pages (Darkone 1:1)

| Page | Route | Description |
|------|-------|-------------|
| Case List | `/subsidy-cases` | Filterable case list |
| Case Detail | `/subsidy-cases/:id` | Tabbed detail view |

### Case Detail Tabs

| Tab | Content |
|-----|---------|
| Overview | Case summary, applicant, status |
| Documents | Requirement checklist, uploads |
| Social Report | Social assessment form/view |
| Technical Report | Technical assessment form/view |
| History | Status transition timeline |
| Raadvoorstel | Generate/view council proposal |

### Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| CaseList | `src/app/admin/bouwsubsidie/cases/` | Case listing |
| CaseDetail | `src/app/admin/bouwsubsidie/cases/[id]/` | Case detail |
| DocumentChecklist | `src/components/bouwsubsidie/` | Document tracking |
| SocialReportForm | `src/components/bouwsubsidie/` | Social report |
| TechnicalReportForm | `src/components/bouwsubsidie/` | Technical report |
| StatusTimeline | `src/components/bouwsubsidie/` | History display |
| RaadvoorstelGenerator | `src/components/bouwsubsidie/` | DOCX generation |

### Public UI

**NO PUBLIC UI IN PHASE 2** (deferred to Phase 5)

---

## F. Security & RLS Considerations

### Role-Based Access

| Role | Case Access | Report Access | Raadvoorstel |
|------|-------------|---------------|--------------|
| Minister | Read all | Read all | Approve |
| Project Leader | Full access | Read all | Generate |
| Frontdesk | District CRUD | Read only | None |
| Admin Staff | District CRUD | Read only | None |
| Social Worker | District read | Own reports | None |
| Inspector | District read | Own reports | None |
| Audit | Read all | Read all | Read |

### Report Immutability

- Social and Technical reports become immutable after `is_final = true`
- RLS policies enforce this constraint
- Audit events log all report submissions

### Document Security

- Storage buckets use RLS policies
- Files accessible only via case access
- No public URLs for documents

---

## G. Verification Criteria

### Database Verification

- [ ] All 7 Bouwsubsidie tables created
- [ ] RLS enabled on all tables
- [ ] FORCE RLS applied on all tables
- [ ] Status transition validation works
- [ ] Report immutability enforced

### UI Verification

- [ ] Case list displays and filters
- [ ] Case detail tabs work
- [ ] Document upload/tracking works
- [ ] Social report form works
- [ ] Technical report form works
- [ ] Status timeline displays correctly
- [ ] Raadvoorstel generation works
- [ ] Darkone 1:1 compliance verified

### Integration Verification

- [ ] Edge Function deploys successfully
- [ ] DOCX generation produces valid output
- [ ] Storage buckets accessible via RLS
- [ ] File uploads work correctly

### End-to-End Verification

- [ ] Complete case flow: received → finalized
- [ ] All status transitions logged
- [ ] Audit events created for all actions

---

## H. Restore Point (Documentation Snapshot — no execution)

**IMPORTANT:** This phase does not authorize execution. This document is for planning and governance purposes only. Execution requires explicit written authorization from Delroy.

### Restore Point Name
`phase-2-complete`

### Restore Point Contents
- All Phase 2 database migrations applied
- All Phase 2 UI components created
- Edge Function deployed
- Storage buckets configured
- Verification checklist completed

### Rollback Procedure
If Phase 2 fails verification:
1. Revert to `phase-1-complete`
2. Drop Phase 2 tables
3. Delete Edge Function
4. Delete Storage buckets
5. Report failure details
6. Await remediation instructions

---

## I. Hard Stop Statement

**MANDATORY HARD STOP AFTER PHASE 2 COMPLETION**

Upon completing Phase 2:
1. Execute all verification criteria
2. Submit completion report in standard format
3. **STOP** — Do not proceed to Phase 3
4. Await explicit written authorization from Delroy

**NO AUTO-PROCEED TO PHASE 3**

---

---

## J. Route Configuration Addendum (Phase 2 Completion)

**Framework:** Vite + React SPA (Option A confirmed)

### Route Registration

| File | Purpose |
|------|---------|
| `src/routes/index.tsx` | Route array definitions |
| `src/assets/data/menu-items.ts` | Sidebar menu configuration |

### Bouwsubsidie Routes

| Route | Component | File |
|-------|-----------|------|
| `/subsidy-cases` | `SubsidyCaseList` | `src/app/(admin)/subsidy-cases/page.tsx` |
| `/subsidy-cases/:id` | `SubsidyCaseDetail` | `src/app/(admin)/subsidy-cases/[id]/page.tsx` |

### Menu Configuration

| Key | Label | Icon | URL |
|-----|-------|------|-----|
| `subsidy-cases` | Subsidy Cases | `mingcute:file-check-line` | `/subsidy-cases` |

### Deferred to Phase 5

- Public/Wizard routing
- Public-facing pages
- Wizard components

---

**End of Phase 2 Documentation**
