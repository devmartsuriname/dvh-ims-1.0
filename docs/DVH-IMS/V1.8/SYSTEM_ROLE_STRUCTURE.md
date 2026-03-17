# DVH-IMS — System Role Structure & Permission Audit

**Document:** System Role Structure  
**Version:** V1.8  
**Classification:** Official — For Ministerial Review  
**Date:** March 2026  
**Audit Context:** Phase 14 — Post-QR Analytics Implementation

---

## 1. Role Registry

The system defines exactly **11 roles** via the `app_role` PostgreSQL enum. No additional roles exist in the database, frontend, or RLS policies.

| # | Role Key | Dutch Name | English Name | Scope | Service Applicability |
|---|----------|-----------|--------------|-------|-----------------------|
| 1 | `system_admin` | Systeembeheerder | System Administrator | National | All modules |
| 2 | `minister` | Minister | Minister | National | Bouwsubsidie (final decision) |
| 3 | `project_leader` | Projectleider / Onderdirecteur | Project Leader / Deputy Director | National | Both services |
| 4 | `director` | Directeur | Director | National | Both services |
| 5 | `ministerial_advisor` | Beleidsadviseur Minister | Ministerial Policy Advisor | National | Bouwsubsidie |
| 6 | `audit` | Auditor | Auditor | National | Both (read-only) |
| 7 | `frontdesk_bouwsubsidie` | Frontdesk Bouwsubsidie | Frontdesk (Building Subsidy) | District | Bouwsubsidie |
| 8 | `frontdesk_housing` | Frontdesk Woningregistratie | Frontdesk (Housing) | District | Woningregistratie |
| 9 | `admin_staff` | Administratief Medewerker | Administrative Officer | District | Both services |
| 10 | `social_field_worker` | Sociaal Veldwerker | Social Field Worker | District | Bouwsubsidie |
| 11 | `technical_inspector` | Technisch Inspecteur | Technical Inspector | District | Bouwsubsidie |

### Scope Model

- **National roles** (`district_code = NULL`): Unrestricted geographic access across all districts.
- **District roles** (`district_code = 'PAR'`, etc.): RLS-enforced restriction to records matching the user's assigned district.

---

## 2. Deputy Director Clarification

There is **no separate `deputy_director` role** in the system. The `project_leader` role formally maps to **Projectleider / Onderdirecteur** (Project Leader / Deputy Director).

This is documented in `src/types/v12-roles.ts` and aligned with the V1.2 Workflow & Roles Harmonization document.

| Aspect | Director | Project Leader (Deputy Director) |
|--------|----------|----------------------------------|
| Decision chain position (Bouwsubsidie) | Step 5 — Organizational approval | Step 4 — Policy compliance review |
| Decision chain position (Housing) | Step 5 — Final decision | Step 4 — Policy review |
| Case assignment authority | Read-only | Full (create, reassign, revoke) |
| Allocation run execution | No | Yes |
| Daily operations role | Strategic oversight | Manages daily workflow and staff |
| Escalation target | Ministerial Advisor | Director |

---

## 3. Permission Matrix

**Legend:**  
- **Full** = View + all write actions  
- **Read** = View only  
- **Read*** = District-scoped, case-linked read only  
- **Read+W** = Read + write limited to own decision panel (status transitions)  
- **—** = No access

