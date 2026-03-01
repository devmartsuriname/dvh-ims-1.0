# DVH-IMS — Status Lifecycle and Decision Flows

**Document:** 07 — Status Lifecycle and Decision Flows
**Version:** V1.7
**Classification:** Official — For Ministerial Review
**Date:** March 2026

---

## 1. Bouwsubsidie Status Lifecycle

### State Diagram

```
SUBMITTED
    │
    ▼
IN_REVIEW (Frontdesk intake)
    │
    ▼
SOCIAL_REVIEW (Social field worker assessment)
    │
    ▼
TECHNICAL_REVIEW (Technical inspector)
    │
    ▼
ADMIN_REVIEW (Administrative staff)
    │
    ▼
POLICY_REVIEW (Project leader)
    │
    ▼
DIRECTOR_REVIEW
    │
    ├──→ DIRECTOR_APPROVED ──→ ADVISOR_REVIEW
    │                              │
    │                              ├──→ ADVISOR_REVIEWED ──→ MINISTER_DECISION
    │                              │                              │
    │                              │                              ├──→ MINISTER_APPROVED ──→ [Raadvoorstel Generated] ──→ CLOSED_APPROVED
    │                              │                              │
    │                              │                              └──→ MINISTER_RETURNED ──→ (back to earlier step)
    │                              │
    │                              └──→ ADVISOR_RETURNED ──→ (back to earlier step)
    │
    └──→ DIRECTOR_RETURNED ──→ (back to earlier step)

At any step, REJECTED is a possible terminal status.
```

### Transition Rules

| From | To | Authorized Role | Mandatory Reason |
|------|-----|----------------|:---:|
| SUBMITTED | IN_REVIEW | frontdesk_bouwsubsidie | ✅ |
| IN_REVIEW | SOCIAL_REVIEW | frontdesk_bouwsubsidie, system_admin | ✅ |
| SOCIAL_REVIEW | TECHNICAL_REVIEW | system_admin, project_leader | ✅ |
| TECHNICAL_REVIEW | ADMIN_REVIEW | system_admin, project_leader | ✅ |
| ADMIN_REVIEW | POLICY_REVIEW | admin_staff | ✅ |
| POLICY_REVIEW | DIRECTOR_REVIEW | project_leader | ✅ |
| DIRECTOR_REVIEW | DIRECTOR_APPROVED | director | ✅ |
| DIRECTOR_REVIEW | DIRECTOR_RETURNED | director | ✅ |
| DIRECTOR_APPROVED | ADVISOR_REVIEW | system_admin, project_leader | ✅ |
| ADVISOR_REVIEW | ADVISOR_REVIEWED | ministerial_advisor | ✅ |
| ADVISOR_REVIEW | ADVISOR_RETURNED | ministerial_advisor | ✅ |
| ADVISOR_REVIEWED | MINISTER_DECISION | system_admin, project_leader | ✅ |
| MINISTER_DECISION | MINISTER_APPROVED | minister | ✅ |
| MINISTER_DECISION | MINISTER_RETURNED | minister | ✅ |
| MINISTER_APPROVED | CLOSED_APPROVED | system (after Raadvoorstel) | — |
| Any active status | REJECTED | authorized role per step | ✅ |

### Key Rules
- Steps **cannot** be skipped — the system enforces sequential execution
- Every transition creates a `status_history` entry and an `audit_event`
- A reason is **mandatory** for every transition
- **RETURNED** statuses send the case back to an earlier step for rework
- The Minister's deviation from advisor recommendation triggers a mandatory explanation field

---

## 2. Housing Registration Status Lifecycle

### State Diagram

```
SUBMITTED
    │
    ▼
IN_REVIEW (Frontdesk review)
    │
    ├──→ APPROVED ──→ WAITLISTED
    │                      │
    │                      ▼
    │                 ALLOCATED (via Allocation Engine)
    │                      │
    │                      ▼
    │                 ASSIGNED (housing unit assigned)
    │
    └──→ REJECTED (terminal)
```

### Transition Rules

| From | To | Authorized Role | Mandatory Reason |
|------|-----|----------------|:---:|
| SUBMITTED | IN_REVIEW | frontdesk_housing | ✅ |
| IN_REVIEW | APPROVED | frontdesk_housing, system_admin | ✅ |
| IN_REVIEW | REJECTED | frontdesk_housing, system_admin | ✅ |
| APPROVED | WAITLISTED | system (automatic) | — |
| WAITLISTED | ALLOCATED | system (allocation engine) | — |
| ALLOCATED | ASSIGNED | system_admin, project_leader | ✅ |

---

## 3. Decision Authority Summary

### Bouwsubsidie

| Decision Level | Role | Authority |
|---------------|------|-----------|
| Intake acceptance | frontdesk_bouwsubsidie | Accept or flag application |
| Social assessment | social_field_worker | Submit finalized report |
| Technical inspection | technical_inspector | Submit finalized report |
| Administrative completeness | admin_staff | Confirm or flag |
| Policy compliance | project_leader | Confirm or flag |
| Organizational approval | director | Approve or return |
| Advisory recommendation | ministerial_advisor | Recommend with paraaf |
| Final decision | minister | Approve or return |

### Housing Registration

| Decision Level | Role | Authority |
|---------------|------|-----------|
| Registration review | frontdesk_housing | Approve or reject |
| Allocation matching | system (engine) | Automated ranking |
| Allocation decision | system_admin, project_leader | Accept or reject candidates |
| Housing assignment | system_admin, project_leader | Register final assignment |

---

## 4. Terminal Statuses

| Service | Terminal Statuses |
|---------|-----------------|
| Bouwsubsidie | CLOSED_APPROVED, REJECTED |
| Housing Registration | ASSIGNED, REJECTED |

Terminal cases move to the **Archive** for permanent read-only retention.

---

## 5. Return (Rework) Flows

When a decision-maker **returns** a dossier:

1. The status changes to a `*_RETURNED` value
2. A mandatory reason is recorded
3. The case reverts to an earlier workflow step
4. All transitions and reasons are preserved in the audit trail
5. The case must re-traverse the chain from the return point

This ensures that no decision is silently overridden — every return and re-approval is fully traceable.

---

*End of Status Lifecycle and Decision Flows*
