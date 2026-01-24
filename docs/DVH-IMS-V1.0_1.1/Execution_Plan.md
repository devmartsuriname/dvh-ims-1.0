# VolksHuisvesting IMS – Execution Plan (Lovable, Phased with Hard Stops, EN)

**Status:** Definitive EN Version
**Execution Agent:** Lovable (execution-only)
**Authority:** Delroy (final)
**Deadline:** 30 January 2026 (non-negotiable)
**Governance:** Government Grade, Audit-first, RLS-first

---

## 1. Purpose
This Execution Plan defines **exactly how Lovable must execute** the VolksHuisvesting IMS delivery, step-by-step, with **hard stops**, **restore points**, and **explicit authorization gates**.

Lovable is not permitted to interpret, optimize, or extend scope.

---

## 2. Mandatory Pre-Execution Checks (Before Any Work)

Lovable MUST:
1. Read all live documents:
   - Master PRD (EN)
   - Architecture & Security (EN)
   - Database & RLS Specification (EN)
   - UX Flows (EN)
   - Raadvoorstel Template (EN)
   - Full Program Planning & Phase Gates (EN)
2. Confirm current phase and last restore point
3. Await explicit phase authorization

Failure to do so invalidates execution.

---

## 3. Global Execution Rules (Hard)

- NO phase skipping
- NO scope expansion
- NO feature suggestions
- NO refactoring unless authorized
- NO assumptions
- NO custom UI frameworks
- Darkone Admin UI must remain 1:1
- Public frontend uses Darkone assets (Light Theme only)
- RLS must be implemented before functionality
- Audit events are mandatory for all decisions

---

## 4. Phase Structure Overview

**Current Status:** End of Phase 8 — PHASE-8-COMPLETE  
**Next Phase:** Phase 9 (awaiting authorization)

| Phase | Name | Primary Output | Hard Stop | Status |
|------|------|----------------|-----------|--------|
| 0 | Foundation & Governance | Repo, env, auth, RLS base | YES | COMPLETE |
| 1 | Shared Core | Person/Household | YES | COMPLETE |
| 2 | Bouwsubsidie Module | End-to-end flow | YES | COMPLETE |
| 3 | Housing Registration | Registration + urgency | YES | COMPLETE |
| 4 | Allocation Engine | Quota allocation | YES | COMPLETE |
| 5 | Public Wizards | Intake + tracking | YES | COMPLETE |
| 6 | Reporting & Audit | KPIs + audit | YES | COMPLETE |
| 7 | Data Validation & QA | Test data, functional validation | YES | COMPLETE |
| 8 | Security & Audit Readiness | RLS audit, Edge hardening | YES | COMPLETE |
| 9 | Public Wizard DB Integration | Live wizard submission | YES | PENDING |
| 10 | Raadvoorstel DOCX Generation | Document generation | YES | PENDING |
| 11 | RBAC & District Access | Role-based access | YES | PENDING |
| 12 | Final Hardening & Go-Live | Production ready | YES | PENDING |

---

## 5. Phase-by-Phase Execution

### Phase 0 – Foundation & Governance

**Tasks:**
- Initialize repositories
- Apply Darkone Admin baseline
- Configure Supabase project
- Configure Auth
- Create RLS skeleton (deny-all default)

**Verification:**
- No build errors
- Auth works

**Hard Stop:**
- Create restore point
- Await authorization

---

### Phase 1 – Shared Core

**Tasks:**
- Implement Person
- Implement Household
- Implement Address & Contact
- Apply RLS policies

**Verification:**
- Shared data reusable across modules

**Hard Stop:**
- Restore point required
- Await authorization

---

### Phase 2 – Bouwsubsidie Module

**Tasks:**
- Case lifecycle
- Document requirements
- Social & technical reports
- Status transitions
- Raadvoorstel DOCX generation

**Verification:**
- End-to-end Bouwsubsidie flow
- Audit coverage verified

**Hard Stop:**
- Restore point
- Await authorization

---

### Phase 3 – Housing Registration

**Tasks:**
- Registration intake
- Waiting list
- Urgency assessment

**Verification:**
- Urgency scores auditable

**Hard Stop:**
- Restore point
- Await authorization

---

### Phase 4 – Allocation Engine

**Tasks:**
- District quota management
- Allocation runs
- Decision logging
- Assignment records

