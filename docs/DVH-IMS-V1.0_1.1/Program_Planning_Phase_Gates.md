# VolksHuisvesting IMS – Full Program Planning & Phase Gates (v1.0, EN)

**Status:** Definitive EN Version
**Alignment:** 1:1 derived from approved NL Program Planning
**Deadline:** 30 January 2026 (non-negotiable)
**Governance:** Government Grade, Audit-first, RLS-first

---

## 1. Purpose
This document defines the **end-to-end program planning**, governance model, and **hard phase gates** for the delivery of the VolksHuisvesting IMS.

It establishes:
- What is built
- In what order
- Under which controls
- With explicit stop/go authorization points

---

## 2. Program Objectives

- Deliver a production-ready IMS covering:
  - Bouwsubsidie
  - Woning Registratie & Allocatie
- Operate nationwide from day one
- Guarantee full auditability and minister-proof governance
- Prevent scope drift and uncontrolled execution

---

## 3. Non-Negotiable Constraints

- Government Grade security and audit
- Row Level Security enforced before production
- Darkone Admin UI remains 1:1
- Public frontend uses Darkone assets (Light Theme only)
- No citizen accounts
- No housing inventory management
- No objections or appeals in v1.0

---

## 4. Delivery Model

### 4.1 Single Platform, Dual Modules

- One IMS platform
- Two strictly separated modules:
  - Module A: Bouwsubsidie
  - Module B: Woning Registratie & Allocatie
- Shared Core limited to Person / Household

---

## 5. Phase Overview

| Phase | Name | Outcome |
|------|------|---------|
| 0 | Foundation & Governance | Environment, standards, RLS baseline |
| 1 | Shared Core | Person / Household operational |
| 2 | Bouwsubsidie Module | End-to-end Bouwsubsidie flow |
| 3 | Housing Registration | Registration & urgency |
| 4 | Allocation Engine | Quota-based allocation |
| 5 | Public Wizards | Citizen intake & tracking |
| 6 | Reporting & Audit | KPI & audit validation |
| 7 | Hardening & Go-Live | Production readiness |

---

## 6. Phase Definitions & Gates

### Phase 0 – Foundation & Governance
**Scope:**
- Repo structure
- Darkone Admin baseline
- Supabase project setup
- Auth + RLS skeleton

**Gate:**
- Architecture & Security approved
- No build errors

---

### Phase 1 – Shared Core
**Scope:**
- Person
- Household
- Address
- Contact points

**Gate:**
- RLS validated
- Cross-module reuse confirmed

---

### Phase 2 – Bouwsubsidie Module
**Scope:**
- Intake processing
- Case lifecycle
- Document tracking
- Social & technical reports
- Raadvoorstel generation (DOCX)

**Gate:**
- End-to-end case flow works
- Audit coverage verified

---

### Phase 3 – Housing Registration
**Scope:**
- Public registration
- Waiting list
- Urgency assessment

**Gate:**
- Registration integrity verified
- Urgency data auditable

---

### Phase 4 – Allocation Engine
**Scope:**
- District quotas
- Allocation runs
- Assignment registration

**Gate:**
- Allocation rules enforced
- Decisions traceable

---

### Phase 5 – Public Wizards
**Scope:**
- Landing page
- Bouwsubsidie wizard
- Housing registration wizard
- Status tracking

**Gate:**
- Usability verified
- No internal data exposure

---

### Phase 6 – Reporting & Audit
**Scope:**
- KPI dashboards
- Audit exports
- Minister dashboards

**Gate:**
- Full audit trail validated

---

### Phase 7 – Hardening & Go-Live
**Scope:**
- Performance testing
- Security review
- Final RLS checks

**Gate:**
- Minister-ready production system

---

## 7. Phase Governance Rules

- No phase skipping
- Restore point required after each phase
- Explicit authorization required to proceed
- Errors halt execution immediately

---

## 8. Roles in Program Governance

- Delroy: Final authority
- Lovable: Execution agent only
- Ministry stakeholders: Review & approval

---

## 9. Acceptance Criteria

- All phase gates passed
- No unresolved critical issues
- All live documents aligned

---

## 10. Change Control

Any change:
- Requires explicit approval
- Requires document update
- Cannot bypass phase gates

---

**End of Full Program Planning & Phase Gates (EN)**
