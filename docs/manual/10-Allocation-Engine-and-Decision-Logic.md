# DVH-IMS — Allocation Engine and Decision Logic

**Document:** 10 — Allocation Engine and Decision Logic
**Version:** V1.7
**Classification:** Official — For Ministerial Review
**Date:** March 2026

> **Note on screenshots:** Screenshot references (e.g., `[Screenshot: ...]`) indicate where annotated, PII-masked screenshots will be inserted during the visual documentation pass.

---

## 1. Overview

The Allocation Engine is the automated system for matching eligible housing registrations with available housing units. It operates within the Woningregistratie (Housing Registration) service and uses objective criteria to ensure fair and transparent allocation.

---

## 2. Components

| Component | URL | Purpose |
|-----------|-----|---------|
| District Quotas | https://volkshuisvesting.sr/allocation-quotas | Define available units per district per period |
| Allocation Runs | https://volkshuisvesting.sr/allocation-runs | Execute the matching algorithm |
| Allocation Decisions | https://volkshuisvesting.sr/allocation-decisions | Record accept/reject per candidate |
| Allocation Assignments | https://volkshuisvesting.sr/allocation-assignments | Register final housing assignments |

---

## 3. District Quotas

### Purpose
Define how many housing units are available for allocation in each district during a specific period.

### Fields

| Field | Description |
|-------|------------|
| District Code | The administrative district |
| Total Quota | Number of units available |
| Allocated Count | Number already allocated |
| Period Start | Start of the quota period |
| Period End | End of the quota period |
| Created By | Staff member who set the quota |

### Who Can Manage
- `system_admin` and `project_leader` can create and update quotas
- Other authorized roles can view quotas (read-only)

[Screenshot: District Quotas — Management View]

---

## 4. Allocation Runs

### Purpose
Execute the matching algorithm to rank eligible candidates for available housing units in a district.

### Process
1. Authorized user initiates an allocation run for a specific district
2. The system identifies eligible registrations (status: WAITLISTED or APPROVED)
3. Each candidate is scored using:
   - **Urgency Score** — from urgency assessment (medical, emergency, etc.)
   - **Waiting List Position** — chronological order of registration
4. A **Composite Rank** is calculated combining both factors
5. Candidates are ranked from highest to lowest priority
6. The run records all candidates and their scores

### Run Record

| Field | Description |
|-------|------------|
| District Code | District being allocated |
| Run Date | When the allocation was executed |
| Run Status | pending / completed / error |
| Candidates Count | Number of eligible candidates found |
| Allocations Count | Number of allocations made |
| Executed By | Staff member who initiated the run |
| Error Message | Error details (if run failed) |

### Who Can Execute
- `system_admin` and `project_leader` only
- The allocation run is triggered via a secure Edge Function (`execute-allocation-run`)

[Screenshot: Allocation Runs — List View]

---

## 5. Candidate Ranking

Each allocation candidate record contains:

| Field | Description |
|-------|------------|
| Registration ID | The housing registration being evaluated |
| Urgency Score | Priority score from urgency assessment |
| Waiting List Position | Chronological registration order |
| Composite Rank | Combined priority ranking |
| Is Selected | Whether the candidate was selected for allocation |

### Scoring Model
- Higher urgency scores indicate greater need (medical, emergency situations)
- Lower waiting list positions indicate longer waiting times
- The composite rank balances urgency against waiting time
- Candidates with the highest composite rank are prioritized

---

## 6. Allocation Decisions

After an allocation run, decisions must be recorded for each candidate:

### Decision Options

| Decision | Meaning |
|----------|---------|
| Accepted | Candidate is allocated a housing unit |
| Rejected | Candidate is not allocated (with reason) |

### Decision Record

| Field | Description |
|-------|------------|
| Run ID | Which allocation run this decision belongs to |
| Candidate ID | The allocation candidate |
| Registration ID | The housing registration |
| Decision | Accepted or Rejected |
| Decision Reason | Justification (mandatory for rejections) |
| Decided By | Staff member who made the decision |
| Decided At | Timestamp |

### Who Can Decide
- `system_admin` and `project_leader`

[Screenshot: Allocation Decisions — Decision View]

---

## 7. Assignment Registration

After a candidate is accepted, a housing assignment is registered:

### Assignment Record

| Field | Description |
|-------|------------|
| Registration ID | The housing registration |
| Decision ID | Link to the allocation decision |
| Assignment Type | Type of housing assignment |
| Housing Reference | Reference to the specific housing unit |
| Assignment Date | Date of assignment |
| Notes | Additional notes |
| Recorded By | Staff member who registered the assignment |

### Audit Trail
- The assignment is audit-logged
- The registration status is updated to ASSIGNED
- The assignment is linked to the allocation decision for full traceability

[Screenshot: Allocation Assignments — Assignment View]

---

## 8. End-to-End Allocation Flow

```
1. Set District Quotas → define available units per district
         │
         ▼
2. Execute Allocation Run → system ranks eligible candidates
         │
         ▼
3. Review Candidates → see ranked list with scores
         │
         ▼
4. Record Decisions → accept or reject each candidate
         │
         ▼
5. Register Assignments → link accepted candidates to housing units
         │
         ▼
6. Update Registration Status → ALLOCATED → ASSIGNED
```

---

## 9. Governance Controls

- The allocation algorithm is deterministic — same inputs produce same rankings
- All allocation runs, decisions, and assignments are audit-logged
- The engine cannot be influenced by manual data changes during a run
- Rejected candidates remain on the waiting list for future runs
- District quotas provide administrative control over allocation volume

---

*End of Allocation Engine and Decision Logic*
