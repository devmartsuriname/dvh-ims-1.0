# DVH-IMS V1.3 — Phase 3 Workflow Preparation

**Document Type:** Workflow Mapping Specification  
**Version:** 1.0  
**Date:** 2026-01-30  
**Phase:** Phase 3 — Role & Workflow Activation Preparation  
**Status:** PREPARED — NOT ACTIVE

---

## 1. Document Purpose

This document defines the complete workflow chains for both services (Bouwsubsidie and Woningregistratie), mapping each step to its responsible role. These workflows are **prepared for future activation** but remain **non-operational** in the current system.

---

## 2. Current Workflow State (Active)

The current system uses a simplified workflow model with the 7 active roles:

### 2.1 Bouwsubsidie (Current — Simplified)

```text
SUBMITTED → IN_REVIEW → APPROVED/REJECTED
     ↓          ↓
  Frontdesk  Project Leader / Minister
```

### 2.2 Woningregistratie (Current — Simplified)

```text
SUBMITTED → IN_REVIEW → REGISTERED/REJECTED → ALLOCATED
     ↓          ↓
  Frontdesk  Project Leader
```

---

## 3. Prepared Workflow — Bouwsubsidie (Full Chain)

### 3.1 Decision Chain Overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    BOUWSUBSIDIE DECISION CHAIN                          │
│                         (7 Steps + Parallel)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Step 1: FRONTDESK (Intake)                                             │
│     │                                                                   │
│     ├──────────────────────────────────────────────┐                    │
│     │                                              │                    │
│     ▼                                              ▼                    │
│  Step 1P: SOCIAL FIELD WORKER          [Parallel Assessment]           │
│     │                                                                   │
│     ▼                                                                   │
│  Step 2: TECHNICAL INSPECTOR                                            │
│     │                                                                   │
│     ▼                                                                   │
│  Step 3: ADMINISTRATIVE OFFICER (Completeness)                          │
│     │                                                                   │
│     ▼                                                                   │
│  Step 4: PROJECT LEADER / DEPUTY DIRECTOR (Policy)                      │
│     │                                                                   │
│     ▼                                                                   │
│  Step 5: DIRECTOR (Organizational)                                      │
│     │                                                                   │
│     ▼                                                                   │
│  Step 6: MINISTERIAL ADVISOR (Advice + Paraaf)                          │
│     │                                                                   │
│     ▼                                                                   │
│  Step 7: MINISTER (Final Decision)                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Detailed State Transitions

| Step | Role | From Status | To Status | Action | Status |
|------|------|-------------|-----------|--------|--------|
| 1 | frontdesk_bouwsubsidie | (new) | SUBMITTED | Create intake | ✅ ACTIVE |
| 1P | social_field_worker | SUBMITTED | IN_SOCIAL_REVIEW | Start social assessment | ⏸️ PREPARED |
| 1P | social_field_worker | IN_SOCIAL_REVIEW | SOCIAL_COMPLETED | Complete social review | ⏸️ PREPARED |
| 2 | technical_inspector | SOCIAL_COMPLETED | IN_TECHNICAL_REVIEW | Start technical inspection | ⏸️ PREPARED |
| 2 | technical_inspector | IN_TECHNICAL_REVIEW | TECHNICAL_APPROVED | Approve technical | ⏸️ PREPARED |
| 3 | admin_staff | TECHNICAL_APPROVED | IN_ADMIN_REVIEW | Start completeness check | ✅ ACTIVE (partial) |
| 3 | admin_staff | IN_ADMIN_REVIEW | ADMIN_COMPLETE | Dossier complete | ✅ ACTIVE (partial) |
| 4 | project_leader | ADMIN_COMPLETE | IN_POLICY_REVIEW | Start policy review | ✅ ACTIVE (partial) |
| 4 | project_leader | IN_POLICY_REVIEW | POLICY_APPROVED | Approve policy | ✅ ACTIVE (partial) |
| 5 | director | POLICY_APPROVED | IN_DIRECTOR_REVIEW | Start director review | ⏸️ PREPARED |
| 5 | director | IN_DIRECTOR_REVIEW | DIRECTOR_APPROVED | Approve organizational | ⏸️ PREPARED |
| 6 | ministerial_advisor | DIRECTOR_APPROVED | IN_MINISTERIAL_ADVICE | Start ministerial advice | ⏸️ PREPARED |
| 6 | ministerial_advisor | IN_MINISTERIAL_ADVICE | ADVICE_COMPLETE | Complete with paraaf | ⏸️ PREPARED |
| 7 | minister | ADVICE_COMPLETE | APPROVED | Final approval | ✅ ACTIVE (simplified) |
| 7 | minister | ADVICE_COMPLETE | REJECTED | Final rejection | ✅ ACTIVE (simplified) |

