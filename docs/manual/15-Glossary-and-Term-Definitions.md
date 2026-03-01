# DVH-IMS — Glossary and Term Definitions

**Document:** 15 — Glossary and Term Definitions
**Version:** V1.7
**Classification:** Official — For Ministerial Review
**Date:** March 2026

---

## 1. System Terms

| Term | Definition |
|------|-----------|
| **DVH-IMS** | Directoraat Volkshuisvesting — Information Management System. The digital platform for managing public housing services. |
| **Bouwsubsidie** | Construction Subsidy. Financial support program for citizens needing assistance with housing construction or improvement. |
| **Woningregistratie** | Housing Registration. The process by which citizens register their housing need for public housing allocation. |
| **Allocatie** | Allocation. The process of matching registered housing applicants with available housing units. |
| **Raadvoorstel** | Council Document. The official government document generated after a subsidy application receives full ministerial approval. |
| **Paraaf** | Formal endorsement/signature. Used specifically for the Ministerial Advisor's formal recommendation on a subsidy case. |
| **Dossier** | The complete case file for a subsidy application or housing registration, including all documents, reports, and decisions. |
| **Edge Function** | Server-side function that processes citizen submissions and other backend operations securely. |
| **RLS** | Row-Level Security. Database-level access control that restricts which data rows a user can see and modify. |

---

## 2. Status Values — Bouwsubsidie

| Status | Description |
|--------|------------|
| `SUBMITTED` | Application received from citizen; awaiting frontdesk review |
| `IN_REVIEW` | Frontdesk has started processing the application |
| `SOCIAL_REVIEW` | Social field worker assessment in progress |
| `TECHNICAL_REVIEW` | Technical inspector review in progress |
| `ADMIN_REVIEW` | Administrative completeness review by admin staff |
| `POLICY_REVIEW` | Policy compliance review by project leader |
| `DIRECTOR_REVIEW` | Awaiting organizational approval by director |
| `DIRECTOR_APPROVED` | Director has approved; advancing to advisory review |
| `DIRECTOR_RETURNED` | Director has returned the dossier for rework |
| `ADVISOR_REVIEW` | Awaiting ministerial advisor recommendation |
| `ADVISOR_REVIEWED` | Advisor has provided recommendation; advancing to minister |
| `ADVISOR_RETURNED` | Advisor has returned the dossier for rework |
| `MINISTER_DECISION` | Awaiting final ministerial decision |
| `MINISTER_APPROVED` | Minister has approved the application |
| `MINISTER_RETURNED` | Minister has returned the dossier for rework |
| `CLOSED_APPROVED` | Terminal status: fully approved, Raadvoorstel generated |
| `REJECTED` | Terminal status: application rejected at any step |

---

## 3. Status Values — Housing Registration

| Status | Description |
|--------|------------|
| `SUBMITTED` | Registration received from citizen; awaiting review |
| `IN_REVIEW` | Frontdesk is reviewing the registration |
| `APPROVED` | Registration approved; entering waiting list |
| `REJECTED` | Terminal status: registration rejected |
| `WAITLISTED` | Active on the waiting list for housing allocation |
| `ALLOCATED` | Housing unit allocated via the allocation engine |
| `ASSIGNED` | Terminal status: housing assignment registered |

---

## 4. User Roles

| Role | Description | Scope |
|------|------------|-------|
| `system_admin` | Full system access; user and role management | National |
| `project_leader` | Policy review; case assignments; operational oversight | National |
| `minister` | Final decision authority for subsidy applications | National |
| `director` | Organizational approval for subsidy applications | National |
| `ministerial_advisor` | Advisory review and formal recommendation (paraaf) | National |
| `audit` | Read-only compliance and audit verification | National |
| `frontdesk_bouwsubsidie` | Intake processing for subsidy applications | District |
| `frontdesk_housing` | Intake processing for housing registrations | District |
| `admin_staff` | Administrative review for subsidy cases | District |
| `social_field_worker` | Social assessment visits and report submission | District |
| `technical_inspector` | Technical inspection visits and report submission | District |

---

## 5. Document Types — Bouwsubsidie

