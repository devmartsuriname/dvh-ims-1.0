# DVH-IMS V1.2 — Audit Logging & Legal Traceability

**Version:** DVH-IMS-V1.2  
**Status:** DRAFT — Awaiting Review & Approval  
**Created:** 2026-01-24  
**Document Type:** Functional / Governance (Normative)  
**Change Policy:** No implementation without explicit approval

---

## 1. Purpose

Define what must be logged and why, to ensure legal traceability, accountability, and future auditability across DVH-IMS processes—without prescribing technical implementation.

This document establishes the normative requirements for audit logging. It does not specify SQL, triggers, edge functions, or any implementation details.

---

## 2. Scope

### In Scope

- Internal DVH dossiers: **Bouwsubsidie** and **Woning Registratie**
- Admin-side actions only (no public frontend)
- Lifecycle events, decisions, and exceptions

### Out of Scope

- Technical implementation details (SQL, triggers, edge functions)
- UI changes or notifications
- Data migrations
- Public Wizard logging (covered separately)

---

## 3. Principles

| Principle | Description |
|-----------|-------------|
| **Immutability** | Audit records are append-only. No updates or deletions. |
| **Attribution** | Every auditable action has an accountable actor (user ID + role). |
| **Chronology** | Precise ordering of events is preserved via UTC timestamps. |
| **Explainability** | Each critical action includes a rationale or justification. |
| **Separation** | Audit facts are stored separately from operational state. |

---

## 4. Audit Event Taxonomy

### A. Dossier Lifecycle Events

| Event | Description |
|-------|-------------|
| Dossier created | New dossier registered in system |
| State transition requested | Actor initiates a state change |
| State transition approved | Transition authorized by appropriate role |
| State transition rejected | Transition denied with reason |
| State transition executed | Transition completed, state changed |

### B. Decision Events

| Event | Description |
|-------|-------------|
| Review submitted | Reviewer completes assessment |
| Approval decision (APPROVED) | Positive final decision recorded |
| Approval decision (REJECTED) | Negative final decision recorded |
| Decision reversal | Exceptional correction of prior decision (if permitted) |

### C. Governance Artifacts

| Event | Description |
|-------|-------------|
| Raadsvoorstel generated | Post-approval artifact (Bouwsubsidie only; no state change) |
| Decision memo attached | Supporting documentation linked to decision |

### D. Exception & Control Events

| Event | Description |
|-------|-------------|
| Escalation invoked | Case escalated to DVH Supervisor |
| Deadline breach recorded | SLA or processing deadline exceeded |
| Manual override | Exceptional intervention outside normal workflow |

---

## 5. Mandatory Audit Fields (Conceptual)

For every audit event, the following information must be captured:

| Field | Description |
|-------|-------------|
| Event ID | Unique identifier for the audit record |
| Timestamp | UTC timestamp of event occurrence |
| Actor | User ID of the person performing the action |
| Actor Role | Role under which the actor performed the action |
| Action Type | Category/type of audit event (from taxonomy) |
| Target Entity | Dossier ID, artifact ID, or other entity reference |
| Previous State | State before transition (if applicable) |
| New State | State after transition (if applicable) |
| Rationale | Comment, justification, or reason for the action |
| Correlation ID | Identifier to group related events in a transaction |

---

## 6. Legal Traceability Requirements

The audit system must support:

1. **Reconstruction** — Ability to reconstruct who did what, when, and why for any dossier
2. **Linkage** — Clear connection between decisions and their outcomes
3. **Independence** — Verification possible without relying on mutable operational data
4. **Continuity** — Complete chronological record from intake to closure

---

## 7. Cross-Document Alignment

| Document | Relationship |
|----------|--------------|
| Roles & Authority Matrix | Determines who can generate which audit events |
| End-to-End Workflows | Defines when audit events must occur |
| Dossier State Model | Defines which transitions require audit entries |

All three documents must remain synchronized. Changes to roles, workflows, or states may require updates to audit requirements.

---

## 8. Compliance Notes

This audit framework supports:

- **Administrative law principles** — Transparency and accountability in government decision-making
- **Future statutory audit** — Prepared for formal audit by oversight bodies
- **Parliamentary inquiry** — Evidence trail for potential parliamentary review

---

## 9. Acceptance Criteria

| Criterion | Requirement |
|-----------|-------------|
| Completeness | All critical actions covered in taxonomy |
| Clarity | No ambiguity in event definitions |
| Independence | No dependency on implementation choices |
| Alignment | Consistent with Roles, Workflows, and State Model |

---

## 10. Next Steps (Non-Binding)

Future implementation phases may address:

- Mapping audit events to Supabase architecture
- Defining retention and access policies
- Aligning with notification/escalation design
- Establishing audit log query and export capabilities

These are planning considerations only.

---

## 11. Approval Gate

**This document is approved for planning only.**

No implementation of audit logging, triggers, RLS policies, edge functions, or database schema changes is authorized by this document.

Implementation requires explicit authorization from Delroy.

---

## 12. Document History

| Date | Change | Author |
|------|--------|--------|
| 2026-01-24 | Initial draft | System |
