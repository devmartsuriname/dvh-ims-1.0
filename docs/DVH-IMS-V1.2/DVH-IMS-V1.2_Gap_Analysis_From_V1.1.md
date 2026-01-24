# DVH-IMS V1.2 — Gap Analysis From V1.1

**Version:** DVH-IMS-V1.2  
**Status:** DRAFT — Awaiting Review & Approval  
**Created:** 2026-01-24  
**Document Type:** Governance / Planning (Normative)  
**Change Policy:** No implementation without explicit approval

---

## 1. Purpose of this Document

This document provides a controlled and explicit gap analysis between DVH-IMS-V1.1 (frozen) and the planned DVH-IMS-V1.2.

**The goal is to:**

- Protect the stability of DVH-IMS-V1.1
- Prevent unintended scope creep
- Provide a clear, auditable basis for the V1.2 Implementation Roadmap

This document is **planning- and governance-only**. No implementation decisions are made here.

---

## 2. Baseline Definition

### 2.1 DVH-IMS-V1.1 (Frozen Baseline)

DVH-IMS-V1.1 is considered:

- Functionally stable
- Approved for operational use
- Actively used for new data entry by DVH

**Constraints:**

- No schema redesign
- No workflow refactor
- No role restructuring beyond manual Supabase assignments
- No notification engine implementation

**DVH-IMS-V1.1 is read-only from a design perspective.**

---

## 3. Gap Categories

All gaps are classified into one of the following categories:

| Category | Definition |
|----------|------------|
| **A** | Exists in V1.1 (No Action Required) |
| **B** | Exists Partially (Requires Controlled Extension) |
| **C** | Does Not Exist (Planned for V1.2) |
| **D** | Explicitly Out of Scope for V1.2 |

---

## 4. Functional Gaps

### 4.1 Roles & Authority

| Aspect | Description |
|--------|-------------|
| V1.1 | Manual role assignment via Supabase |
| V1.2 | Formal role model with authority boundaries |
| **Gap Classification** | **B** |

**Notes:**
- No breaking changes allowed
- Role logic must wrap existing access patterns

### 4.2 End-to-End Workflow Governance

| Aspect | Description |
|--------|-------------|
| V1.1 | Implicit workflows enforced by UI usage |
| V1.2 | Explicit workflow definitions and checkpoints |
| **Gap Classification** | **C** |

### 4.3 Dossier State Management

| Aspect | Description |
|--------|-------------|
| V1.1 | Linear, UI-driven progression |
| V1.2 | Formal state machine with transition rules |
| **Gap Classification** | **C** |

### 4.4 Audit Logging & Legal Traceability

| Aspect | Description |
|--------|-------------|
| V1.1 | Basic system logs |
| V1.2 | Legal-grade audit trail with actor attribution |
| **Gap Classification** | **C** |

### 4.5 Notifications & Escalations

| Aspect | Description |
|--------|-------------|
| V1.1 | None |
| V1.2 | Rule-based notification planning |
| **Gap Classification** | **C** |

**Important:**
- No notification engine implementation in V1.2
- Documentation and planning only

---

## 5. Data & Migration Constraints

| Constraint | Status |
|------------|--------|
| Legacy data migration | Not required |
| DVH data entry | New data only |
| V1.1 data | Remains authoritative |
| **Gap Classification** | **A** |

---

## 6. Public Wizard

| Status | Action |
|--------|--------|
| Already implemented | ✅ |
| Excluded from V1.2 changes | ✅ |
| **Gap Classification** | **D** |

---

## 7. Summary Table

| Area | Status | Action in V1.2 |
|------|--------|----------------|
| Roles | Partial | Controlled extension |
| Workflow | Missing | Document & plan |
| Dossier States | Missing | Document & plan |
| Audit | Missing | Document & plan |
| Notifications | Missing | Document & plan |
| Data Migration | N/A | No action |
| Public Wizard | Exists | Excluded |

---

## 8. Output of this Document

This gap analysis feeds directly into:

- **DVH-IMS-V1.2_Implementation_Roadmap**

No implementation may start without explicit approval of both documents.

---

## 9. Status

**Draft — Pending Review & Approval**

---

## Cross-References

| Document | Relationship |
|----------|--------------|
| DVH-IMS-V1.2_Scope_and_Objectives | Defines V1.2 boundaries |
| DVH-IMS-V1.2_Roles_and_Authority_Matrix | Addresses Gap 4.1 |
| DVH-IMS-V1.2_End_to_End_Workflows | Addresses Gap 4.2 |
| DVH-IMS-V1.2_Dossier_State_Model | Addresses Gap 4.3 |
| DVH-IMS-V1.2_Audit_and_Legal_Traceability | Addresses Gap 4.4 |
| DVH-IMS-V1.2_Notifications_and_Escalations | Addresses Gap 4.5 |
| DVH-IMS-V1.2_Implementation_Roadmap | Consumes this analysis |

---

**END OF DOCUMENT**
