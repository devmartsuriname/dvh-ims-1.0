# DVH-IMS — Governance Controls and Compliance

**Document:** 11 — Governance Controls and Compliance
**Version:** V1.7
**Classification:** Official — For Ministerial Review
**Date:** March 2026

---

## 1. Overview

DVH-IMS implements multiple layers of governance controls to ensure that every decision is accountable, every action is traceable, and every access is authorized. This document describes the controls that make the system suitable for government-grade operations.

---

## 2. Row-Level Security (RLS)

### What Is RLS
Row-Level Security is a database-level enforcement mechanism that restricts which data rows a user can access based on their identity and role. Even if the application interface were bypassed (e.g., direct database access), the database itself would reject unauthorized queries.

### How DVH-IMS Uses RLS

| Control | Implementation |
|---------|---------------|
| District scoping | District-scoped roles can only query rows matching their `district_code` |
| Role-based access | Each table has policies that check the user's role before allowing SELECT, INSERT, UPDATE, or DELETE |
| Audit immutability | The `audit_event` table allows INSERT only — UPDATE and DELETE are blocked |
| Service role bypass | Public Edge Functions use a service-level key that bypasses RLS (by design) for anonymous citizen submissions |

### Key Principle: Least Privilege
Every role has access to **only** what it needs — no more. A frontdesk worker in District A cannot see cases in District B. A social field worker cannot access the audit log. The audit role cannot modify any data.

---

## 3. Sequential Decision Chain Enforcement

The Bouwsubsidie 8-step decision chain is enforced programmatically:

| Enforcement | Description |
|------------|-------------|
| Status transition validation | The system checks that the case is in the correct status before allowing a transition |
| Role verification | Only the authorized role for each step can execute that step's action |
| Mandatory reason | Every status change requires a written justification |
| No step skipping | The system rejects any attempt to advance to a step that hasn't been reached sequentially |
| Audit logging | Every transition is permanently recorded |

### What Cannot Happen
- A case cannot go from SUBMITTED directly to MINISTER_DECISION
- A frontdesk worker cannot approve a case at the Director level
- A Director cannot skip the Ministerial Advisor step
- A status change without a reason is rejected by the system

---

## 4. Minister Deviation Control

When the Minister makes a decision that differs from the Ministerial Advisor's recommendation:

1. The system **detects** the deviation (compares Minister's decision with Advisor's recommendation)
2. The system **requires** a mandatory free-text explanation from the Minister
3. The deviation and explanation are **permanently recorded** in:
   - `status_history.reason`
   - `audit_event.reason`
   - `audit_event.metadata_json` (includes the Advisor's original recommendation)
4. This record is **immutable** — it cannot be modified or deleted

### Purpose
This control ensures that ministerial authority is exercised with full accountability. The Minister retains decision authority but must document any deviation from professional advice.

---

## 5. Immutable Audit Trail

| Property | Guarantee |
|----------|-----------|
| Append-only | Only INSERT is allowed on `audit_event` |
| No edits | UPDATE denied by RLS policy |
| No deletions | DELETE denied by RLS policy |
| Universal | Every state-changing action creates an audit record |
| Attributable | Every record identifies the actor (user ID + role) |
| Timestamped | Every record has an automatic `occurred_at` timestamp |
| Preserved | Audit events are never cleared during data maintenance or resets |

Even the `system_admin` role cannot modify or delete audit records. This is enforced at the database level, not the application level.

---

## 6. Status History Immutability

In addition to the audit log, both services maintain dedicated status history tables:

- `subsidy_case_status_history`
- `housing_registration_status_history`

These tables record:
- Previous status (`from_status`)
- New status (`to_status`)
- Reason for change
- Who made the change
- When the change occurred

Status history entries are append-only and provide a complete, verifiable chain of all status transitions.

---

## 7. Assignment Governance

Case assignments (worker-to-case) are governed by:

| Control | Description |
|---------|-------------|
| Restricted authority | Only `system_admin` and `project_leader` can create/modify assignments |
| Mandatory reason | Every assignment action requires a justification |
| Full audit trail | All assignment actions (assign, reassign, revoke, complete) are logged |
| Decoupled from workflow | Assignments do NOT change case status — this prevents administrative actions from influencing the decision chain |

---

## 8. Public Submission Security

Citizen submissions are processed through secure Edge Functions with:

| Control | Description |
|---------|-------------|
| Server-side validation | All input is validated using Zod schemas before database operations |
| Rate limiting | Maximum 5 submissions per hour per IP address |
| Token hashing | Security tokens are hashed (SHA-256) before storage — plain text is never stored |
| No PII in logs | Application logs do not contain personally identifiable information |
| HTTPS | All data transmitted over encrypted connections |
| Correlation IDs | Each submission receives a unique correlation ID for end-to-end traceability |

---

## 9. Data Integrity Controls

| Control | Description |
|---------|-------------|
| Foreign key constraints | All entity relationships are enforced by database foreign keys |
| Unique constraints | National IDs, reference numbers, and case numbers must be unique |
| Duplicate handling | Person records are matched by `national_id` — existing records are reused, not duplicated |
| Referential integrity | Deletion is prevented when referenced records exist (e.g., documents referencing deprecated requirements) |
| Soft deprecation | Outdated document requirements are flagged `is_active = false` rather than deleted |

---

## 10. Archive Controls

| Control | Description |
|---------|-------------|
| Read-only | No modifications permitted to archived records |
| Access restricted | Only oversight and administrative roles can view the archive |
| Complete records | Archive contains the full dossier including all documents, reports, decisions, and status history |
| Retention | Records are retained indefinitely for compliance and audit purposes |

---

## 11. Compliance Summary

| Compliance Area | Status |
|----------------|--------|
| Audit trail completeness | ✅ Every action logged |
| Decision chain enforcement | ✅ Sequential, non-bypassable |
| Role-based access control | ✅ 11 roles with least-privilege |
| Data scoping | ✅ District-level RLS enforcement |
| Ministerial accountability | ✅ Deviation logging with mandatory explanation |
| Document integrity | ✅ Version-controlled uploads with verification tracking |
| Archive immutability | ✅ Read-only terminal dossiers |
| Personal data protection | ✅ Token hashing, no PII in logs, HTTPS |

---

*End of Governance Controls and Compliance*
