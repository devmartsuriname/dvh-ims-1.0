# DVH-IMS V1.2 — Architecture Overview (Logical)

**Version:** DVH-IMS-V1.2  
**Status:** DRAFT — Awaiting Review & Approval  
**Created:** 2026-01-24  
**Document Type:** Architecture / Logical Design (Normative)  
**Change Policy:** No implementation without explicit approval

---

## 1. Purpose of This Document

This document defines the logical architecture of DVH-IMS-V1.2. It explains how the system is structured at a conceptual level, how major components interact, and where responsibilities and boundaries lie.

**This document is implementation-agnostic** and serves as the architectural reference before any technical design or development activities begin.

---

## 2. Architectural Principles

The DVH-IMS-V1.2 architecture is governed by the following principles:

| Principle | Description |
|-----------|-------------|
| Separation of Concerns | Policy, workflow, services, and data are strictly separated |
| Audit-by-Design | Every state change and decision is traceable |
| Authority-Driven Flow | Actions are permitted by role and mandate, not UI access |
| Service Isolation | Each core service has explicit scope and boundaries |
| No Implicit Coupling | Cross-service interaction is explicit and documented |

---

## 3. High-Level System Components

### 3.1 User Interaction Layer

**Actors:**

- DVH Administrators
- Case Officers
- Supervisors
- Directors
- External Applicants (via Public Wizard – out of scope for V1.2 changes)

**Responsibilities:**

- Data entry
- Case review
- Decision execution
- Status visibility

**Explicit Boundary:**

- The UI layer does not contain business logic
- All authority checks are enforced outside the UI

---

### 3.2 Application Control Layer

**Purpose:**  
Coordinates workflows, validates actions, and enforces authority rules.

**Responsibilities:**

- Workflow orchestration
- State transition validation
- Role and authority enforcement
- Invocation of domain services

**Key Rule:**  
No service may be executed without validation by the control layer.

---

### 3.3 Domain Services Layer

This layer contains independent services, each aligned to a defined DVH mandate.

#### Core Services

| Service | Responsibilities |
|---------|------------------|
| **Bouwsubsidie Service** | Subsidy application processing, Financial assessment, Decision preparation, Raadvoorstel generation (exclusive) |
| **Woning Registratie Service** | Property and household registration, Eligibility verification, Status administration, No Raadvoorstel output |
| **Dossier Management Service** | Dossier lifecycle management, Evidence association, State tracking |
| **Decision & Approval Service** | Formal approval actions, Mandate validation, Decision finalization |
| **Audit & Traceability Service** | Immutable event logging, Legal trace construction, Decision accountability |
| **Notification & Escalation Service** | Rule-based alerts, Deadline tracking, Escalation triggers |

---

### 3.4 Workflow & State Engine

**Purpose:**  
Provides deterministic progression of dossiers through predefined states.

**Characteristics:**

- State transitions are explicit and documented
- Illegal transitions are rejected
- Transitions generate audit events

**Dependency Rule:**

- Services may request transitions
- Only the workflow engine can approve them

---

### 3.5 Audit & Legal Trace Layer

**Purpose:**  
Guarantees legal defensibility of all actions.

**Functions:**

- Event capture
- Actor identification
- Timestamping
- State before/after snapshots

**Non-Negotiable Rule:**  
No mutation occurs without an audit event.

---

### 3.6 Data Persistence Layer (Logical)

**Responsibilities:**

- Persistent storage of dossiers, decisions, and evidence
- Enforcement of immutability where required

**Constraints:**

- No direct UI access
- All writes pass through control and audit layers

---

## 4. Cross-Cutting Concerns

### 4.1 Authority Model

- Roles define capabilities, not navigation
- Departments define scope of action
- Authority matrices define who may decide what, when

### 4.2 Security & Integrity

- Least-privilege principle
- Explicit delegation only
- No implicit inheritance of authority

---

## 5. Explicit Exclusions

The following are explicitly excluded from this document:

- Technical stack decisions
- Database schemas
- API definitions
- Supabase, RLS, or implementation details
- UI/UX design specifics

---

## 6. Position in the DVH-IMS-V1.2 Documentation Set

This document acts as:

- The architectural anchor for implementation planning
- The reference for validating future technical designs
- A guardrail against scope creep during development

---

## 7. Status

| Attribute | Value |
|-----------|-------|
| Document Status | Draft — Ready for Review |
| Implementation Status | Not started |
| Approval Requirement | Upon approval, this document becomes authoritative for all DVH-IMS-V1.2 implementation activities |

---

**End of Document**