**Verification:**
- Allocation traceable

**Hard Stop:**
- Restore point
- Await authorization

---

### Phase 5 – Public Wizards

**Tasks:**
- Landing page
- Bouwsubsidie wizard
- Housing registration wizard
- Status tracking

**Verification:**
- Citizen-friendly UX
- No internal data exposure

**Hard Stop:**
- Restore point
- Await authorization

---

### Phase 6 – Reporting & Audit

**Tasks:**
- KPI dashboards
- Audit exports
- Minister dashboards

**Verification:**
- Full audit trace validated

**Hard Stop:**
- Restore point
- Await authorization

---

### Phase 7 – Hardening & Go-Live

**Tasks:**
- Performance testing
- Security validation
- Final RLS review

**Verification:**
- Production-ready system

**Hard Stop:**
- Final approval

---

## 6. Mandatory End-of-Phase Report

Lovable MUST provide, after each phase:

**IMPLEMENTED:**
- List of completed items

**PARTIAL:**
- Items partially completed with reason

**SKIPPED:**
- Items skipped with reason

**VERIFICATION:**
- What was tested
- What was not tested

**RESTORE POINT:**
- Restore point identifier

**BLOCKERS / ERRORS:**
- Explicit error report or NONE

No report = phase invalid.

---

## 7. Error Handling

If any error occurs:
1. STOP immediately
2. Report error
3. Do not attempt fixes
4. Await instruction

---

## 8. Anti-Drift Clause

On new chat start:
- Re-read all live documents
- Identify last completed phase
- State what is allowed next
- WAIT for authorization

---

## 9. Phase Documentation Reference

Detailed phase plans are maintained in `/phases/`:

| Phase | Document | Status |
|-------|----------|--------|
| 0 | PHASE-0-Foundation-and-Governance.md | COMPLETE |
| 1 | PHASE-1-Shared-Core.md | COMPLETE |
| 2 | PHASE-2-Bouwsubsidie.md | COMPLETE |
| 3 | PHASE-3-Housing-Registration.md | COMPLETE |
| 4 | PHASE-4-Allocation-Engine.md | COMPLETE |
| 5 | PHASE-5-Public-Wizards.md | COMPLETE |
| 6 | PHASE-6-Reporting-and-Audit.md | COMPLETE |
| 7 | PHASE-7-Hardening-and-Go-Live.md | COMPLETE |
| 8 | PHASE-8-Security-and-Audit-Readiness.md | COMPLETE |
| 9 | PHASE-9-Public-Wizard-Database-Integration.md | PENDING |
| 10 | PHASE-10-Raadvoorstel-DOCX-Generation.md | PENDING |
| 11 | PHASE-11-RBAC-and-District-Access.md | PENDING |
| 12 | PHASE-12-Final-Hardening-and-Go-Live.md | PENDING |

Each phase document contains:
- A. Phase Objective
- B. Framework & Routing (for UI phases)
- C. Explicit Scope (ALLOWED)
- D. Explicit Out of Scope (FORBIDDEN)
- E. Database Impact
- F. Security and RLS Considerations
- G. Audit Trail
- H. UI Impact (Darkone 1:1 compliance)
- I. Verification Criteria
- J. Admin Account Requirement
- K. Restore Points
- L. Hard Stop Statement
- M. Governance References

Phase documents are authoritative for execution scope.

---

## 10. Technical Stack Reference

| Component | Technology |
|-----------|------------|
| Framework | Vite + React SPA |
| Routing | React Router DOM v6 |
| Route Registration | `src/routes/index.tsx` |
| Menu Config | `src/assets/data/menu-items.ts` |
| UI Baseline | Darkone Admin 1:1 |
| Backend | Supabase (PostgreSQL + Auth + RLS) |

**Note:** This is NOT Next.js App Router. Folder structure follows Darkone conventions.

---

## 11. Guardian Rules Reference

All implementation must comply with Guardian Rules defined in:
- `/docs/Architecture_Security.md` — Section 11 and Section 13.2

Key rules:
- Darkone Admin UI 1:1 only
- Darkone SCSS + Assets Library only
- NO custom Bootstrap extensions
- NO new icon libraries
- All icons from DARKONE_ASSET_MAP (mingcute:* prefix)
- Public frontend Light Theme only

---

**End of Execution Plan (EN)**
