# DVH-IMS V1.2 — Backend Design Overview

**Version:** DVH-IMS-V1.2  
**Status:** DRAFT — Optional Planning Document  
**Created:** 2026-01-24  
**Document Type:** Design / Backend Architecture (Non-Authoritative)  
**Change Policy:** This document does not authorize implementation

---

## 1. Purpose

This document describes the logical backend components of DVH-IMS-V1.2 at a design level. It aligns with the Architecture Overview and Services Module Decomposition to provide a unified view of backend structure.

**This is a design artifact only. No SQL, Supabase policies, edge functions, or API definitions are included.**

---

## 2. Design Principles

The backend design adheres to the following principles from the Architecture Overview:

| Principle | Backend Implication |
|-----------|---------------------|
| Separation of Concerns | Distinct layers for control, services, workflow, and audit |
| Audit-by-Design | Every state change generates an audit event |
| Authority-Driven Flow | Actions validated by role and mandate |
| Service Isolation | Each service has explicit scope and boundaries |
| No Implicit Coupling | Cross-service interaction is explicit |

---

## 3. Backend Layers

The backend is organized into logical layers as defined in the Architecture Overview:

### 3.1 Application Control Layer

**Purpose:** Coordinates workflows, validates actions, and enforces authority rules.

| Component | Responsibility |
|-----------|----------------|
| Request Validator | Validates incoming action requests |
| Authority Checker | Verifies role-based permissions |
| Workflow Orchestrator | Coordinates service invocations |
| State Transition Controller | Delegates to Workflow Engine |

**Key Rule:** No service may execute without control layer validation.

### 3.2 Domain Services Layer

**Purpose:** Contains independent services aligned to DVH mandates.

| Service Category | Services |
|------------------|----------|
| Shared Core | Intake, Dossier Management, Review & Assessment, Decision, Audit & Traceability |
| Bouwsubsidie-Specific | Financial Assessment, Raadvoorstel Generation, Subsidy Allocation |
| Woning Registratie-Specific | Registration Validation, Registry Recording |
| Cross-Cutting | Notification Orchestration, Role & Authority Enforcement |

### 3.3 Workflow & State Engine

**Purpose:** Provides deterministic progression of dossiers through predefined states.

| Component | Responsibility |
|-----------|----------------|
| State Machine | Manages allowed states and transitions |
| Transition Validator | Rejects illegal transitions |
| Event Emitter | Generates audit events for transitions |

**Dependency Rule:** Services may request transitions; only the workflow engine can approve them.

### 3.4 Audit & Legal Trace Layer

**Purpose:** Guarantees legal defensibility of all actions.

| Component | Responsibility |
|-----------|----------------|
| Event Capture | Records all mutations |
| Actor Identifier | Links actions to authenticated users |
| Timestamp Service | Provides authoritative timestamps |
| State Snapshot | Records before/after state |

**Non-Negotiable Rule:** No mutation occurs without an audit event.

### 3.5 Data Persistence Layer

**Purpose:** Persistent storage of dossiers, decisions, and evidence.

| Component | Responsibility |
|-----------|----------------|
| Dossier Repository | Stores dossier lifecycle data |
| Decision Repository | Stores formal decisions |
| Evidence Repository | Stores attached documents and evidence |
| Audit Repository | Stores immutable audit events |

**Constraint:** All writes pass through control and audit layers.

---

## 4. Core Services (Shared)

These services apply to both Bouwsubsidie and Woning Registratie modules:

### 4.1 Intake Service

| Aspect | Description |
|--------|-------------|
| Purpose | Receives and validates new dossier submissions |
| Input | Dossier submission data |
| Output | Created dossier in DRAFT or SUBMITTED state |
| Authority | DVH Operator |
| Audit | Dossier creation event logged |

### 4.2 Dossier Management Service

| Aspect | Description |
|--------|-------------|
| Purpose | Manages dossier lifecycle and evidence association |
| Input | Dossier updates, evidence attachments |
| Output | Updated dossier state |
| Authority | DVH Operator, DVH Reviewer |
| Audit | All modifications logged |

