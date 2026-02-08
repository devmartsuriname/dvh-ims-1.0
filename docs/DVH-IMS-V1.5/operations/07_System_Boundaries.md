# DVH-IMS — System Boundaries: What NOT To Do

**Version:** V1.5 (Test & Stabilization)
**Audience:** All roles
**Status:** AS-IS operational reference — no new features

---

## 1. No Direct Database Access

- All interactions with data MUST go through the application interface
- Direct SQL queries, Supabase dashboard edits, or API calls outside the application are prohibited
- Reason: bypassing the application bypasses RLS policies, audit logging, and workflow enforcement

---

## 2. No Manual Role Changes

- Roles are managed exclusively by `system_admin` through the application
- Do NOT insert, update, or delete records in `user_roles` directly
- Do NOT modify `app_user_profile` outside the application
- Unauthorized role changes constitute a security violation

---

## 3. No Bypassing the 8-Step Decision Chain

The Bouwsubsidie decision chain is mandatory and sequential:

1. Frontdesk Intake
2. Social Field Worker Review
3. Technical Inspector Review
4. Administrative Staff Review
5. Project Leader Policy Review
6. Director Organizational Approval
7. Ministerial Advisor Advisory Review (paraaf)
8. Minister Final Decision

- Steps cannot be skipped
- Steps cannot be executed out of order
- The system enforces this programmatically — manual overrides are not possible
- Any attempt to circumvent this chain is logged and traceable

---

## 4. Assignments Do NOT Affect Dossier Status

- Assigning a worker to a case is an operational action only
- Assignment does NOT advance, pause, or change the dossier workflow status
- Workflow transitions are triggered exclusively by decision actions within the chain
- This separation is by design for governance and auditability

---

## 5. No Automation, Notifications, or KPI Tracking

The following do NOT exist in V1.5:
- ❌ Email notifications
- ❌ SMS or push notifications
- ❌ Automated task routing
- ❌ Workload balancing
- ❌ KPI dashboards or performance metrics
- ❌ Deadline tracking or SLA monitoring
- ❌ Background jobs or scheduled tasks

All actions require manual initiation by authorized users.

---

## 6. No Citizen Accounts

- Citizens (applicants) do NOT have user accounts
- Public wizards (Bouwsubsidie application, Housing Registration) are anonymous
- Citizens can check application status via a public lookup using reference number and access token
- There is no citizen portal, login, or account management

---

## 7. No Cross-Module Data Sharing

- Bouwsubsidie and Woning Registratie are separate modules
- The ONLY shared data is:
  - **Person** registry (by national_id)
  - **Household** records
- Subsidy cases and housing registrations are independent
- No data flows between modules beyond person/household lookup
- Assignment records (`assignment_record` for Housing) and case assignments (`case_assignment` for Bouwsubsidie) are separate tables

---

## 8. Archive is Strictly Read-Only

- The Archive contains terminal dossiers (finalized, approved, or rejected)
- No records in the Archive can be modified, deleted, or reopened
- Archive access is for reference and compliance verification only
- Attempting to modify archived data is not possible through the application

---

## 9. Audit Log is Append-Only and Immutable

- The `audit_event` table accepts INSERT operations only
- UPDATE and DELETE are denied by RLS policy
- Every state-changing action in the system creates an audit record
- Audit records include: actor, role, action, entity, reason, timestamp, and metadata
- The audit log is a legal record and must not be tampered with
- Even system administrators cannot modify or delete audit entries

---

## 10. Summary of Prohibited Actions

| Prohibited Action | Reason |
|-------------------|--------|
| Direct database access | Bypasses security and audit |
| Manual role changes | Security violation |
| Skipping decision steps | Governance violation |
| Expecting assignment-driven workflow | By design: decoupled |
| Expecting automated notifications | Not implemented |
| Creating citizen accounts | Not in scope |
| Sharing data between modules | Architecture boundary |
| Modifying archived records | Immutable by design |
| Editing audit log entries | Immutable by law |
