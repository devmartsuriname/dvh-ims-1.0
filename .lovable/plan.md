

# DVH-IMS V1.5 — Test and Stabilization: Operational Documentation Package

**Type:** Documentation-only (no code changes)
**Status:** Test and Stabilization Window — NO new features

---

## Deliverables — 7 Documents

All files created under `docs/DVH-IMS-V1.5/operations/`

### 1. Admin Manual (`01_Admin_Manual.md`)
**Audience:** system_admin, project_leader

Covers:
- User management (creating accounts, assigning roles via user_roles table)
- Role model overview (11 roles, national vs district-scoped)
- Module overview (Bouwsubsidie, Woning Registratie, Allocation Engine)
- Case Assignments management (assign, reassign, revoke workers)
- Archive access and audit log review
- Schedule Visits overview
- Dashboard usage

### 2. Frontdesk Working Instructions (`02_Frontdesk_Instructions.md`)
**Audience:** frontdesk_bouwsubsidie, frontdesk_housing

Covers:
- Bouwsubsidie frontdesk: intake processing, subsidy case creation, control queue usage
- Housing frontdesk: registration processing, waiting list management, allocation decisions
- Shared core: person and household lookup
- What frontdesk roles CANNOT do (no assignments, no decisions, no archive)

### 3. Field Worker Flows (`03_Field_Worker_Flows.md`)
**Audience:** social_field_worker, technical_inspector

Covers:
- My Visits page usage
- Control Queue (read access)
- Viewing assigned cases via Case Assignments
- Submitting social reports (social_field_worker)
- Submitting technical inspection reports (technical_inspector)
- What field workers CANNOT do (no assignments, no decisions, no schedule management)

### 4. Director and Minister Read-Only Guide (`04_Director_Minister_Guide.md`)
**Audience:** director, ministerial_advisor, minister

Covers:
- Dashboard overview access
- Control Queue (read-only oversight)
- Subsidy Cases (read-only, decision authority per workflow)
- Case Assignments (read-only oversight)
- Archive access (national-level, read-only)
- Audit Log access
- What oversight roles CANNOT do (no assignments, no data mutations)

### 5. Audit and Compliance Guide (`05_Audit_Compliance_Guide.md`)
**Audience:** audit role

Covers:
- Audit Log page: filtering by date, action, entity type, actor
- Archive: accessing terminal dossiers (finalized/rejected)
- Verifying assignment audit trails (CASE_ASSIGNED, CASE_REASSIGNED, etc.)
- Understanding audit event fields (actor, action, entity, reason, metadata)
- Read-only access boundaries
- What the audit role CANNOT do (no mutations of any kind)

### 6. Bug Reporting and Incident Handling (`06_Bug_Reporting_Process.md`)
**Audience:** All roles

Covers:
- How to report a bug (what to include: steps, role, expected vs actual)
- Severity classification (critical, major, minor)
- Authorized fix scope during stabilization (functional/UX defects only)
- Escalation path (report to Delroy)
- What is NOT a bug (feature requests, scope expansion)

### 7. System Boundaries — What NOT To Do (`07_System_Boundaries.md`)
**Audience:** All roles

Covers:
- No direct database access outside the application
- No manual role changes without system_admin authorization
- No bypassing the 8-step decision chain
- Assignments do NOT affect dossier status
- No automation, notifications, or KPI tracking exists
- No citizen accounts — public wizards are anonymous
- No cross-module data sharing beyond Person/Household
- Archive is strictly read-only
- Audit log is append-only and immutable

---

## Governance Compliance

- All documents reflect the system AS-IS (V1.5 Phase 1 + Phase 2)
- No code changes included
- No new features described or implied
- Period clearly marked as "Test and Stabilization"

