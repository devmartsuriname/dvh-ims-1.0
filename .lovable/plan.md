

# DVH-IMS — System Role Audit and Documentation

## Findings Summary

### All 11 System Roles (from `app_role` enum)

The system defines exactly **11 roles** across database, frontend, and RLS. There is no `deputy_director` role — the `project_leader` role formally maps to "Projectleider / Onderdirecteur" (Project Leader / Deputy Director) as documented in `src/types/v12-roles.ts`.

| # | Role | Dutch Name | English Name | Scope | Service |
|---|------|-----------|--------------|-------|---------|
| 1 | `system_admin` | Systeembeheerder | System Administrator | National | Technical |
| 2 | `minister` | Minister | Minister | National | Bouwsubsidie (final decision) |
| 3 | `project_leader` | Projectleider / Onderdirecteur | Project Leader / Deputy Director | National | Both |
| 4 | `frontdesk_bouwsubsidie` | Frontdesk Bouwsubsidie | Frontdesk (Building Subsidy) | District | Bouwsubsidie |
| 5 | `frontdesk_housing` | Frontdesk Woningregistratie | Frontdesk (Housing) | District | Woningregistratie |
| 6 | `admin_staff` | Administratief Medewerker | Administrative Officer | District | Both |
| 7 | `audit` | Auditor | Auditor | National | Both (read-only) |
| 8 | `social_field_worker` | Sociaal Veldwerker | Social Field Worker | District | Both |
| 9 | `technical_inspector` | Technisch Inspecteur | Technical Inspector | District | Bouwsubsidie |
| 10 | `director` | Directeur | Director | National | Both |
| 11 | `ministerial_advisor` | Beleidsadviseur Minister | Ministerial Policy Advisor | National | Bouwsubsidie |

### Deputy Director Clarification

The `project_leader` role IS the Deputy Director (Onderdirecteur). This is a single role, not two separate roles. In the 7-step Bouwsubsidie decision chain, project_leader occupies Step 4 (policy compliance review). For Housing Registration, project_leader occupies Step 4 before director final decision at Step 5.

### Permission Matrix

```text
Module                 | sys_admin | minister | proj_leader | fd_bouw | fd_hous | admin_staff | audit | soc_fw | tech_insp | director | min_adv
-----------------------|-----------|----------|-------------|---------|---------|-------------|-------|--------|-----------|----------|--------
Dashboard              | Full      | Read     | Full        | Read    | Read    | Read        | Read  | —      | —         | Read     | Read
Persons                | Full      | Read     | Full        | Full    | Full    | Full        | Read  | Read*  | Read*     | Read     | Read
Households             | Full      | Read     | Full        | Full    | Full    | Full        | Read  | Read*  | Read*     | Read     | Read
Control Queue          | Full      | Read     | Full        | Full    | —       | Full        | Read  | Read*  | Read*     | Read     | Read
My Visits              | —         | —        | —           | —       | —       | —           | —     | Full   | Full      | —        | —
Schedule Visits        | Full      | —        | Full        | —       | —       | Full        | Read  | —      | —         | —        | —
Subsidy Cases          | Full      | Read     | Full        | Full    | —       | Full        | Read  | Read*  | Read*     | Read+W   | Read+W
Case Assignments       | Full      | Read     | Full        | —       | —       | Read        | Read  | Read   | Read      | Read     | Read
Registrations          | Full      | Read     | Full        | —       | Full    | Full        | Read  | —      | —         | —        | —
Waiting List           | Full      | Read     | Full        | —       | Full    | Full        | Read  | —      | —         | —        | —
District Quotas        | Full      | Read     | Full        | —       | Full    | Full        | Read  | —      | —         | —        | —
Allocation Runs        | Full      | —        | Full        | —       | —       | —           | —     | —      | —         | —        | —
Decisions              | Full      | Read     | Full        | —       | Full    | Full        | Read  | —      | —         | —        | —
Assignments            | Full      | Read     | Full        | —       | Full    | Full        | Read  | —      | —         | —        | —
Archive                | Full      | Read     | Full        | —       | —       | —           | Read  | —      | —         | Read     | Read
Audit Log              | Full      | Read     | Full        | —       | —       | —           | Read  | —      | —         | Read     | Read
QR Codes               | Full      | Read     | Full        | —       | —       | —           | —     | —      | —         | Read     | —
QR Analytics           | Full      | Read     | Full        | —       | —       | —           | Read  | —      | —         | Read     | —

Read* = district-scoped, case-linked only
Read+W = write limited to own decision panel (status transitions)
```

### Director vs Project Leader (Deputy Director)

| Aspect | Director | Project Leader (Deputy Director) |
|--------|----------|----------------------------------|
| Decision chain position | Step 5 | Step 4 |
| Bouwsubsidie authority | Organizational approval, escalates to ministerial advisor | Policy compliance review, escalates to director |
| Housing Registration | Final decision authority (Step 5) | Policy review, escalates to director |
| Case assignment write | No (read-only) | Yes (can create assignments) |
| Allocation runs | No | Yes (can execute) |
| Daily operations | Oversight | Manages daily workflow and staff |

### Governance Validation

1. **Minister role** — Confirmed oversight-only. Has read access across modules; write limited to final Bouwsubsidie decision (`awaiting_minister_decision` transitions) and notifications. No case assignment write.
2. **Audit role** — Confirmed strictly read-only. SELECT policies only on all tables. No INSERT/UPDATE/DELETE anywhere.
3. **Operational roles** — Cannot access Archive, Audit Log, or QR Codes. District-scoped via RLS.
4. **Field roles** — `social_field_worker` and `technical_inspector` have write access only to their respective review reports and visit records. Cannot access housing registration modules.
5. **No inconsistencies found**.

## Implementation Plan

Create a single documentation file capturing the complete audit.

### File: `docs/DVH-IMS/V1.8/SYSTEM_ROLE_STRUCTURE.md`

Contents:
- Complete 11-role registry with Dutch/English names, scope, and service applicability
- Permission matrix (all 17 modules x 11 roles)
- Bouwsubsidie 7-step decision chain
- Woningregistratie 5-step decision chain
- Director vs Deputy Director comparison
- Governance validation results
- Data sources referenced (database enum, RLS policies, menu-items.ts, v12-roles.ts, edge functions)

Single file creation, no code changes required.