### 3.3 Return/Escalation Paths

| From Step | To Step | Trigger | Responsibility |
|-----------|---------|---------|----------------|
| 1P | 1 | Missing intake info | Social Field Worker |
| 2 | 1P | Technical requires social re-assessment | Technical Inspector |
| 3 | 2 | Missing technical documentation | Admin Staff |
| 4 | 3 | Policy requires additional documents | Project Leader |
| 5 | 4 | Organizational concerns on policy | Director |
| 6 | 5 | Advisory concerns | Ministerial Advisor |
| 7 | 6 | Minister requests clarification | Minister |

---

## 4. Prepared Workflow — Woningregistratie (Reduced Chain)

### 4.1 Decision Chain Overview

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                  WONINGREGISTRATIE DECISION CHAIN                       │
│                           (5 Steps)                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Step 1: FRONTDESK (Intake)                                             │
│     │                                                                   │
│     ├──────────────────────────────────────────────┐                    │
│     │                                              │                    │
│     ▼                                              ▼                    │
│  Step 1P: SOCIAL FIELD WORKER          [Parallel Assessment]           │
│     │                                                                   │
│     ▼                                                                   │
│  Step 3: ADMINISTRATIVE OFFICER (Completeness)                          │
│     │                    ▲                                              │
│     │                    │ (No Technical Step for WR)                   │
│     ▼                                                                   │
│  Step 4: PROJECT LEADER / DEPUTY DIRECTOR (Policy)                      │
│     │                                                                   │
│     ▼                                                                   │
│  Step 5: DIRECTOR (Final Decision — Organizational)                     │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│  EXCLUDED: Technical Inspector, Ministerial Advisor, Minister           │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Detailed State Transitions

| Step | Role | From Status | To Status | Action | Status |
|------|------|-------------|-----------|--------|--------|
| 1 | frontdesk_housing | (new) | SUBMITTED | Create intake | ✅ ACTIVE |
| 1P | social_field_worker | SUBMITTED | IN_SOCIAL_REVIEW | Start social assessment | ⏸️ PREPARED |
| 1P | social_field_worker | IN_SOCIAL_REVIEW | SOCIAL_COMPLETED | Complete social review | ⏸️ PREPARED |
| 3 | admin_staff | SOCIAL_COMPLETED | IN_ADMIN_REVIEW | Start completeness check | ✅ ACTIVE (partial) |
| 3 | admin_staff | IN_ADMIN_REVIEW | ADMIN_COMPLETE | Dossier complete | ✅ ACTIVE (partial) |
| 4 | project_leader | ADMIN_COMPLETE | IN_POLICY_REVIEW | Start policy review | ✅ ACTIVE (partial) |
| 4 | project_leader | IN_POLICY_REVIEW | POLICY_APPROVED | Approve policy | ✅ ACTIVE (partial) |
| 5 | director | POLICY_APPROVED | IN_DIRECTOR_REVIEW | Start director review | ⏸️ PREPARED |
| 5 | director | IN_DIRECTOR_REVIEW | REGISTERED | Final approval (register) | ⏸️ PREPARED |
| 5 | director | IN_DIRECTOR_REVIEW | REJECTED | Final rejection | ⏸️ PREPARED |
| — | director | REGISTERED | ALLOCATED | Allocation decision | ⏸️ PREPARED |

### 4.3 Key Differences from Bouwsubsidie

