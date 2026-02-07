

# DVH-IMS V1.5 -- Intake Focus Confirmation and Phase Direction

**Type:** Intake continuation document
**Scope:** Single new file

---

## Deliverable

Create file: `docs/DVH-IMS-V1.5/V1.5_Intake_Focus_Confirmation.md`

---

## Document Structure

### Header and Status
- Title: "DVH-IMS V1.5 -- Intake Focus Confirmation and Phase Direction"
- Status: PROPOSED -- NOT APPROVED
- Date: 2026-02-07
- Authority: Delroy

### Section 1: Primary Strategic Focus
State the explicit V1.5 focus as **Operational Stability and Production Readiness**, covering:
- Operational transparency: Review Archive (read-only, legally traceable decision history)
- Operational control: Case assignment persistence and workload distribution
- Admin adoption: Dutch (NL) localization of the admin portal
- System robustness: Scale Packs (server-side pagination, KPI aggregations, async search)

Reference the corresponding inventory items (1.1, 1.16, 1.17, 1.7, 1.8, 1.9).

### Section 2: Explicit De-Prioritization
Mark the following as NOT PRIMARY for V1.5, with clear "deferred" positioning:
- Financial Assessment Service Formalization (1.3)
- Subsidy Allocation Formal Workflow (1.4)
- Approved Amount Editing by Minister (1.11)
- External Financial Processing (1.15)

Note: these items remain in the inventory for future planning but are not candidates for V1.5 scope.

### Section 3: Proposed Phase Direction
Conceptual grouping only -- no design, no schema, no UI:

- **Phase 1: Operational Transparency (Archive)**
  - Review Archive UI for completed/closed dossiers
  - PDF report generation for decision summaries
  - Role-scoped read-only access for oversight roles

- **Phase 2: Operational Control (Assignments)**
  - Persistent case-to-worker assignment tracking
  - Visit scheduling persistence
  - Integration with existing V1.4 field work interfaces

- **Phase 3: Adoption and Scale Readiness**
  - Admin Portal NL localization
  - Scale Pack A (server-side pagination)
  - Scale Pack B (dashboard KPI aggregations)
  - Scale Pack C (form selector async search)

### Section 4: Governance Confirmation
Explicit statements:
- No implementation is proposed
- No prioritization implies approval
- All items remain subject to formal authorization
- Each phase requires individual authorization before execution

### Section 5: Closing Statement
Exact text as specified in the task.

---

## Technical Details

No code, schema, RLS, or UI changes. New documentation file only.

