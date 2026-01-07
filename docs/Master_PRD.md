# VolksHuisvesting IMS – Master PRD (EN)

**Status:** Definitive – Single Source of Truth for requirements
**Version:** v1.0
**Deadline (Go‑Live):** 30 January 2026
**Governance Level:** Government Grade (Audit‑first, RLS‑first)

---

## 1. Purpose of this Document
This Master Product Requirements Document (PRD) defines the **authoritative functional and non‑functional requirements** for the VolksHuisvesting IMS.

It consolidates and formalizes all requirements derived from the approved planning and design documents. No scope is introduced beyond what has already been agreed.

This document is the **primary reference** for:
- Execution authorization
- Validation and acceptance
- Audit and governance review

---

## 2. Project Objective

The objective of the VolksHuisvesting IMS is to deliver a **central, auditable Information Management System** for the Ministry of Social Affairs and Housing, covering:

1. **Bouwsubsidie (Housing Construction Subsidy)**
2. **Woning Registratie & Allocatie (Housing Registration and Allocation)**

The system must support **nationwide usage (all districts from day one)** and operate under strict government‑grade security, transparency, and accountability requirements.

---

## 3. Scope (IN SCOPE)

### 3.1 Functional Scope

#### Module A – Bouwsubsidie
- Public intake via wizard (citizen, no login)
- Case creation and lifecycle management
- Document requirement tracking
- Social and technical field reports
- Status‑based decision workflow
- Automatic generation of **Raadvoorstel (DOCX)** as concept
- Ministerial approval logging

#### Module B – Woning Registratie & Allocatie
- Public registration of housing seekers
- Central waiting list per district
- Urgency assessment and scoring
- Allocation based on **Quota per district + urgency score**
- Registration of external housing assignments

#### Shared Core
- Single Person / Household identity
- Reusable across both modules
- Centralized contact and address data

#### Public Services
- Landing page with service selection
- Wizards for both services
- Citizen status tracking using reference number + token

---

## 4. Explicitly OUT OF SCOPE

The following are **not included** in v1.0:
- Housing inventory / unit management
- Objection or appeal procedures
- Citizen accounts or dashboards
- Dark theme for public frontend
- Policy analytics beyond defined KPIs

---

## 5. User Roles

The system supports the following roles:

- Minister
- Project Leader
- Frontdesk Officer
- Administrative Staff
- Social Field Worker
- Technical Inspector
- Audit / Read‑only

Each role is strictly governed by Row Level Security (RLS).

---

## 6. Functional Requirements (High Level)

### 6.1 Intake & Registration
- Citizens must be able to submit applications without authentication
- Each submission generates a unique reference number
- Citizens receive a token for status tracking

### 6.2 Case & Registration Management
- Staff can view and process records within their district scope
- Status transitions are controlled and logged
- Documents and reports are linked to the main record

### 6.3 Allocation & Decision Making
- Allocations must respect district quotas
- Urgency scoring must be transparent and traceable
- All allocation decisions must be auditable

### 6.4 Document Generation
- Raadvoorstel must be generated as DOCX
- Generated documents are always marked as **Concept**
- Approval by Minister is mandatory

---

## 7. Non‑Functional Requirements

### 7.1 Security
- RLS enforced at database level
- Least‑privilege access model
- No hardcoded permissions in UI

### 7.2 Audit & Transparency
- Every status change logged
- Every decision requires actor, timestamp, and reason
- Audit logs are append‑only

### 7.3 UX & UI
- Darkone Admin UI must remain 1:1
- Public frontend uses Darkone assets (Light Theme only)
- No custom UI frameworks or icon sets

### 7.4 Reliability
- System must handle nationwide concurrent usage
- Errors must halt execution and be reported

---

## 8. Success Criteria & KPIs

The system is considered successful when it can reliably report:
- Average processing time per Bouwsubsidie case
- Percentage of complete vs incomplete dossiers
- Number of housing allocations per district and period
- Full audit trace for any selected case or allocation

---

## 9. Acceptance Criteria

The system may only be accepted when:
- All modules operate according to documented flows
- RLS is verified for all roles
- Audit trails are complete and consistent
- Raadvoorstel generation produces valid DOCX output
- No unresolved critical errors exist

---

## 10. Dependencies

This PRD depends on and must remain aligned with:
- Full Program Planning & Phase Gates (v1.0)
- Architecture & Security (Government Grade)
- Database & RLS Specification
- UX Flows (Wizard + Admin)
- Raadvoorstel Template (DOCX)
- Execution Plan (Lovable)

---

## 11. Change Control

Any change to this PRD:
- Requires explicit approval by Delroy
- Must be reflected in all dependent documents
- Cannot be applied retroactively during execution

---

**End of Master PRD**