| Aspect | Bouwsubsidie | Woningregistratie |
|--------|--------------|-------------------|
| Technical Inspection | Required (Step 2) | NOT APPLICABLE |
| Final Decision Authority | Minister | Director |
| Ministerial Advice | Required (Step 6) | NOT APPLICABLE |
| Total Steps | 7 + Parallel | 5 + Parallel |
| Budget Verification | Yes (Technical) | No |

---

## 5. Role-to-Workflow Mapping Matrix

### 5.1 Bouwsubsidie Permissions

| Role | CREATE | SUBMIT | SOCIAL | TECHNICAL | ADMIN | POLICY | DIRECTOR | ADVICE | DECIDE |
|------|--------|--------|--------|-----------|-------|--------|----------|--------|--------|
| frontdesk_bouwsubsidie | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| social_field_worker | ❌ | ❌ | ⏸️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| technical_inspector | ❌ | ❌ | ❌ | ⏸️ | ❌ | ❌ | ❌ | ❌ | ❌ |
| admin_staff | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| project_leader | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| director | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⏸️ | ❌ | ❌ |
| ministerial_advisor | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⏸️ | ❌ |
| minister | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 5.2 Woningregistratie Permissions

| Role | CREATE | SUBMIT | SOCIAL | ADMIN | POLICY | DIRECTOR | ALLOCATE |
|------|--------|--------|--------|-------|--------|----------|----------|
| frontdesk_housing | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| social_field_worker | ❌ | ❌ | ⏸️ | ❌ | ❌ | ❌ | ❌ |
| admin_staff | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| project_leader | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| director | ❌ | ❌ | ❌ | ❌ | ❌ | ⏸️ | ⏸️ |

**Legend:**
- ✅ = Active permission
- ⏸️ = Prepared (not active)
- ❌ = Not applicable

---

## 6. Status Model Extension

### 6.1 Current Statuses (Active)

**Bouwsubsidie (subsidy_case):**
- SUBMITTED
- IN_REVIEW
- APPROVED
- REJECTED

**Woningregistratie (housing_registration):**
- SUBMITTED
- IN_REVIEW
- REGISTERED
- REJECTED
- ALLOCATED
- WAITLISTED

### 6.2 Prepared Statuses (Not Active)

**Bouwsubsidie Extension:**
- IN_SOCIAL_REVIEW (Step 1P)
- SOCIAL_COMPLETED (Step 1P complete)
- IN_TECHNICAL_REVIEW (Step 2)
- TECHNICAL_APPROVED (Step 2 complete)
- IN_ADMIN_REVIEW (Step 3)
- ADMIN_COMPLETE (Step 3 complete)
- IN_POLICY_REVIEW (Step 4)
- POLICY_APPROVED (Step 4 complete)
- IN_DIRECTOR_REVIEW (Step 5)
- DIRECTOR_APPROVED (Step 5 complete)
- IN_MINISTERIAL_ADVICE (Step 6)
- ADVICE_COMPLETE (Step 6 complete)

**Woningregistratie Extension:**
- IN_SOCIAL_REVIEW (Step 1P)
- SOCIAL_COMPLETED (Step 1P complete)
- IN_ADMIN_REVIEW (Step 3)
- ADMIN_COMPLETE (Step 3 complete)
- IN_POLICY_REVIEW (Step 4)
- POLICY_APPROVED (Step 4 complete)
- IN_DIRECTOR_REVIEW (Step 5)

---

## 7. Parallel Processing Rules

### 7.1 Social Field Worker Parallel Path

The Social Field Worker operates in PARALLEL with the intake process:

```text
                    ┌─────────────────────────────┐
                    │       Case SUBMITTED        │
                    └─────────────┬───────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   │                   ▼
    ┌─────────────────┐           │         ┌─────────────────┐
    │ Frontdesk       │           │         │ Social Field    │
    │ (document       │           │         │ Worker (social  │
    │  collection)    │           │         │  assessment)    │
    └────────┬────────┘           │         └────────┬────────┘
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │   Both Complete Required    │
                    │   Before Next Step          │
                    └─────────────────────────────┘
```

