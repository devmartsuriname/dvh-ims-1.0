# VolksHuisvesting IMS – Database & RLS Specification (Government Grade, EN)

**Status:** Definitive EN Version
**Alignment:** 1:1 derived from approved NL Database & RLS Specification
**Deadline:** 30 January 2026
**Security Posture:** Audit-first, least-privilege, RLS mandatory

---

## 1. Core Principles (Non-Negotiable)
1. Strict module separation between Bouwsubsidie and Housing Registration & Allocation.
2. Shared Core limited to Person / Household only.
3. Row Level Security (RLS) enforced on **all** tables.
4. No status or decision changes without:
   - status_history entry
   - audit_event entry
5. District-based scoping for operational roles.

---

## 2. Logical ERD Overview

### 2.1 Shared Core
- household 1—* household_member *—1 person
- person 1—* contact_point
- household 1—* address

### 2.2 Module A – Bouwsubsidie
- subsidy_case *—1 household
- subsidy_case 1—* subsidy_case_status_history
- subsidy_case 1—* subsidy_document_requirement
- subsidy_case 1—* subsidy_document_upload
- subsidy_case 1—0..1 social_report
- subsidy_case 1—0..1 technical_report
- subsidy_case 1—* generated_document

### 2.3 Module B – Housing Registration & Allocation
- housing_registration *—1 household
- housing_registration 1—* housing_registration_status_history
- housing_registration 1—0..1 housing_urgency
- allocation_run 1—* allocation_candidate
- allocation_run 1—* allocation_decision
- allocation_decision 1—1 assignment_record

### 2.4 Governance & Audit
- app_user_profile *—1 auth.users
- audit_event (append-only)
- report_snapshot

---

## 3. Table Specifications (Minimum Fields)

> PK = Primary Key, FK = Foreign Key, IDX = Index, UQ = Unique

### 3.1 Shared Core Tables

#### person
- id (PK, uuid)
- national_id (text, UQ, nullable)
- first_name (text)
- last_name (text)
- gender (text, nullable)
- date_of_birth (date, nullable)
- nationality (text, nullable)
- created_at (timestamptz)
- created_by (uuid, FK auth.users)

#### household
- id (PK, uuid)
- primary_person_id (uuid, FK person)
- household_size (int, nullable)
- district_code (text, IDX)
- ressort_code (text, nullable)
- created_at (timestamptz)
- created_by (uuid, FK auth.users)

#### household_member
- id (PK, uuid)
- household_id (uuid, FK household, IDX)
- person_id (uuid, FK person, IDX)
- relationship (text)
- is_primary (boolean)
- created_at (timestamptz)

#### contact_point
- id (PK, uuid)
- person_id (uuid, FK person, IDX)
- type (text)
- value (text)
- is_primary (boolean)
- created_at (timestamptz)

#### address
- id (PK, uuid)
- household_id (uuid, FK household, IDX)
- address_line (text)
- district_code (text, IDX)
- ressort_code (text, nullable)
- since_date (date, nullable)
- created_at (timestamptz)

---

### 3.2 Authorization & Roles

#### app_user_profile
- user_id (PK, uuid, FK auth.users)
- full_name (text)
- role (text, IDX)
- district_code (text, nullable, IDX)
- is_active (boolean)
- created_at (timestamptz)

---

### 3.3 Module A – Bouwsubsidie

#### subsidy_case
- id (PK, uuid)
- case_number (text, UQ, IDX)
- household_id (uuid, FK household, IDX)
- intake_channel (text)
- current_status (text, IDX)
- requested_amount_srd (numeric, nullable)
- budget_year (int, nullable)
- notes_internal (text, nullable)
- created_at (timestamptz)
- created_by (uuid, FK auth.users)
- last_updated_at (timestamptz)

#### subsidy_case_status_history
- id (PK, uuid)
- subsidy_case_id (uuid, FK subsidy_case, IDX)
- from_status (text, nullable)
- to_status (text)
- changed_by (uuid, FK auth.users)
- changed_at (timestamptz)
- reason (text, nullable)

#### subsidy_document_requirement
- id (PK, uuid)
- subsidy_case_id (uuid, FK subsidy_case, IDX)
- document_code (text)
- is_required (boolean)
- is_received (boolean)
- received_at (timestamptz, nullable)
- verified_by (uuid, FK auth.users, nullable)

#### subsidy_document_upload
- id (PK, uuid)
- subsidy_case_id (uuid, FK subsidy_case, IDX)
- document_code (text)
- storage_path (text)
- uploaded_by (uuid, FK auth.users, nullable)
- uploaded_at (timestamptz)

#### social_report
- id (PK, uuid)
- subsidy_case_id (uuid, FK subsidy_case, UQ)
- assessor_user_id (uuid, FK auth.users)
- vulnerability_summary (text)
- urgency_level (text, nullable)
- visit_date (date, nullable)
- created_at (timestamptz)

