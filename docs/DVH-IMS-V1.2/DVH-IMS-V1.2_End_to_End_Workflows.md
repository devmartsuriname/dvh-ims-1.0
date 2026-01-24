# DVH-IMS V1.2 — End-to-End Workflow Definitions

**Version:** DVH-IMS-V1.2  
**Status:** DRAFT — Awaiting Review & Approval  
**Created:** 2026-01-24  
**Document Type:** Functional / Governance (Normative)  
**Change Policy:** No implementation without explicit approval

---

## 1. Purpose of This Document

This document defines the end-to-end operational workflows for DVH-IMS-V1.2.

It describes:

- How a dossier enters the system
- How it moves between roles and departments
- Where reviews, decisions, and escalations occur
- Which role is responsible at each step

This document is normative for:

- Workflow enforcement
- State machine design
- RLS alignment
- Audit logging

> **This is a documentation-only artifact. No system changes are authorized by this document.**

---

## 2. Scope Boundaries

### 2.1 In Scope

- Internal DVH workflows
- Administrative and decision-making processes
- Exception handling and escalation paths

### 2.2 Explicitly Out of Scope

- Citizen-facing public wizard (already implemented; unchanged)
- External ministry workflows
- Automated decision engines
- Notifications (defined in a separate document)

---

## 3. Core Workflow Actors

This document relies on the approved roles defined in:

> **DVH-IMS-V1.2 — Roles, Departments & Authority Matrix**

**Primary actors:**

| Actor | Workflow Role |
|-------|---------------|
| DVH Operator | Intake & Creation |
| DVH Reviewer | Review & Verification |
| DVH Decision Officer | Decision Phase |
| DVH Supervisor | Escalation Handling |
| Auditor | Read-only (all phases) |
| System Administrator | Out of workflow |

---

## 4. High-Level Workflow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. Intake & Creation                                           │
│         │                                                       │
│         ▼                                                       │
│  2. Internal Review & Verification                              │
│         │                                                       │
│         ├──── REVISION_REQUESTED ────► Back to Operator         │
│         │                                                       │
│         ▼                                                       │
│  3. Decision Phase                                              │
│         │                                                       │
│         ├──── ESCALATED ────► 5. Escalation Handling            │
│         │                                                       │
│         ▼                                                       │
│  4. Post-Decision Handling                                      │
│         │                                                       │
│         ▼                                                       │
│  6. Closure & Archival                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Each phase is strictly role-bound and auditable.

---

## 5. Detailed Workflow Phases

### 5.1 Intake & Dossier Creation

| Attribute | Value |
|-----------|-------|
| **Responsible Role** | DVH Operator |
| **Department** | Case Management |

**Actions:**

- Create new dossier
- Capture applicant data
- Attach required documentation
- Submit dossier for review

**Rules:**

- Operator cannot approve or reject
- All actions must be logged

**Output:**

- Dossier state: `SUBMITTED`

---

### 5.2 Review & Verification

| Attribute | Value |
|-----------|-------|
| **Responsible Role** | DVH Reviewer |
| **Department** | Review & Verification Unit |

**Actions:**

- Verify completeness
- Validate documentation
- Flag inconsistencies
- Request corrections (send back)

**Rules:**

- Reviewer cannot modify original data
- Reviewer cannot approve or reject

**Possible Outcomes:**

| Outcome | Next State |
|---------|------------|
| Review passed | `REVIEW_APPROVED` |
| Corrections needed | `REVISION_REQUESTED` |

---

### 5.3 Decision Phase

| Attribute | Value |
|-----------|-------|
| **Responsible Role** | DVH Decision Officer |
| **Department** | Decision Authority Unit |

**Actions:**

- Approve dossier
- Reject dossier
- Escalate dossier

**Rules:**

- Decision Officer cannot edit dossier data
- All decisions must include justification

**Possible Outcomes:**

| Outcome | Next State |
|---------|------------|
| Approved | `APPROVED` |
| Rejected | `REJECTED` |
| Escalated | `ESCALATED` |

---

### 5.4 Escalation Handling

| Attribute | Value |
|-----------|-------|
| **Responsible Role** | DVH Supervisor |
| **Department** | DVH Administration |

**Triggers:**

- Exceptional cases
- Conflicting reviews
- Policy ambiguities

**Actions:**

- Review full dossier history
- Override decision (if necessary)
- Resolve escalation

**Rules:**

- Supervisor actions are exceptional
- Mandatory audit trail required

---

### 5.5 Post-Decision & Closure

| Attribute | Value |
|-----------|-------|
| **Responsible Role** | System (state enforcement) |

**Actions:**

- Lock dossier from further modification
- Mark dossier as closed
- Make dossier available for audit

**Final States:**

| State | Description |
|-------|-------------|
| `CLOSED_APPROVED` | Dossier approved and archived |
| `CLOSED_REJECTED` | Dossier rejected and archived |

---

## 6. Audit & Traceability

For every workflow transition:

| Requirement | Mandatory |
|-------------|-----------|
| Actor role recorded | ✅ |
| Timestamp logged | ✅ |
| Previous state stored | ✅ |
| Next state stored | ✅ |
| Justification (where applicable) | ✅ |

Auditors have read-only access to the full lifecycle.

---

## 7. Relationship to V1.1

| Aspect | Status |
|--------|--------|
| Workflow enforcement | Not applied retroactively |
| Existing V1.1 behavior | Unchanged |
| Purpose | Prepares controlled evolution toward V1.2 |

---

## 8. Dependent Documents

This document feeds into:

| Document | Dependency Type |
|----------|-----------------|
| Dossier State Machine & Transition Rules | Direct input |
| Supabase RLS Policy Design | Alignment required |
| Audit Logging & Legal Traceability | Logging requirements |
| Notification & Escalation Rules | Trigger definitions |

---

## 9. Approval Gate

This document requires:

- Internal review
- Explicit approval

**Until approved:**

| Restriction | Status |
|-------------|--------|
| No workflow enforcement | ⛔ Blocked |
| No RLS updates | ⛔ Blocked |
| No schema changes | ⛔ Blocked |

---

**End of Document**