| Code | Name | Mandatory |
|------|------|:---------:|
| `ID_COPY` | Copy of ID | ✅ |
| `INCOME_DECLARATION` | Inkomensverklaring (AOV/loonstrook) | ✅ |
| `LAND_TITLE` | Land Title / Deed | ✅ |
| `BANK_STATEMENT` | Bank Statement | ✅ |
| `HOUSEHOLD_COMPOSITION` | Household Composition | ✅ |
| `CBB_EXTRACT` | CBB uittreksel / Nationaliteit verklaring | ❌ |
| `FAMILY_EXTRACT` | Gezinuittreksel | ❌ |

Deprecated (inactive):
| Code | Name |
|------|------|
| `BUILDING_PERMIT` | Building Permit |
| `CONSTRUCTION_PLAN` | Construction Plan |
| `COST_ESTIMATE` | Cost Estimate |

---

## 6. Document Types — Housing Registration

| Code | Name | Mandatory |
|------|------|:---------:|
| `ID_COPY` | Copy of ID | ✅ |
| `INCOME_PROOF` | Income Proof | ✅ |
| `RESIDENCE_PROOF` | Residence Proof | ✅ |
| `FAMILY_COMPOSITION` | Family Composition | ❌ |
| `MEDICAL_CERTIFICATE` | Medical Certificate | ❌ |
| `EMERGENCY_PROOF` | Emergency Proof | ❌ |

---

## 7. Audit Event Actions

| Action | Description |
|--------|------------|
| `CREATE` | New record created |
| `UPDATE` | Existing record modified |
| `STATUS_CHANGE` | Status transition on case/registration |
| `DOCUMENT_VERIFIED` | Staff verified an uploaded document |
| `SOCIAL_ASSESSMENT_STARTED` | Social review report begun |
| `SOCIAL_ASSESSMENT_COMPLETED` | Social review report finalized |
| `TECHNICAL_INSPECTION_STARTED` | Technical review report begun |
| `TECHNICAL_INSPECTION_COMPLETED` | Technical review report finalized |
| `ADMIN_REVIEW_STARTED` | Admin review begun |
| `ADMIN_REVIEW_COMPLETED` | Admin review completed |
| `DIRECTOR_REVIEW_STARTED` | Director review begun |
| `DIRECTOR_APPROVED` | Director approved |
| `DIRECTOR_RETURNED` | Director returned dossier |
| `MINISTERIAL_ADVICE_STARTED` | Advisor review begun |
| `MINISTERIAL_ADVICE_COMPLETED` | Advisor recommendation submitted |
| `MINISTER_DECISION_STARTED` | Minister review begun |
| `MINISTER_APPROVED` | Minister approved |
| `MINISTER_RETURNED` | Minister returned dossier |
| `CASE_ASSIGNED` | Worker assigned to case |
| `CASE_REASSIGNED` | Assignment transferred |
| `CASE_REVOKED` | Assignment revoked |
| `CASE_ASSIGNMENT_COMPLETED` | Assignment completed |

---

## 8. District Codes

Districts of Suriname used for administrative scoping. Each case, registration, and district-scoped user is associated with a `district_code` value.

---

## 9. Reference Number Formats

| Service | Format | Example |
|---------|--------|---------|
| Bouwsubsidie | `BS-YYYYMMDD-XXXX` | BS-20260301-0015 |
| Housing Registration | `WR-YYYYMMDD-XXXX` | WR-20260301-0042 |

---

## 10. Key Fields

| Field | Table | Description |
|-------|-------|------------|
| `national_id` | person | Unique citizen identification number |
| `case_number` | subsidy_case | Unique case reference (BS-format) |
| `reference_number` | housing_registration | Unique registration reference (WR-format) |
| `district_code` | multiple | Administrative district identifier |
| `access_token_hash` | public_status_access | SHA-256 hash of citizen's security token |
| `correlation_id` | audit_event | Groups related events from same operation |
| `is_finalized` | social_report, technical_report | Whether a report is final (immutable) |
| `is_active` | subsidy_document_requirement | Whether a document type is currently in use |
| `is_verified` | document uploads | Whether staff has verified a document |

---

*End of Glossary and Term Definitions*
