# DVH-IMS V1.2 — Notifications, Reminders & Escalation Rules

**Version:** DVH-IMS-V1.2  
**Status:** DRAFT — Awaiting Review & Approval  
**Created:** 2026-01-24  
**Document Type:** Functional / Governance (Normative)  
**Change Policy:** No implementation without explicit approval

---

## 1. Purpose

This document defines the normative rules for notifications, reminders, and escalations within DVH-IMS-V1.2. It specifies when, to whom, and under which conditions communication obligations arise during dossier processing.

This document is **planning and governance only**. It does not prescribe technical implementations, UI behavior, or delivery channels.

---

## 2. Scope & Boundaries

### 2.1 In Scope

- Internal DVH dossiers:
  - Bouwsubsidie
  - Woning Registratie
- Role-based notifications
- Time-based reminders
- Escalation triggers and authority paths
- Mandatory audit implications

### 2.2 Explicitly Out of Scope

- Technical delivery mechanisms (email, SMS, push, etc.)
- UI components or screens
- Database schemas or RLS policies
- Public-facing notifications

---

## 3. Guiding Principles

| Principle | Description |
|-----------|-------------|
| **Role-based, never person-based** | Notifications target roles, not individual users |
| **State-driven** | Linked to Dossier State Model transitions |
| **Deadline-aware** | Timeboxed states with soft/hard thresholds |
| **Escalations are auditable** | Governance events with full traceability |
| **No silent failures** | Every missed obligation leads to a defined outcome |

---

## 4. Notification Types

### 4.1 Informational Notifications

Triggered when a dossier enters a new significant state.

**Examples:**
- Dossier accepted for review
- Dossier assigned to a role
- Decision registered

**Characteristics:**
- Single delivery
- No follow-up required
- Logged as audit events

### 4.2 Reminders

Triggered when a dossier remains in a state beyond its soft deadline.

**Characteristics:**
- Repeating until state change or escalation
- Addressed to the current responsible role
- Logged as audit events

### 4.3 Escalations

Triggered when a dossier exceeds a hard deadline.

**Characteristics:**
- Authority-level notification
- May change responsibility or oversight
- Always logged as **critical audit events**

---

## 5. Deadline Model (Normative)

Each dossier state may define:

| Threshold Type | Trigger | Outcome |
|----------------|---------|---------|
| **Soft deadline** | Reminder threshold | Reminder notification to handler role |
| **Hard deadline** | Escalation threshold | Escalation notification to supervisory role |

Deadlines are defined per:
- **Dossier type** (Bouwsubsidie vs Woning Registratie)
- **State**

**Constraint:** No deadlines exist outside defined states.

---

## 6. Role-Based Notification Matrix (Conceptual)

| Event Type | Recipient Role | Notes |
|------------|----------------|-------|
| State entry | Assigned handler role | Informational |
| Soft deadline exceeded | Same handler role | Reminder |
| Hard deadline exceeded | Supervisory role | Escalation |
| Decision finalized | Audit / Read-only | Informational |

> Exact roles are defined in the **Roles & Authority Matrix** document.

---

## 7. Service-Specific Rules

### 7.1 Bouwsubsidie

- Escalations may lead to mandatory supervisory review
- Final approval triggers downstream steps including Raadvoorstel generation (outside this document)

### 7.2 Woning Registratie

- No Raadvoorstel-related notifications
- Escalations limited to administrative and supervisory oversight

---

## 8. Audit & Legal Traceability

All notifications, reminders, and escalations:

- **MUST** generate audit events
- **MUST** record:
  - Trigger reason
  - Related dossier state
  - Recipient role
  - Timestamp

**Escalations** are classified as **governance-critical events**.

> Cross-reference: DVH-IMS-V1.2_Audit_and_Legal_Traceability.md

---

## 9. Governance Rules

| Rule | Enforcement |
|------|-------------|
| No notification may be sent outside defined rules | Mandatory |
| No escalation may occur without audit logging | Mandatory |
| No manual overrides without traceable justification | Mandatory |

---

## 10. Status

This document is:

- **Normative** for DVH-IMS-V1.2 planning
- Subject to joint review and approval
- Required input for later implementation phases

---

## Cross-Document Dependencies

| Document | Relationship |
|----------|--------------|
| DVH-IMS-V1.2_Roles_and_Authority_Matrix.md | Defines recipient roles |
| DVH-IMS-V1.2_End_to_End_Workflows.md | Defines state transitions triggering notifications |
| DVH-IMS-V1.2_Dossier_State_Model.md | Defines states with deadline thresholds |
| DVH-IMS-V1.2_Audit_and_Legal_Traceability.md | Defines audit event requirements |

---

## Approval Gate

This document is approved for **planning only**.

Implementation (schema, triggers, UI, delivery mechanisms) requires **explicit authorization**.

---

**END OF DOCUMENT**
