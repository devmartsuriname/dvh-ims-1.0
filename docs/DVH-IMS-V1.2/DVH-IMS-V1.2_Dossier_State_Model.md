# DVH-IMS V1.2 — Dossier State Machine & Transition Rules

**Version:** DVH-IMS-V1.2  
**Status:** DRAFT — Awaiting Review & Approval  
**Created:** 2026-01-24  
**Document Type:** Functional / Governance (Normative)  
**Change Policy:** No implementation without explicit approval

---

## 1. Purpose of This Document

This document defines the authoritative dossier state machine for DVH-IMS V1.2.

It specifies:

- All valid dossier states
- Allowed transitions between states
- Which roles are permitted to trigger each transition
- Mandatory audit and justification requirements

This document is normative input for:

- Workflow enforcement
- Supabase RLS policy design
- Audit logging & legal traceability

**Documentation only. No system changes are authorized by this document.**

---

## 2. Scope Boundaries

### In Scope

- Internal DVH dossiers (Bouwsubsidie & Woning Registratie)
- Administrative lifecycle states
- Decision, escalation, and closure paths

### Explicitly Out of Scope

- Public Wizard behavior (already implemented)
- Notifications & reminders
- Automated decisions

---

## 3. State Model Overview

A dossier may exist in exactly one state at any given time.

```
DRAFT
  ↓
SUBMITTED
  ↓
REVIEW_APPROVED ──┐
  ↓               │
APPROVED          │
  ↓               │
CLOSED_APPROVED   │
                  │
REVISION_REQUESTED◄┘
  ↓
SUBMITTED

REJECTED → CLOSED_REJECTED
ESCALATED → RESOLVED → (APPROVED | REJECTED)
```

---

## 4. Canonical Dossier States

| State | Description | Editable | Terminal |
|-------|-------------|----------|----------|
| DRAFT | Created but not submitted | Yes | No |
| SUBMITTED | Submitted for review | No | No |
| REVIEW_APPROVED | Passed verification | No | No |
| REVISION_REQUESTED | Returned for correction | Yes | No |
| APPROVED | Approved by authority | No | No |
| REJECTED | Rejected by authority | No | No |
| ESCALATED | Sent to supervisor | No | No |
| RESOLVED | Escalation resolved | No | No |
| CLOSED_APPROVED | Final approved archive | No | Yes |
| CLOSED_REJECTED | Final rejected archive | No | Yes |

---

## 5. Allowed State Transitions

| From State | To State | Triggering Role | Conditions |
|------------|----------|-----------------|------------|
| DRAFT | SUBMITTED | DVH Operator | Completeness check passed |
| SUBMITTED | REVIEW_APPROVED | DVH Reviewer | All checks valid |
| SUBMITTED | REVISION_REQUESTED | DVH Reviewer | Missing/invalid data |
| REVIEW_APPROVED | APPROVED | DVH Decision Officer | Positive decision |
| REVIEW_APPROVED | REJECTED | DVH Decision Officer | Negative decision |
| REVIEW_APPROVED | ESCALATED | DVH Decision Officer | Exception case |
| ESCALATED | RESOLVED | DVH Supervisor | Escalation handled |
| APPROVED | CLOSED_APPROVED | System | Post-decision finalization |
| REJECTED | CLOSED_REJECTED | System | Post-decision finalization |
| REVISION_REQUESTED | SUBMITTED | DVH Operator | Corrections applied |

---

## 6. Invalid Transitions (Explicitly Forbidden)

The following transitions must never occur:

- `CLOSED_*` → any other state
- `DRAFT` → `APPROVED` / `REJECTED`
- `SUBMITTED` → `APPROVED` (bypassing review)
- Any user-triggered transition to `CLOSED_*` states

**Any attempt must be logged as a security violation.**

---

## 7. Role Enforcement Rules

| Role | Allowed States |
|------|----------------|
| DVH Operator | DRAFT, REVISION_REQUESTED |
| DVH Reviewer | SUBMITTED |
| DVH Decision Officer | REVIEW_APPROVED |
| DVH Supervisor | ESCALATED |
| Auditor | Read-only (all states) |

---

## 8. Audit & Legal Traceability Requirements

Every state transition MUST record:

| Attribute | Required |
|-----------|----------|
| Dossier ID | ✅ |
| Previous State | ✅ |
| New State | ✅ |
| Acting Role | ✅ |
| User ID | ✅ |
| Timestamp | ✅ |
| Justification | Conditional |

**Audit records are immutable.**

---

## 9. Relationship to Other Documents

### This document is dependent on:

- DVH-IMS-V1.2 — End-to-End Workflow Definitions
- DVH-IMS-V1.2 — Roles, Departments & Authority Matrix

### This document feeds into:

- Supabase RLS Policy Design
- Audit Logging & Legal Traceability

---

## 10. Approval Gate

Until explicitly approved:

- ❌ No state enforcement
- ❌ No RLS changes
- ❌ No schema changes
- ❌ No workflow logic

**Approval of this document is mandatory before any implementation.**

---

**End of Document**
