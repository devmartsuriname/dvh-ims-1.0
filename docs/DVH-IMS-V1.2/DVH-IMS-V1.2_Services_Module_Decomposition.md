# DVH-IMS V1.2 — Services Module Decomposition

**Version:** DVH-IMS-V1.2  
**Status:** DRAFT — Awaiting Review & Approval  
**Created:** 2026-01-24  
**Document Type:** Architecture / Planning (Normative)  
**Change Policy:** No implementation without explicit approval

---

## 1. Purpose of This Document

This document defines the service-level decomposition of DVH-IMS-V1.2. It translates the approved scope, workflows, dossier state model, and authority matrix into clear functional service modules.

**This document is planning-only.**

- No implementation
- No schema changes
- No RLS changes

It serves as the final structural bridge before controlled execution planning.

---

## 2. Core Design Principles

### Service Separation by Legal Process

- Bouwsubsidie and Woning Registratie are distinct services
- Shared infrastructure does not imply shared workflows

### Dossier-Centric Architecture

- Every service operates around a dossier lifecycle
- State transitions are authoritative

### Authority-Aware Execution

- Services enforce roles and decision boundaries
- No implicit permissions

### Audit-First Design

- Every service emits audit events
- Legal traceability is mandatory

---

## 3. Service Overview

### 3.1 Internal Services (DVH)

| Service | Description | Applies To |
|---------|-------------|------------|
| Intake Service | Receives and validates submissions | Bouwsubsidie, Woning Registratie |
| Dossier Management Service | Creates and manages dossiers | Both |
| Review & Assessment Service | Case handling, validation, advice | Both |
| Decision Service | Formal approval / rejection | Both |
| Audit & Traceability Service | Immutable audit logging | Both |

### 3.2 Bouwsubsidie-Specific Services

| Service | Description |
|---------|-------------|
| Financial Assessment Service | Budget and eligibility checks |
| Raadvoorstel Generation Service | Generates Raadvoorstel after approval |
| Subsidy Allocation Service | Final allocation and registration |

> **Important:**  
> Raadvoorstel generation applies **only** to Bouwsubsidie.  
> Woning Registratie explicitly excludes this service.

### 3.3 Woning Registratie-Specific Services

| Service | Description |
|---------|-------------|
| Registration Validation Service | Property and applicant validation |
| Registry Recording Service | Registration into housing registry |

---

## 4. Cross-Cutting Supporting Services

| Service | Function |
|---------|----------|
| Notification Orchestration Service | Triggers notifications (planned) |
| Reporting & Statistics Service | Aggregated views (planned) |
| Role & Authority Enforcement | Role-based execution gates |

> **Note:**  
> Notification services are documented but not implemented in V1.2.

---

## 5. Service-to-Workflow Mapping

| Workflow Phase | Primary Service |
|----------------|-----------------|
| Submission | Intake Service |
| Dossier Creation | Dossier Management Service |
| Review | Review & Assessment Service |
| Decision | Decision Service |
| Raadvoorstel | Raadvoorstel Generation Service (Bouwsubsidie only) |
| Finalization | Subsidy Allocation / Registry Recording |

---

## 6. Service Boundaries & Exclusions

**Explicit exclusions for DVH-IMS-V1.2:**

- No external payment services
- No automated decision engines
- No public notification channels
- No cross-dossier automation

---

## 7. Relation to Other V1.2 Documents

This document is consistent with:

- `DVH-IMS-V1.2_Scope_and_Objectives`
- `DVH-IMS-V1.2_Roles_and_Authority_Matrix`
- `DVH-IMS-V1.2_End_to_End_Workflows`
- `DVH-IMS-V1.2_Dossier_State_Model`
- `DVH-IMS-V1.2_Audit_and_Legal_Traceability`

---

## 8. Status

| Attribute | Value |
|-----------|-------|
| Document type | Planning / Architecture Definition |
| Implementation status | Not started |
| Approval requirement | Requires internal approval before any execution planning |

---

**End of Document**