| Module | sys_admin | minister | proj_leader | fd_bouw | fd_hous | admin_staff | audit | soc_fw | tech_insp | director | min_adv |
|--------|-----------|----------|-------------|---------|---------|-------------|-------|--------|-----------|----------|---------|
| Dashboard | Full | Read | Full | Read | Read | Read | Read | — | — | Read | Read |
| Persons | Full | Read | Full | Full | Full | Full | Read | Read* | Read* | Read | Read |
| Households | Full | Read | Full | Full | Full | Full | Read | Read* | Read* | Read | Read |
| Control Queue | Full | Read | Full | Full | — | Full | Read | Read* | Read* | Read | Read |
| My Visits | — | — | — | — | — | — | — | Full | Full | — | — |
| Schedule Visits | Full | — | Full | — | — | Full | Read | — | — | — | — |
| Subsidy Cases | Full | Read | Full | Full | — | Full | Read | Read* | Read* | Read+W | Read+W |
| Case Assignments | Full | Read | Full | — | — | Read | Read | Read | Read | Read | Read |
| Registrations | Full | Read | Full | — | Full | Full | Read | — | — | — | — |
| Waiting List | Full | Read | Full | — | Full | Full | Read | — | — | — | — |
| District Quotas | Full | Read | Full | — | Full | Full | Read | — | — | — | — |
| Allocation Runs | Full | — | Full | — | — | — | — | — | — | — | — |
| Decisions | Full | Read | Full | — | Full | Full | Read | — | — | — | — |
| Assignments | Full | Read | Full | — | Full | Full | Read | — | — | — | — |
| Archive | Full | Read | Full | — | — | — | Read | — | — | Read | Read |
| Audit Log | Full | Read | Full | — | — | — | Read | — | — | Read | Read |
| QR Codes | Full | Read | Full | — | — | — | — | — | — | Read | — |
| QR Analytics | Full | Read | Full | — | — | — | Read | — | — | Read | — |

---

## 4. Bouwsubsidie Decision Chain (7 Steps)

| Step | Role | Action | Status Transition |
|------|------|--------|-------------------|
| 1 | `frontdesk_bouwsubsidie` | Intake review | SUBMITTED → IN_REVIEW |
| 2 | `social_field_worker` | Social assessment | → SOCIAL_REVIEW |
| 3 | `technical_inspector` | Technical inspection | → TECHNICAL_REVIEW |
| 4 | `admin_staff` | Administrative review | → ADMIN_REVIEW |
| 5 | `project_leader` | Policy compliance review | → POLICY_REVIEW |
| 6 | `director` | Organizational approval | → DIRECTOR_APPROVED / RETURNED |
| 7a | `ministerial_advisor` | Advisory review (paraaf) | → ADVISOR_REVIEWED |
| 7b | `minister` | Final decision | → MINISTER_APPROVED / RETURNED |

---

## 5. Woningregistratie Decision Chain (5 Steps)

| Step | Role | Action |
|------|------|--------|
| 1 | Citizen (public) | Submit registration via wizard |
| 2 | `frontdesk_housing` | Document verification and intake review |
| 3 | `admin_staff` | Administrative completeness check |
| 4 | `project_leader` | Policy review |
| 5 | `director` | Final decision (approve/reject) |

---

## 6. Governance Validation Results

### Minister Role — PASS
- Read access across all modules
- Write authority limited exclusively to final Bouwsubsidie decision (`MINISTER_APPROVED` / `RETURNED`)
- No case assignment write capability
- No allocation run execution

### Audit Role — PASS
- Strictly read-only across all tables
- SELECT-only RLS policies; no INSERT/UPDATE/DELETE anywhere
- Access to Archive and Audit Log for compliance review

### Operational Roles — PASS
- `frontdesk_bouwsubsidie`, `frontdesk_housing`, `admin_staff` cannot access Archive, Audit Log, or QR Codes
- District-scoped via RLS (`district_code` matching)

### Field Roles — PASS
- `social_field_worker`: Write limited to social assessment reports and visit records
- `technical_inspector`: Write limited to technical inspection reports and visit records
- Neither can access housing registration modules

### No Inconsistencies Found
All 11 roles operate within their documented authority boundaries. No privilege escalation paths detected.

---

## 7. Data Sources Referenced

| Source | Location | Purpose |
|--------|----------|---------|
| `app_role` enum | `src/integrations/supabase/types.ts` | Authoritative role list |
| V1.2 Harmonization | `docs/DVH-IMS-V1.2/` | Role definitions and decision chains |
| Role type definitions | `src/types/v12-roles.ts` | Dutch/English role names and metadata |
| Menu configuration | `src/assets/data/menu-items.ts` | Frontend navigation access control |
| RLS policies | `supabase/migrations/` | Database-level access enforcement |
| Permission matrix doc | `docs/manual/06-User-Roles-and-Permission-Matrix.md` | Ministerial reference document |
| Edge Functions | `supabase/functions/` | API-level authorization |

---

*End of System Role Structure & Permission Audit*
