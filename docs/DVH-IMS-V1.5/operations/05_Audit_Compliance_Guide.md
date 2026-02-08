# DVH-IMS — Audit and Compliance Guide

**Version:** V1.5 (Test & Stabilization)
**Audience:** audit role
**Status:** AS-IS operational reference — no new features

---

## 1. Audit Log Page

- Route: `/audit-log`
- Displays all records from the `audit_event` table
- The audit log is **append-only** and **immutable** — no records can be edited or deleted

### Filtering Options
| Filter | Description |
|--------|-------------|
| Date range | Filter events by `occurred_at` timestamp |
| Action | Filter by action type (e.g., CREATE, UPDATE, STATUS_CHANGE, CASE_ASSIGNED) |
| Entity type | Filter by entity (e.g., subsidy_case, person, case_assignment) |
| Actor | Filter by the user who performed the action |

---

## 2. Archive Access

- Route: `/archive`
- Contains terminal dossiers: cases that reached a final state (approved, rejected, finalized)
- National-level access: all districts visible to audit role
- Strictly read-only
- Use to verify that completed dossiers followed the correct decision chain

---

## 3. Verifying Assignment Audit Trails

Assignment-related audit events:

| Audit Action | Meaning |
|-------------|---------|
| `CASE_ASSIGNED` | A worker was assigned to a dossier |
| `CASE_REASSIGNED` | Assignment was transferred to a different worker |
| `CASE_REVOKED` | Assignment was revoked (removed) |
| `CASE_ASSIGNMENT_COMPLETED` | Assignment was marked as completed |

### What to Verify
- Every assignment action has a recorded `reason` (mandatory)
- The `actor_user_id` identifies who performed the action
- The `actor_role` confirms the actor had authority (system_admin or project_leader)
- The `entity_id` links to the specific `case_assignment` record
- The `metadata_json` contains target user and dossier references

---

## 4. Understanding Audit Event Fields

Every audit record contains:

| Field | Description |
|-------|-------------|
| `id` | Unique event identifier (UUID) |
| `occurred_at` | Timestamp of the event |
| `actor_user_id` | User who performed the action (NULL for system actions) |
| `actor_role` | Role of the actor at time of action |
| `action` | Action type (e.g., CREATE, STATUS_CHANGE, CASE_ASSIGNED) |
| `entity_type` | Type of entity affected (e.g., subsidy_case, person) |
| `entity_id` | UUID of the affected entity |
| `reason` | Justification provided by the actor (if applicable) |
| `metadata_json` | Additional structured data (varies by action) |
| `correlation_id` | Groups related events in the same operation |

---

## 5. Decision Chain Audit Verification

For Bouwsubsidie dossiers, verify the 8-step chain was followed:

| Step | Expected Audit Actions |
|------|----------------------|
| 1. Intake | CREATE (subsidy_case), DOCUMENT_VERIFIED |
| 2. Social Review | SOCIAL_ASSESSMENT_STARTED, SOCIAL_ASSESSMENT_COMPLETED |
| 3. Technical Inspection | TECHNICAL_INSPECTION_STARTED, TECHNICAL_INSPECTION_COMPLETED |
| 4. Admin Review | ADMIN_REVIEW_STARTED, ADMIN_REVIEW_COMPLETED |
| 5. Policy Review | STATUS_CHANGE (to policy review) |
| 6. Director Approval | DIRECTOR_REVIEW_STARTED, DIRECTOR_APPROVED |
| 7. Ministerial Advice | MINISTERIAL_ADVICE_STARTED, MINISTERIAL_ADVICE_COMPLETED |
| 8. Minister Decision | MINISTER_DECISION_STARTED, MINISTER_APPROVED |

Any `*_RETURNED` actions indicate the dossier was sent back to a previous step.

---

## 6. Read-Only Access Boundaries

The audit role has **read-only** access to:
- Audit log (all events, all districts)
- Archive (all terminal dossiers)
- Control Queue (view cases)
- Case Assignments (view all assignments)

---

## 7. What the Audit Role CANNOT Do

| Action | Permitted? |
|--------|-----------|
| Create, edit, or delete any records | ❌ No |
| Make decisions on dossiers | ❌ No |
| Create or modify assignments | ❌ No |
| Upload or verify documents | ❌ No |
| Submit reports | ❌ No |
| Manage users or roles | ❌ No |
| Modify audit log entries | ❌ No |
| Delete archived dossiers | ❌ No |
| Access system configuration | ❌ No |
