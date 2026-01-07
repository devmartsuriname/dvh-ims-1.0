# Phase 6 — Reporting and Audit

**Project:** VolksHuisvesting IMS (DVH-IMS-1.0)  
**Status:** Documentation Only  
**Authority:** Delroy (Final)

---

## A. Phase Objective

Implement reporting and audit interfaces for government accountability:
- KPI dashboards for both modules
- Audit log interface for traceability
- Minister dashboards for oversight
- Report exports for external use
- Report snapshots for historical reference

---

## B. Explicit Scope (ALLOWED)

| Category | Allowed Actions |
|----------|-----------------|
| Database | Create `report_snapshot` table |
| UI | Create Bouwsubsidie KPI dashboard |
| UI | Create Housing Registration KPI dashboard |
| UI | Create Audit Log viewer |
| UI | Create Minister dashboard |
| UI | Create Export functionality |
| Integration | Create report generation Edge Function (if needed) |

---

## C. Explicit Out of Scope (FORBIDDEN)

| Category | Forbidden Actions |
|----------|-------------------|
| Modules | Functional changes to Bouwsubsidie |
| Modules | Functional changes to Housing Registration |
| Modules | Functional changes to Allocation |
| Shared Core | Modifications to Person/Household tables |
| UI | Public-facing modifications |
| UI | Layout modifications |
| Features | Policy analytics beyond defined KPIs |

---

## D. Database Impact (DOCUMENTATION ONLY)

### Tables to Create

#### `report_snapshot`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| report_type | text | NO | - | Type of report |
| report_date | date | NO | - | Date of report |
| district_code | text | YES | - | District (null = national) |
| snapshot_data | jsonb | NO | - | Report data |
| generated_by | uuid | NO | - | Generator user ID |
| generated_at | timestamptz | NO | now() | Generation timestamp |

### RLS Policy Matrix

| Table | Policy | Operation | Expression |
|-------|--------|-----------|------------|
| report_snapshot | Authorized can read | SELECT | Role-based |
| report_snapshot | Authorized can generate | INSERT | Role-based |
| report_snapshot | Immutable | UPDATE/DELETE | DENY all |

### Existing Tables Used (Read-Only)

- `audit_event` — Full audit trail
- `subsidy_case` — Bouwsubsidie metrics
- `housing_registration` — Housing metrics
- `allocation_run` — Allocation metrics
- `allocation_decision` — Decision metrics

---

## E. UI Impact (DOCUMENTATION ONLY)

### Admin Pages (Darkone 1:1)

| Page | Route | Access | Description |
|------|-------|--------|-------------|
| Bouwsubsidie KPIs | `/admin/reports/bouwsubsidie` | All roles | Module metrics |
| Housing KPIs | `/admin/reports/housing` | All roles | Module metrics |
| Audit Log | `/admin/reports/audit` | Audit role | Event viewer |
| Minister Dashboard | `/admin/reports/minister` | Minister | Executive view |
| Export | `/admin/reports/export` | Project Leader | Data export |

### KPIs — Bouwsubsidie

| KPI | Description |
|-----|-------------|
| Average Processing Time | Days from received to finalized |
| Cases by Status | Distribution across statuses |
| Complete vs Incomplete | Dossier completeness rate |
| Cases per District | Geographic distribution |
| Monthly Trend | Case volume over time |

### KPIs — Housing Registration

| KPI | Description |
|-----|-------------|
| Registrations by District | Geographic distribution |
| Allocations per Period | Allocations over time |
| Average Wait Time | Days from registration to allocation |
| Urgency Distribution | Breakdown by urgency score |
| Quota Utilization | Allocated vs available per district |

### Minister Dashboard

| Widget | Description |
|--------|-------------|
| National Overview | Summary of both modules |
| Critical Cases | Cases requiring attention |
| Recent Decisions | Latest ministerial decisions |
| Trend Indicators | Key metrics trends |

### Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| BouwsubsidieKPIs | `src/app/admin/reports/bouwsubsidie/` | Subsidy metrics |
| HousingKPIs | `src/app/admin/reports/housing/` | Housing metrics |
| AuditLogViewer | `src/app/admin/reports/audit/` | Audit events |
| MinisterDashboard | `src/app/admin/reports/minister/` | Executive view |
| ReportExport | `src/app/admin/reports/export/` | Export interface |
| KPICard | `src/components/reports/` | Reusable KPI display |
| TrendChart | `src/components/reports/` | Trend visualization |

---

## F. Security & RLS Considerations

### Role-Based Access

| Role | KPIs | Audit Log | Minister Dashboard | Export |
|------|------|-----------|-------------------|--------|
| Minister | National | Read | Full | Read |
| Project Leader | National | Read | Read | Full |
| Frontdesk | District | None | None | None |
| Admin Staff | District | None | None | None |
| Audit | National | Full | Read | Read |

### Audit Log Security

- Audit events are read-only
- No modification or deletion allowed
- Full history preserved
- Actor identification always visible

### Export Security

- Exports logged to audit_event
- Export content filtered by role
- No PII in exports without authorization
- Watermarking for sensitive exports

---

## G. Verification Criteria

### Database Verification

- [ ] `report_snapshot` table created
- [ ] RLS enabled and FORCE RLS applied
- [ ] Immutability constraint enforced

### UI Verification

- [ ] Bouwsubsidie KPIs display correctly
- [ ] Housing KPIs display correctly
- [ ] Audit log viewer works
- [ ] Audit log filtering works
- [ ] Minister dashboard displays correctly
- [ ] Export functionality works
- [ ] Role-based access enforced
- [ ] Darkone 1:1 compliance verified

### KPI Verification

- [ ] All KPIs calculate correctly
- [ ] Data matches database reality
- [ ] District filtering works
- [ ] Date range filtering works
- [ ] Trend calculations accurate

### Audit Verification

- [ ] All actions from Phases 1-5 visible
- [ ] Actor identification correct
- [ ] Timestamps correct
- [ ] Metadata complete
- [ ] No gaps in audit trail

---

## H. Restore Point Definition

### Restore Point Name
`phase-6-complete`

### Restore Point Contents
- All Phase 6 database migrations applied
- All Phase 6 UI components created
- Verification checklist completed
- Clean build state

### Rollback Procedure
If Phase 6 fails verification:
1. Revert to `phase-5-complete`
2. Drop `report_snapshot` table
3. Remove reporting pages
4. Report failure details
5. Await remediation instructions

---

## I. Hard Stop Statement

**MANDATORY HARD STOP AFTER PHASE 6 COMPLETION**

Upon completing Phase 6:
1. Execute all verification criteria
2. Submit completion report in standard format
3. **STOP** — Do not proceed to Phase 7
4. Await explicit written authorization from Delroy

**NO AUTO-PROCEED TO PHASE 7**

---

**End of Phase 6 Documentation**
