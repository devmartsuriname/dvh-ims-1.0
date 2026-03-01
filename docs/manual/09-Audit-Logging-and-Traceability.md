# DVH-IMS — Audit Logging and Traceability

**Document:** 09 — Audit Logging and Traceability
**Version:** V1.7
**Classification:** Official — For Ministerial Review
**Date:** March 2026

---

## 1. Overview

Every state-changing action in DVH-IMS creates an immutable audit record. The audit log is the system's legal record of all operations, decisions, and data changes. It cannot be edited or deleted — not even by system administrators.

---

## 2. Audit Event Structure

Every audit record contains:

| Field | Description |
|-------|------------|
| `id` | Unique event identifier (UUID) |
| `occurred_at` | Timestamp of the event |
| `actor_user_id` | User who performed the action (NULL for system/anonymous actions) |
| `actor_role` | Role of the actor at time of action |
| `action` | Action type (e.g., CREATE, STATUS_CHANGE, DOCUMENT_VERIFIED) |
| `entity_type` | Type of entity affected (e.g., subsidy_case, housing_registration, person) |
| `entity_id` | UUID of the affected entity |
| `reason` | Justification provided by the actor (mandatory for status changes) |
| `metadata_json` | Additional structured data (varies by action) |
| `correlation_id` | Groups related events in the same operation |

---

## 3. What Is Logged

### Subsidy Case Events

| Action | Trigger |
|--------|---------|
| CREATE | New subsidy case submitted |
| STATUS_CHANGE | Any status transition in the decision chain |
| DOCUMENT_VERIFIED | Staff verifies an uploaded document |
| SOCIAL_ASSESSMENT_STARTED | Social field worker begins report |
| SOCIAL_ASSESSMENT_COMPLETED | Social report finalized |
| TECHNICAL_INSPECTION_STARTED | Technical inspector begins report |
| TECHNICAL_INSPECTION_COMPLETED | Technical report finalized |
| ADMIN_REVIEW_STARTED | Admin staff begins review |
| ADMIN_REVIEW_COMPLETED | Admin review completed |
| DIRECTOR_REVIEW_STARTED | Director opens review |
| DIRECTOR_APPROVED | Director approves |
| DIRECTOR_RETURNED | Director returns dossier |
| MINISTERIAL_ADVICE_STARTED | Advisor opens review |
| MINISTERIAL_ADVICE_COMPLETED | Advisor submits recommendation |
| MINISTER_DECISION_STARTED | Minister opens decision |
| MINISTER_APPROVED | Minister approves |
| MINISTER_RETURNED | Minister returns dossier |

### Case Assignment Events

| Action | Trigger |
|--------|---------|
| CASE_ASSIGNED | Worker assigned to dossier |
| CASE_REASSIGNED | Assignment transferred |
| CASE_REVOKED | Assignment removed |
| CASE_ASSIGNMENT_COMPLETED | Assignment marked done |

### Housing Registration Events

| Action | Trigger |
|--------|---------|
| CREATE | New housing registration submitted |
| STATUS_CHANGE | Any status transition |
| DOCUMENT_VERIFIED | Staff verifies document |

### Person/Household Events

| Action | Trigger |
|--------|---------|
| CREATE | New person or household created |
| UPDATE | Person or household data modified |

---

## 4. Accessing the Audit Log

**URL:** https://volkshuisvesting.sr/audit-log

### Filtering Options

| Filter | Description |
|--------|------------|
| Date Range | Filter events by `occurred_at` timestamp |
| Action | Filter by action type |
| Entity Type | Filter by entity (subsidy_case, person, case_assignment, etc.) |
| Actor | Filter by the user who performed the action |

### Who Can Access

| Role | Access |
|------|--------|
| system_admin | ✅ Full access |
| project_leader | ✅ Full access |
| minister | ✅ Full access |
| director | ✅ Full access |
| ministerial_advisor | ✅ Full access |
| audit | ✅ Full access (primary user) |
| All other roles | ❌ No access |

[Screenshot: Audit Log — Filtered View]

---

## 5. Immutability Guarantees

| Guarantee | Implementation |
|-----------|---------------|
| Append-only | Only INSERT operations are permitted on `audit_event` |
| No edits | UPDATE operations are denied by database policy (RLS) |
| No deletions | DELETE operations are denied by database policy (RLS) |
| Actor attribution | `actor_user_id` is enforced to match the authenticated user |
| Preserved during resets | Audit events are never cleared during data maintenance |

---

## 6. Traceability Model

### Case-Level Traceability

For any subsidy case or housing registration, the complete history can be reconstructed by:

1. **Status History** — `subsidy_case_status_history` or `housing_registration_status_history`
   - Shows every status transition with: from → to, reason, changed_by, timestamp

2. **Audit Events** — `audit_event` filtered by `entity_id`
   - Shows every action taken on the entity: creates, updates, verifications, decisions

3. **Correlation ID** — Groups related events from the same operation
   - A single citizen submission creates multiple records (person, household, case, documents, audit events) all linked by one correlation ID

### Decision Chain Verification

For Bouwsubsidie, the complete decision chain can be verified by checking for these sequential audit events:

| Step | Expected Audit Events |
|------|----------------------|
| 1. Intake | CREATE (subsidy_case), DOCUMENT_VERIFIED |
| 2. Social Review | SOCIAL_ASSESSMENT_STARTED, SOCIAL_ASSESSMENT_COMPLETED |
| 3. Technical Review | TECHNICAL_INSPECTION_STARTED, TECHNICAL_INSPECTION_COMPLETED |
| 4. Admin Review | ADMIN_REVIEW_STARTED, ADMIN_REVIEW_COMPLETED |
| 5. Policy Review | STATUS_CHANGE (to policy review) |
| 6. Director Approval | DIRECTOR_REVIEW_STARTED, DIRECTOR_APPROVED |
| 7. Advisory Review | MINISTERIAL_ADVICE_STARTED, MINISTERIAL_ADVICE_COMPLETED |
| 8. Minister Decision | MINISTER_DECISION_STARTED, MINISTER_APPROVED |

Any `*_RETURNED` events indicate the dossier was sent back for rework.

---

## 7. Minister Deviation Logging

When the Minister's decision differs from the Ministerial Advisor's recommendation:

- The system **requires** a mandatory free-text explanation
- The deviation is recorded in:
  - `status_history.reason` (the Minister's explanation)
  - `audit_event.reason` (same explanation in audit trail)
  - `audit_event.metadata_json` (contains advisor's original recommendation for comparison)
- This deviation record is **immutable** — it cannot be modified or deleted after creation

---

## 8. Public Submission Audit

When a citizen submits an application via the public wizard:

| Audit Field | Value |
|-------------|-------|
| `actor_user_id` | NULL (anonymous submission) |
| `actor_role` | NULL |
| `action` | CREATE |
| `entity_type` | subsidy_case or housing_registration |
| `correlation_id` | UUID linking all records from this submission |
| `metadata_json` | Contains `person_reused` flag (whether existing person was matched) |

---

*End of Audit Logging and Traceability*
