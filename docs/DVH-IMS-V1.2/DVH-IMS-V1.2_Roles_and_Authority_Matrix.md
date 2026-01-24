# DVH-IMS V1.2 — Roles, Departments & Authority Matrix

**Version:** DVH-IMS-V1.2  
**Status:** DRAFT — Awaiting Review & Approval  
**Created:** 2026-01-24  
**Document Type:** Governance (Normative)  
**Change Policy:** No implementation without explicit approval

---

## 1. Purpose of This Document

This document defines the roles, departments, and authority boundaries within DVH-IMS-V1.2.

It establishes:

- Who may perform which actions
- Which department owns which responsibilities
- Where authority starts and ends
- How decisions, reviews, and approvals are structured

**This document is normative for all future workflow, RLS, audit, and notification design.**

> This is a documentation-only artifact. No system changes are implied or authorized by this document.

---

## 2. Guiding Principles

| Principle | Description |
|-----------|-------------|
| **Separation of Duties** | No single role controls an end-to-end critical process |
| **Least Privilege** | Roles receive only the permissions strictly required |
| **Traceable Authority** | Every action maps to a role and department |
| **Operational Continuity** | DVH daily operations must not be disrupted |
| **V1.1 Stability Preservation** | Existing behavior remains unchanged unless explicitly approved |

---

## 3. Organizational Scope

### 3.1 In-Scope

- DVH Internal Departments
- DVH Operational Staff
- DVH Supervisory & Decision-Making Roles
- System-level administrative roles

### 3.2 Explicitly Out of Scope

- External Ministries (future phase)
- Citizen-facing roles
- Automated decision engines
- Cross-agency authority delegation

---

## 4. Department Definitions

### 4.1 DVH Administration

**Responsibility:** Overall system ownership and policy oversight

### 4.2 Case Management Department

**Responsibility:** Intake, processing, and lifecycle management of dossiers

### 4.3 Review & Verification Unit

**Responsibility:** Validation, compliance checks, and quality assurance

### 4.4 Decision Authority Unit

**Responsibility:** Formal approval, rejection, or escalation of cases

### 4.5 Audit & Compliance Unit

**Responsibility:** Oversight, logging review, legal traceability

### 4.6 System Administration

**Responsibility:** Technical configuration, access provisioning, system integrity

---

## 5. Role Definitions

### 5.1 System Administrator

| Attribute | Value |
|-----------|-------|
| **Department** | System Administration |
| **Core Authority** | User account provisioning, Role assignment, System configuration |
| **Explicit Restrictions** | No dossier content modification, No decision-making authority |

### 5.2 DVH Operator

| Attribute | Value |
|-----------|-------|
| **Department** | Case Management |
| **Core Authority** | Create new dossiers, Update dossier data, Attach required documentation |
| **Explicit Restrictions** | No approval or rejection authority, No role management |

### 5.3 DVH Reviewer

| Attribute | Value |
|-----------|-------|
| **Department** | Review & Verification Unit |
| **Core Authority** | Review dossier completeness, Flag inconsistencies, Request corrections |
| **Explicit Restrictions** | Cannot approve or reject, Cannot alter original submissions |

### 5.4 DVH Decision Officer

| Attribute | Value |
|-----------|-------|
| **Department** | Decision Authority Unit |
| **Core Authority** | Approve cases, Reject cases, Escalate cases |
| **Explicit Restrictions** | No data entry, No system configuration |

### 5.5 DVH Supervisor

| Attribute | Value |
|-----------|-------|
| **Department** | DVH Administration |
| **Core Authority** | Oversight of workflows, Exceptional case intervention, Escalation resolution |
| **Explicit Restrictions** | No routine data entry, No system-level configuration |

### 5.6 Auditor

| Attribute | Value |
|-----------|-------|
| **Department** | Audit & Compliance Unit |
| **Core Authority** | Read-only access to dossiers, Access to audit logs, Compliance verification |
| **Explicit Restrictions** | No data modification, No decision authority |

---

## 6. Authority Matrix (High-Level)

| Role | Create | Edit | Review | Approve | Reject | Audit | Configure |
|------|:------:|:----:|:------:|:-------:|:------:|:-----:|:---------:|
| System Administrator | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| DVH Operator | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| DVH Reviewer | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| DVH Decision Officer | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| DVH Supervisor | ❌ | ❌ | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ |
| Auditor | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

> ⚠️ = Exceptional / Escalation-only

---

## 7. Relationship to Current Stack (V1.1)

- Roles may already exist implicitly in the V1.1 `app_role` enum
- **No RLS or permission changes are executed in V1.1**
- This document prepares structured alignment for V1.2 implementation phase

---

## 8. Next Dependent Documents

This document is a prerequisite for:

1. Workflow Definitions
2. State Machine & Transitions
3. RLS Policy Design
4. Audit Logging Model
5. Notification & Escalation Rules

---

## 9. Approval Gate

This document requires:

- Internal review
- Explicit approval

**Until approved:**

- No technical implementation
- No RLS changes
- No workflow enforcement

---

**End of Document**
