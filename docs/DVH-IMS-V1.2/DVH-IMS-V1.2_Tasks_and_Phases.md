# DVH-IMS V1.2 — Tasks and Phases

**Version:** DVH-IMS-V1.2  
**Status:** DRAFT — Optional Planning Document  
**Created:** 2026-01-24  
**Document Type:** Planning / Task Breakdown (Non-Authoritative)  
**Change Policy:** This document does not authorize implementation

---

## 1. Purpose

This document provides a phase-based task breakdown for DVH-IMS-V1.2 implementation planning. It maps tasks to source documents and identifies dependencies between phases.

**This is a planning artifact only. No timelines, estimates, or execution instructions are included.**

---

## 2. Phase Model Overview

DVH-IMS-V1.2 follows a strict 7-phase execution model as defined in the Implementation Roadmap.

| Phase | Name | Primary Focus |
|-------|------|---------------|
| 0 | Documentation Baseline | Planning documents complete |
| 1 | Access & Authority Foundation | Role and authority alignment |
| 2 | Workflow & State Enforcement | Dossier state machine |
| 3 | Audit & Legal Traceability | Immutable event logging |
| 4 | Notifications & Escalations | Rule-based signaling |
| 5 | Services Module Decomposition | Service implementation |
| 6 | Stabilization & Readiness | Validation and handover |

---

## 3. Phase 0 — Documentation Baseline

**Status:** COMPLETE

### Tasks

| Task ID | Task Description | Source Document |
|---------|------------------|-----------------|
| P0-T01 | Define V1.2 scope and objectives | Scope & Objectives |
| P0-T02 | Establish roles and authority matrix | Roles & Authority Matrix |
| P0-T03 | Document end-to-end workflows | End-to-End Workflows |
| P0-T04 | Define dossier state model | Dossier State Model |
| P0-T05 | Specify audit and traceability requirements | Audit & Legal Traceability |
| P0-T06 | Define notification and escalation rules | Notifications & Escalations |
| P0-T07 | Analyze gaps from V1.1 | Gap Analysis From V1.1 |
| P0-T08 | Create implementation roadmap | Implementation Roadmap |
| P0-T09 | Decompose services by module | Services Module Decomposition |
| P0-T10 | Define logical architecture | Architecture Overview |

### Dependencies

- None (foundation phase)

### Exit Criteria

- All 10 planning documents approved

---

## 4. Phase 1 — Access & Authority Foundation

### Tasks

| Task ID | Task Description | Source Document |
|---------|------------------|-----------------|
| P1-T01 | Confirm role definitions in system | Roles & Authority Matrix |
| P1-T02 | Map roles to departments | Roles & Authority Matrix |
| P1-T03 | Define authority boundaries per role | Roles & Authority Matrix |
| P1-T04 | Align existing `app_role` enum with V1.2 roles | Gap Analysis (Category B) |
| P1-T05 | Document role-to-action permissions | Roles & Authority Matrix |
| P1-T06 | Validate role isolation (no implicit inheritance) | Architecture Overview |

### Dependencies

| Depends On | Reason |
|------------|--------|
| Phase 0 | Requires approved role definitions |

### Exit Criteria

- Approved technical access strategy
- Role alignment documented

---

## 5. Phase 2 — Workflow & State Enforcement

### Tasks

| Task ID | Task Description | Source Document |
|---------|------------------|-----------------|
| P2-T01 | Implement dossier state machine | Dossier State Model |
| P2-T02 | Define allowed state transitions | Dossier State Model |
| P2-T03 | Implement transition validation rules | Dossier State Model |
| P2-T04 | Enforce role-based transition triggers | Dossier State Model, Roles & Authority |
| P2-T05 | Block forbidden transitions | Dossier State Model |
| P2-T06 | Separate Bouwsubsidie workflow logic | End-to-End Workflows |
| P2-T07 | Separate Woning Registratie workflow logic | End-to-End Workflows |
| P2-T08 | Integrate workflow with Application Control Layer | Architecture Overview |

### Dependencies

| Depends On | Reason |
|------------|--------|
| Phase 1 | Role enforcement must be in place |

### Exit Criteria

- Deterministic dossier progression operational
- Illegal transitions rejected

---

## 6. Phase 3 — Audit & Legal Traceability

### Tasks

| Task ID | Task Description | Source Document |
|---------|------------------|-----------------|
| P3-T01 | Implement audit event capture | Audit & Legal Traceability |
| P3-T02 | Ensure immutability of audit logs | Audit & Legal Traceability |
| P3-T03 | Capture actor identification | Audit & Legal Traceability |
| P3-T04 | Capture timestamps for all events | Audit & Legal Traceability |
| P3-T05 | Record state before/after snapshots | Audit & Legal Traceability |
| P3-T06 | Link decisions to audit events | Audit & Legal Traceability |
| P3-T07 | Implement correlation ID tracking | Audit & Legal Traceability |
| P3-T08 | Capture rationale for decisions | Audit & Legal Traceability |
| P3-T09 | Audit Raadvoorstel generation (Bouwsubsidie) | Dossier State Model |

### Dependencies

| Depends On | Reason |
|------------|--------|
| Phase 2 | State transitions must exist to audit |

### Exit Criteria

- Every mutation generates audit event
- Legally defensible trace available

---

