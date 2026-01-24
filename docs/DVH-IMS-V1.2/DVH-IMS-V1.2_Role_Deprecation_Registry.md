# DVH-IMS V1.2 — Role Deprecation Registry

**Version:** DVH-IMS-V1.2  
**Status:** AUTHORITATIVE — GOVERNANCE ONLY  
**Created:** 2026-01-24  
**Document Type:** Governance (Normative)  
**Change Policy:** Documentation Only — No Implementation Authorized

---

## 1. Purpose

This document formally deprecates all legacy roles that are NOT part of the approved V1.2 Workflow & Roles Harmonization, and confirms the authoritative role structure for DVH-IMS V1.2.

---

## 2. Deprecated Roles

### STATUS: DEPRECATED — DO NOT USE

The following roles are retained ONLY for historical reference.  
They have NO operational, decision, or execution authority in DVH-IMS V1.2.  
They MUST NOT be assigned, reused, or referenced in new workflows.  
They are fully superseded by the "Workflow & Roles Harmonization (V1.2)".

| Legacy Role | Deprecation Status | Superseding Authority |
|-------------|-------------------|----------------------|
| DVH Operator | DEPRECATED — DO NOT USE | Workflow & Roles Harmonization V1.2 |
| DVH Reviewer | DEPRECATED — DO NOT USE | Workflow & Roles Harmonization V1.2 |
| DVH Decision Officer | DEPRECATED — DO NOT USE | Workflow & Roles Harmonization V1.2 |
| DVH Supervisor | DEPRECATED — DO NOT USE | Workflow & Roles Harmonization V1.2 |

### Deprecation Meaning

For EACH deprecated role:

- **Historical Reference Only** — These roles existed in earlier drafts
- **No Operational Authority** — Cannot perform any system actions
- **No Decision Authority** — Cannot approve, reject, or escalate
- **No Execution Authority** — Cannot trigger workflows or transitions
- **No Assignment Permitted** — Must not be assigned to any user
- **No Reuse Permitted** — Must not be referenced in new designs
- **Fully Superseded** — Replaced entirely by V1.2 harmonized roles

---

## 3. Authoritative Roles (V1.2)

ONLY the following roles are authoritative for DVH-IMS V1.2:

| Role | Authority Context | Decision Chain Position |
|------|-------------------|------------------------|
| Frontdesk | Intake and first registration | Step 1 |
| Social Field Worker | Social assessment and support | Step 1 (Parallel) |
| Technical Inspector | Technical report and budget (Housing Subsidy only) | Step 2 |
| Administrative Officer | Dossier completeness and administration | Step 3 |
| Project Leader / Deputy Director | Policy review | Step 4 |
| Director | Organizational approval | Step 5 |
| Ministerial Advisor | Formal advice and paraph | Step 6 |
| Minister | Final decision (Housing Subsidy only) | Step 7 |

### Authority Rules

- No other roles may participate in decision chains
- No parallel authority is allowed
- No fallback or override roles exist
- Every role action requires explicit authorization
- Every role action is fully auditable

---

## 4. Retained Technical Roles

The following roles are retained for technical/system purposes:

| Role | Purpose | Status |
|------|---------|--------|
| System Administrator | Technical configuration, access provisioning | RETAINED — Technical Only |
| Auditor | Read-only audit access, compliance verification | RETAINED — Read-Only |

These roles:

- Have NO dossier decision authority
- Have NO workflow participation rights
- Are limited to their explicit technical scope

---

## 5. Governance Statement (BINDING)

> "Any discrepancy between legacy roles and the V1.2 Workflow & Roles Harmonization must be resolved in favor of the V1.2 harmonized roles. Legacy roles are non-operative and cannot be used to justify actions, access, or decisions."

This statement is:

- Binding for all future design decisions
- Binding for all RLS policy implementation
- Binding for all audit interpretations
- Binding for all workflow enforcement

---

## 6. Reference Documents

| Document | Relationship |
|----------|-------------|
| DVH-IMS-V1.2_Workflow_And_Roles_Harmonization.md | Authoritative Source |
| DVH-IMS-V1.2_Roles_and_Authority_Matrix.md | Superseded (legacy roles) |
| DVH-IMS-V1.2_End_to_End_Workflows.md | Superseded (legacy workflows) |

---

## 7. Non-Actions

This document explicitly does NOT:

- Delete any roles from existing systems
- Rename any existing roles
- Map legacy roles to new roles
- Interpret equivalence between roles
- Authorize technical cleanup
- Authorize database changes
- Authorize RLS changes
- Authorize UI changes

---

## 8. Effective Date

This deprecation is effective as of the creation date of this document.

All future V1.2 planning and implementation must reference ONLY the authoritative roles defined in Section 3.

---

**END OF DOCUMENT**