### 7.2 Synchronization Point

The workflow CANNOT proceed to Step 2 (Technical) or Step 3 (Admin) until:
1. Frontdesk marks intake complete
2. Social Field Worker completes assessment

This is a **mandatory synchronization point**.

---

## 8. Transition Validation Rules

### 8.1 Valid Transition Matrix (Prepared)

```typescript
// PREPARED — NOT ACTIVE
// These transition rules will be enforced in future activation

const BOUWSUBSIDIE_TRANSITIONS: Record<string, string[]> = {
  'SUBMITTED': ['IN_SOCIAL_REVIEW'],
  'IN_SOCIAL_REVIEW': ['SOCIAL_COMPLETED', 'RETURNED_TO_INTAKE'],
  'SOCIAL_COMPLETED': ['IN_TECHNICAL_REVIEW'],
  'IN_TECHNICAL_REVIEW': ['TECHNICAL_APPROVED', 'TECHNICAL_REJECTED', 'RETURNED_TO_SOCIAL'],
  'TECHNICAL_APPROVED': ['IN_ADMIN_REVIEW'],
  'IN_ADMIN_REVIEW': ['ADMIN_COMPLETE', 'RETURNED_TO_TECHNICAL'],
  'ADMIN_COMPLETE': ['IN_POLICY_REVIEW'],
  'IN_POLICY_REVIEW': ['POLICY_APPROVED', 'RETURNED_TO_ADMIN'],
  'POLICY_APPROVED': ['IN_DIRECTOR_REVIEW'],
  'IN_DIRECTOR_REVIEW': ['DIRECTOR_APPROVED', 'DIRECTOR_REJECTED', 'RETURNED_TO_POLICY'],
  'DIRECTOR_APPROVED': ['IN_MINISTERIAL_ADVICE'],
  'IN_MINISTERIAL_ADVICE': ['ADVICE_COMPLETE', 'RETURNED_TO_DIRECTOR'],
  'ADVICE_COMPLETE': ['APPROVED', 'REJECTED'],
};

const WONINGREGISTRATIE_TRANSITIONS: Record<string, string[]> = {
  'SUBMITTED': ['IN_SOCIAL_REVIEW'],
  'IN_SOCIAL_REVIEW': ['SOCIAL_COMPLETED', 'RETURNED_TO_INTAKE'],
  'SOCIAL_COMPLETED': ['IN_ADMIN_REVIEW'],  // Skips Technical
  'IN_ADMIN_REVIEW': ['ADMIN_COMPLETE', 'RETURNED_TO_SOCIAL'],
  'ADMIN_COMPLETE': ['IN_POLICY_REVIEW'],
  'IN_POLICY_REVIEW': ['POLICY_APPROVED', 'RETURNED_TO_ADMIN'],
  'POLICY_APPROVED': ['IN_DIRECTOR_REVIEW'],
  'IN_DIRECTOR_REVIEW': ['REGISTERED', 'REJECTED', 'RETURNED_TO_POLICY'],
  'REGISTERED': ['ALLOCATED', 'WAITLISTED'],
};
```

---

## 9. Activation Dependencies

### 9.1 Role Activation Order

Roles MUST be activated in the following order to maintain workflow integrity:

1. **social_field_worker** — Required for Step 1P
2. **technical_inspector** — Required for Step 2 (BS only)
3. **director** — Required for Step 5
4. **ministerial_advisor** — Required for Step 6 (BS only)

### 9.2 Status Extension Requirements

Before activating roles, the following status extensions are required:

1. Extend `subsidy_case.status` enum
2. Extend `housing_registration.current_status` enum
3. Update status_history trigger functions
4. Add validation constraints

---

## 10. Governance Statement

**This document defines workflow specifications for PREPARATION ONLY.**

**No workflows defined in this document are active in the system.**

**Activation requires explicit authorization and a dedicated implementation phase.**

**The current system operates with simplified 2-step workflows only.**

---

**PHASE 3 — WORKFLOW PREPARATION — COMPLETE**

---

**END OF DOCUMENT**