### 4.3 Review & Assessment Service

| Aspect | Description |
|--------|-------------|
| Purpose | Executes review logic and prepares assessments |
| Input | Dossier data for review |
| Output | Review outcome (REVIEW_APPROVED or REVISION_REQUESTED) |
| Authority | DVH Reviewer |
| Audit | Review decision logged |

### 4.4 Decision Service

| Aspect | Description |
|--------|-------------|
| Purpose | Executes formal approval or rejection decisions |
| Input | Reviewed dossier |
| Output | APPROVED, REJECTED, or ESCALATED state |
| Authority | DVH Decision Officer |
| Audit | Decision with rationale logged |

### 4.5 Audit & Traceability Service

| Aspect | Description |
|--------|-------------|
| Purpose | Captures and stores immutable audit events |
| Input | Mutation events from all services |
| Output | Stored audit records |
| Authority | System-level (no human trigger) |
| Audit | Self-logging |

---

## 5. Bouwsubsidie-Specific Services

These services apply only to the Bouwsubsidie module:

### 5.1 Financial Assessment Service

| Aspect | Description |
|--------|-------------|
| Purpose | Evaluates financial eligibility and requested amounts |
| Input | Applicant financial data |
| Output | Financial assessment result |
| Authority | DVH Reviewer, DVH Decision Officer |
| Audit | Assessment logged |

### 5.2 Raadvoorstel Generation Service

| Aspect | Description |
|--------|-------------|
| Purpose | Generates Raadvoorstel artifact after approval |
| Input | Approved Bouwsubsidie dossier |
| Output | Raadvoorstel document (artifact, not state) |
| Authority | System (triggered post-approval) |
| Audit | Generation event logged |

**Note:** Only Bouwsubsidie dossiers generate Raadvoorstel. Woning Registratie does not.

### 5.3 Subsidy Allocation Service

| Aspect | Description |
|--------|-------------|
| Purpose | Manages subsidy allocation after Raadvoorstel |
| Input | Approved subsidy with Raadvoorstel |
| Output | Allocation record |
| Authority | DVH Decision Officer, DVH Supervisor |
| Audit | Allocation logged |

---

## 6. Woning Registratie-Specific Services

These services apply only to the Woning Registratie module:

### 6.1 Registration Validation Service

| Aspect | Description |
|--------|-------------|
| Purpose | Validates housing registration eligibility |
| Input | Registration submission data |
| Output | Validation result |
| Authority | DVH Operator, DVH Reviewer |
| Audit | Validation logged |

### 6.2 Registry Recording Service

| Aspect | Description |
|--------|-------------|
| Purpose | Records approved registrations in housing registry |
| Input | Approved registration dossier |
| Output | Registry entry |
| Authority | DVH Decision Officer |
| Audit | Recording logged |

**Note:** Woning Registratie does not generate Raadvoorstel artifacts.

---

## 7. Audit Logging Flow (Conceptual)

The following describes the conceptual flow of audit logging:

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER ACTION REQUEST                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              APPLICATION CONTROL LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Validate   │→ │   Check      │→ │  Orchestrate │          │
│  │   Request    │  │   Authority  │  │   Workflow   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DOMAIN SERVICE LAYER                           │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Execute Service Logic                    │      │
│  │         (with pre/post state capture)                │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                WORKFLOW & STATE ENGINE                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Validate   │→ │   Execute    │→ │    Emit      │          │
│  │  Transition  │  │  Transition  │  │ Audit Event  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              AUDIT & LEGAL TRACE LAYER                          │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                  Capture Event                        │      │
│  │  • Event ID          • Actor Role                    │      │
│  │  • Timestamp         • Target Entity                 │      │
│  │  • Action Type       • Previous/New State            │      │
│  │  • Rationale         • Correlation ID                │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATA PERSISTENCE LAYER                             │
│  ┌──────────────────────────────────────────────────────┐      │
│  │            Store Immutable Audit Record               │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Audit Event Fields (Conceptual)