## 7. Phase 4 — Notifications & Escalations

### Tasks

| Task ID | Task Description | Source Document |
|---------|------------------|-----------------|
| P4-T01 | Implement internal notification triggers | Notifications & Escalations |
| P4-T02 | Define deadline reminder rules | Notifications & Escalations |
| P4-T03 | Implement escalation trigger logic | Notifications & Escalations |
| P4-T04 | Map notification events to roles | Notifications & Escalations |
| P4-T05 | Ensure notification events are audited | Audit & Legal Traceability |
| P4-T06 | Define soft vs hard deadline behavior | Notifications & Escalations |
| P4-T07 | Handle escalation to Supervisor role | Notifications & Escalations |

### Dependencies

| Depends On | Reason |
|------------|--------|
| Phase 3 | Notifications must generate audit events |

### Exit Criteria

- Rule-based notifications operational
- Escalation paths functional

---

## 8. Phase 5 — Services Module Decomposition

### Tasks

| Task ID | Task Description | Source Document |
|---------|------------------|-----------------|
| P5-T01 | Implement Intake Service | Services Decomposition |
| P5-T02 | Implement Dossier Management Service | Services Decomposition |
| P5-T03 | Implement Review & Assessment Service | Services Decomposition |
| P5-T04 | Implement Decision Service | Services Decomposition |
| P5-T05 | Implement Audit & Traceability Service | Services Decomposition |
| P5-T06 | Implement Bouwsubsidie: Financial Assessment | Services Decomposition |
| P5-T07 | Implement Bouwsubsidie: Raadvoorstel Generation | Services Decomposition |
| P5-T08 | Implement Bouwsubsidie: Subsidy Allocation | Services Decomposition |
| P5-T09 | Implement Woning Registratie: Registration Validation | Services Decomposition |
| P5-T10 | Implement Woning Registratie: Registry Recording | Services Decomposition |
| P5-T11 | Integrate Notification Orchestration Service | Services Decomposition |
| P5-T12 | Integrate Role & Authority Enforcement | Services Decomposition |

### Dependencies

| Depends On | Reason |
|------------|--------|
| Phase 4 | Notification service must exist |
| Phase 3 | Audit service must exist |
| Phase 2 | Workflow engine must exist |
| Phase 1 | Authority enforcement must exist |

### Exit Criteria

- All services operational
- Service boundaries enforced

---

## 9. Phase 6 — Stabilization & Readiness

### Tasks

| Task ID | Task Description | Source Document |
|---------|------------------|-----------------|
| P6-T01 | Validate all workflows end-to-end | End-to-End Workflows |
| P6-T02 | Verify audit trail completeness | Audit & Legal Traceability |
| P6-T03 | Test notification delivery | Notifications & Escalations |
| P6-T04 | Verify role-based access enforcement | Roles & Authority Matrix |
| P6-T05 | Confirm state machine integrity | Dossier State Model |
| P6-T06 | Data entry readiness check | Scope & Objectives |
| P6-T07 | Operational handover preparation | Implementation Roadmap |

### Dependencies

| Depends On | Reason |
|------------|--------|
| Phases 1-5 | All implementation complete |

### Exit Criteria

- System ready for operational use
- V1.2 controls validated

---

## 10. Task Dependency Graph

```
Phase 0 (Documentation)
    │
    ▼
Phase 1 (Access & Authority)
    │
    ▼
Phase 2 (Workflow & State)
    │
    ▼
Phase 3 (Audit & Traceability)
    │
    ▼
Phase 4 (Notifications & Escalations)
    │
    ▼
Phase 5 (Services Decomposition)
    │
    ▼
Phase 6 (Stabilization & Readiness)
```

**Critical Path:** Phases must execute sequentially. No phase may begin until its predecessor is complete and approved.

---

## 11. Explicitly Out of Scope

The following are explicitly excluded from V1.2 task planning:

| Excluded Item | Source |
|---------------|--------|
| Public Wizard changes | Scope & Objectives |
| Legacy data migration | Scope & Objectives |
| V1.1 code modifications | Scope & Objectives |
| External agency integration | Roles & Authority Matrix |
| Automated decision engines | Services Decomposition |
| External notification channels (SMS/Email) | Notifications & Escalations |
| Payment processing | Services Decomposition |
| Cross-dossier automation | Services Decomposition |
| Performance optimization | Scope & Objectives |
| UI/UX redesign | Scope & Objectives |

---

## 12. Status

| Attribute | Value |
|-----------|-------|
| Document Status | DRAFT — Optional Planning |
| Implementation Authorized | NO |
| Timelines Included | NO |
| Estimates Included | NO |

---

## Cross-References

| Document | Location |
|----------|----------|
| Implementation Roadmap | `DVH-IMS-V1.2_Implementation_Roadmap.md` |
| Roles & Authority Matrix | `DVH-IMS-V1.2_Roles_and_Authority_Matrix.md` |
| End-to-End Workflows | `DVH-IMS-V1.2_End_to_End_Workflows.md` |
| Dossier State Model | `DVH-IMS-V1.2_Dossier_State_Model.md` |
| Audit & Legal Traceability | `DVH-IMS-V1.2_Audit_and_Legal_Traceability.md` |
| Services Decomposition | `DVH-IMS-V1.2_Services_Module_Decomposition.md` |

---

**End of Document**
