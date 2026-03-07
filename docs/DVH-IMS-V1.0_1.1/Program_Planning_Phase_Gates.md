# VolksHuisvesting IMS – Full Program Planning & Phase Gates (v1.0, EN)

**Status:** Definitive EN Version
**Alignment:** 1:1 derived from approved NL Program Planning
**Governance:** Government Grade, Audit-first, RLS-first
**Last Updated:** 2026-03-07

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

| Phase | Name | Outcome | Gate Status |
|------|------|---------|-------------|
| 0 | Foundation & Governance | Environment, standards, RLS baseline | ✅ PASSED |
| 1 | Shared Core | Person / Household operational | ✅ PASSED |
| 2 | Bouwsubsidie Module | End-to-end Bouwsubsidie flow | ✅ PASSED |
| 3 | Housing Registration | Registration & urgency | ✅ PASSED |
| 4 | Allocation Engine | Quota-based allocation | ✅ PASSED |
| 5 | Public Wizards | Citizen intake & tracking | ✅ PASSED |
| 6 | Reporting & Audit | KPI & audit validation | ✅ PASSED |
| 7 | Hardening & Go-Live | Security hardening (v1.8) | ✅ PASSED |

---

## 6. Phase Definitions & Gates

### Phase 0 – Foundation & Governance ✅ PASSED
**Scope:** Repo structure, Darkone Admin baseline, Supabase project setup, Auth + RLS skeleton
**Gate Result:** Architecture & Security approved. No build errors. Auth functional.

---

### Phase 1 – Shared Core ✅ PASSED
**Scope:** Person, Household, Address, Contact points
**Gate Result:** RLS validated. Cross-module reuse confirmed.

---

### Phase 2 – Bouwsubsidie Module ✅ PASSED
**Scope:** Intake processing, Case lifecycle, Document tracking, Social & technical reports, Raadvoorstel generation
**Gate Result:** End-to-end case flow works. Audit coverage verified.

---

### Phase 3 – Housing Registration ✅ PASSED
**Scope:** Public registration, Waiting list, Urgency assessment
**Gate Result:** Registration integrity verified. Urgency data auditable.

---

### Phase 4 – Allocation Engine ✅ PASSED
**Scope:** District quotas, Allocation runs, Assignment registration
**Gate Result:** Allocation rules enforced. Decisions traceable.

---

### Phase 5 – Public Wizards ✅ PASSED
**Scope:** Landing page, Bouwsubsidie wizard, Housing registration wizard, Status tracking
**Gate Result:** Usability verified. No internal data exposure.

---

### Phase 6 – Reporting & Audit ✅ PASSED
**Scope:** KPI dashboards, Audit exports, Minister dashboards
**Gate Result:** Full audit trail validated. PageSpeed within production ranges.

---

### Phase 7 – Security Hardening ✅ PASSED
**Scope:** RLS security hardening, anonymous policy removal, privilege escalation fix
**Gate Result:**
- Zero `anon_` policies on application tables
- `app_user_profile` self-update restricted
- `housing_document_upload` INSERT policy added
- Leaked password protection enabled
- Edge Functions verified functional

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