| Field | Description |
|-------|-------------|
| Event ID | Unique identifier for the event |
| Timestamp | When the event occurred |
| Actor User ID | Authenticated user who triggered action |
| Actor Role | Role of the actor at time of action |
| Action Type | Type of action performed |
| Target Entity | Entity affected by the action |
| Previous State | State before the action |
| New State | State after the action |
| Rationale | Justification for the action |
| Correlation ID | Links related events in a workflow |

---

## 8. Notification Trigger Points (Design-Level)

The following describes conceptual trigger points for notifications:

### 8.1 Trigger Categories

| Category | Trigger Point | Recipients |
|----------|---------------|------------|
| Informational | State transition occurs | Relevant role holders |
| Reminder | Soft deadline approaching | Assigned officer |
| Escalation | Hard deadline breached | Supervisor |

### 8.2 State-Based Triggers

| From State | To State | Notification Type |
|------------|----------|-------------------|
| SUBMITTED | IN_REVIEW | Informational (Reviewer) |
| IN_REVIEW | REVIEW_APPROVED | Informational (Decision Officer) |
| IN_REVIEW | REVISION_REQUESTED | Informational (Operator) |
| REVIEW_APPROVED | ESCALATED | Escalation (Supervisor) |
| Any | APPROVED | Informational (All stakeholders) |
| Any | REJECTED | Informational (All stakeholders) |

### 8.3 Time-Based Triggers

| Condition | Trigger | Recipients |
|-----------|---------|------------|
| Soft deadline - 2 days | Reminder | Assigned officer |
| Soft deadline reached | Reminder | Assigned officer, Supervisor |
| Hard deadline breached | Escalation | Supervisor, DVH Leadership |

### 8.4 Notification Audit

All notifications must generate audit events:

| Audit Field | Captured Data |
|-------------|---------------|
| Trigger Reason | Why notification was sent |
| Trigger State | Dossier state at trigger time |
| Recipient Role | Role-based recipient (not person) |
| Timestamp | When notification was triggered |

---

## 9. Authority Enforcement Points

The following describes where authority is enforced in the backend:

### 9.1 Control Layer Enforcement

| Check Point | Enforcement |
|-------------|-------------|
| Request Validation | User is authenticated |
| Authority Check | User has required role for action |
| Scope Check | User has access to target entity (district/department) |

### 9.2 Service Layer Enforcement

| Check Point | Enforcement |
|-------------|-------------|
| Pre-Execution | Role permits service invocation |
| Execution | Action is within role boundaries |
| Post-Execution | Result is audited with actor information |

### 9.3 Workflow Engine Enforcement

| Check Point | Enforcement |
|-------------|-------------|
| Transition Request | Role can trigger this transition |
| Transition Execution | Transition is valid for current state |
| Event Emission | Actor information captured in audit |

---

## 10. Explicit Exclusions

The following are explicitly excluded from this document:

| Exclusion | Reason |
|-----------|--------|
| SQL statements | Implementation detail |
| Supabase policies | Implementation detail |
| RLS definitions | Implementation detail |
| Edge function code | Implementation detail |
| API endpoint definitions | Implementation detail |
| Database schema | See Conceptual ERD |
| UI components | Out of scope |
| External integrations | Out of scope for V1.2 |

---

## 11. Status

| Attribute | Value |
|-----------|-------|
| Document Status | DRAFT — Optional Planning |
| Implementation Authorized | NO |
| SQL Included | NO |
| API Definitions Included | NO |

---

## Cross-References

| Document | Location |
|----------|----------|
| Architecture Overview | `DVH-IMS-V1.2_Architecture_Overview_Logical.md` |
| Services Decomposition | `DVH-IMS-V1.2_Services_Module_Decomposition.md` |
| Audit & Legal Traceability | `DVH-IMS-V1.2_Audit_and_Legal_Traceability.md` |
| Notifications & Escalations | `DVH-IMS-V1.2_Notifications_and_Escalations.md` |
| Roles & Authority Matrix | `DVH-IMS-V1.2_Roles_and_Authority_Matrix.md` |

---

**End of Document**