#### technical_report
- id (PK, uuid)
- subsidy_case_id (uuid, FK subsidy_case, UQ)
- inspector_user_id (uuid, FK auth.users)
- housing_condition (text)
- estimated_cost_srd (numeric, nullable)
- visit_date (date, nullable)
- created_at (timestamptz)

---

### 3.4 Module B – Housing Registration & Allocation

#### housing_registration
- id (PK, uuid)
- registration_number (text, UQ, IDX)
- household_id (uuid, FK household, IDX)
- current_status (text, IDX)
- preferred_district_code (text, IDX)
- preferred_ressort_code (text, nullable)
- housing_interest (text)
- reason_code (text, nullable)
- created_at (timestamptz)
- created_by (uuid, FK auth.users)
- last_updated_at (timestamptz)

#### housing_registration_status_history
- id (PK, uuid)
- housing_registration_id (uuid, FK housing_registration, IDX)
- from_status (text, nullable)
- to_status (text)
- changed_by (uuid, FK auth.users)
- changed_at (timestamptz)
- reason (text, nullable)

#### housing_urgency
- id (PK, uuid)
- housing_registration_id (uuid, FK housing_registration, UQ)
- urgency_score (int, IDX)
- urgency_band (text, nullable)
- scoring_notes (text, nullable)
- assessed_by (uuid, FK auth.users)
- assessed_at (timestamptz)

#### district_quota
- id (PK, uuid)
- period_start (date, IDX)
- period_end (date, IDX)
- district_code (text, IDX)
- quota_count (int)
- created_by (uuid, FK auth.users)
- created_at (timestamptz)

#### allocation_run
- id (PK, uuid)
- period_start (date)
- period_end (date)
- run_scope_district_code (text, nullable)
- parameters_json (jsonb)
- executed_by (uuid, FK auth.users)
- executed_at (timestamptz)
- status (text)

#### allocation_candidate
- id (PK, uuid)
- allocation_run_id (uuid, FK allocation_run, IDX)
- housing_registration_id (uuid, FK housing_registration, IDX)
- district_code (text, IDX)
- urgency_score (int)
- rank_in_district (int, nullable)

#### allocation_decision
- id (PK, uuid)
- allocation_run_id (uuid, FK allocation_run, IDX)
- housing_registration_id (uuid, FK housing_registration, IDX)
- district_code (text, IDX)
- decision_status (text)
- decided_by (uuid, FK auth.users, nullable)
- decided_at (timestamptz, nullable)
- decision_reason (text, nullable)

#### assignment_record
- id (PK, uuid)
- allocation_decision_id (uuid, FK allocation_decision, UQ)
- external_inventory_ref (text)
- assigned_date (date)
- notes (text, nullable)
- created_at (timestamptz)

---

### 3.5 Public Status Tracking

#### public_status_access
- id (PK, uuid)
- reference_type (text)
- reference_id (uuid)
- public_reference_number (text)
- access_token_hash (text, UQ)
- issued_at (timestamptz)
- revoked_at (timestamptz, nullable)

---

### 3.6 Audit & Reporting

#### audit_event (append-only)
- id (PK, uuid)
- actor_user_id (uuid, FK auth.users, nullable)
- actor_role (text, nullable)
- action (text, IDX)
- entity_type (text, IDX)
- entity_id (uuid, IDX)
- occurred_at (timestamptz, IDX)
- reason (text, nullable)
- metadata_json (jsonb, nullable)

#### report_snapshot
- id (PK, uuid)
- report_key (text, IDX)
- period_start (date)
- period_end (date)
- district_code (text, nullable)
- metrics_json (jsonb)
- generated_at (timestamptz)
- generated_by (uuid, FK auth.users, nullable)

---

## 4. Status Models (v1.0)

### 4.1 Bouwsubsidie
- received
- screening
- needs_more_docs
- fieldwork
- approved_for_council
- council_doc_generated
- finalized
- rejected

### 4.2 Housing Registration
- received
- under_review
- urgency_assessed
- waiting_list
- matched
- allocated
- finalized
- rejected

---

## 5. RLS Policy Matrix (Summary)

### 5.1 General Rules
- All access requires `app_user_profile.is_active = true`
- District-bound roles are filtered by district_code

### 5.2 Role Scope Overview
- Minister: read-all, approval actions
- Project Leader: national read/write, allocation execution
- Frontdesk: create intake, limited read
- Administrative Staff: screening and urgency (district)
- Field Workers: write own reports only
- Audit: read-only

---

## 6. Mandatory Audit Events
- create_case / create_registration
- status_change
- document_upload
- urgency_assessed
- quota_set
- allocation_run_executed
- allocation_decision_approved
- council_doc_generated
- council_doc_approved

---

## 7. Open Items (No Implementation Without Approval)
- Urgency scoring rubric
- Quota period granularity
- DOCX vs PDF dual-output timing

---

**End of Database & RLS Specification (EN)**
