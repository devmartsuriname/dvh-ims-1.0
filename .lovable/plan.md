
# DVH-IMS V1.2 — Documentation Placement Correction Plan

## 1. Governance Violation Identified

**Violation:** Phase 2 execution artifact placed in `/docs/` instead of `/phases/`

| Misplaced File | Current Location | Violation Type |
|----------------|------------------|----------------|
| `DVH-IMS-V1.2_Phase2_Workflow_Verification_Report.md` | `/docs/DVH-IMS-V1.2/` | Execution artifact in reference folder |

## 2. Current State Audit

### `/docs/DVH-IMS-V1.2/` Contents (18 files)

| File | Category | Correct Location |
|------|----------|------------------|
| `README.md` | Index | ✅ CORRECT |
| `DVH-IMS-V1.2_Architecture_Overview_Logical.md` | Architecture | ✅ CORRECT |
| `DVH-IMS-V1.2_Audit_and_Legal_Traceability.md` | Governance | ✅ CORRECT |
| `DVH-IMS-V1.2_Backend_Design_Overview.md` | Design | ✅ CORRECT |
| `DVH-IMS-V1.2_Document_Approval_Checklist.md` | Governance | ✅ CORRECT |
| `DVH-IMS-V1.2_Dossier_State_Model.md` | Reference | ✅ CORRECT |
| `DVH-IMS-V1.2_ERD_Conceptual.md` | Design | ✅ CORRECT |
| `DVH-IMS-V1.2_End_to_End_Workflows.md` | Reference | ✅ CORRECT |
| `DVH-IMS-V1.2_Gap_Analysis_From_V1.1.md` | Baseline | ✅ CORRECT |
| `DVH-IMS-V1.2_Implementation_Roadmap.md` | Roadmap | ✅ CORRECT |
| `DVH-IMS-V1.2_Notifications_and_Escalations.md` | Reference | ✅ CORRECT |
| `DVH-IMS-V1.2_Role_Deprecation_Registry.md` | Governance | ✅ CORRECT |
| `DVH-IMS-V1.2_Roles_and_Authority_Matrix.md` | Authority | ✅ CORRECT |
| `DVH-IMS-V1.2_Scale_Readiness_Roadmap.md` | Roadmap | ✅ CORRECT |
| `DVH-IMS-V1.2_Scope_and_Objectives.md` | Governance | ✅ CORRECT |
| `DVH-IMS-V1.2_Services_Module_Decomposition.md` | Architecture | ✅ CORRECT |
| `DVH-IMS-V1.2_Tasks_and_Phases.md` | Planning | ✅ CORRECT |
| `DVH-IMS-V1.2_Phase2_Workflow_Verification_Report.md` | **EXECUTION** | ❌ MUST MOVE |

### `/phases/DVH-IMS-V1.2/` Contents (2 files)

| File | Status |
|------|--------|
| `README.md` | ✅ Valid placeholder |
| `PHASE-1-Access-and-Authority-Foundation.md` | ⚠️ Marked INVALID (historical artifact) |

### `/restore-points/v1.2/` Contents (7 files)

| File | Status |
|------|--------|
| `README.md` | ✅ CORRECT |
| `RESTORE_POINT_*.md` (6 files) | ✅ CORRECT — Isolated |

**Conclusion:** Restore points are correctly isolated. No duplication detected.

---

## 3. Correction Actions

### Action 1: Relocate Phase 2 Execution Artifact

**Move:**
```
FROM: docs/DVH-IMS-V1.2/DVH-IMS-V1.2_Phase2_Workflow_Verification_Report.md
TO:   phases/DVH-IMS-V1.2/PHASE-2-Workflow-Verification-Report.md
```

**Rationale:** This is a Phase 2 execution deliverable (workflow verification report), not a reference document. It must reside in the phases folder per governance rules.

### Action 2: Update `/docs/DVH-IMS-V1.2/README.md`

Remove any reference to Phase 2 Workflow Verification Report from the document index (if present).

### Action 3: Update `/phases/DVH-IMS-V1.2/README.md`

Update to reflect:
- Phase 1 is CLOSED
- Phase 2 has active documentation
- Add entry for the relocated verification report

---

## 4. Post-Correction State

### `/docs/DVH-IMS-V1.2/` (17 files — reference only)

All remaining files are governance, architecture, design, or planning documents.

### `/phases/DVH-IMS-V1.2/` (3 files — execution artifacts)

| File | Phase | Status |
|------|-------|--------|
| `README.md` | — | Updated |
| `PHASE-1-Access-and-Authority-Foundation.md` | 1 | Historical (invalid) |
| `PHASE-2-Workflow-Verification-Report.md` | 2 | Active |

### `/restore-points/v1.2/` (7 files — untouched)

No changes required.

---

## 5. Technical Implementation

### Files to Create
| File | Purpose |
|------|---------|
| `phases/DVH-IMS-V1.2/PHASE-2-Workflow-Verification-Report.md` | Relocated Phase 2 artifact |

### Files to Delete
| File | Reason |
|------|--------|
| `docs/DVH-IMS-V1.2/DVH-IMS-V1.2_Phase2_Workflow_Verification_Report.md` | Governance violation removal |

### Files to Update
| File | Change |
|------|--------|
| `docs/DVH-IMS-V1.2/README.md` | Remove Phase 2 report reference (if present) |
| `phases/DVH-IMS-V1.2/README.md` | Update structure to reflect Phase 1 closure and Phase 2 active state |

---

## 6. Governance Compliance Verification

After correction, the following will be true:

| Folder | Contains | Compliant |
|--------|----------|-----------|
| `/docs/DVH-IMS-V1.2/` | Reference documentation only | ✅ YES |
| `/phases/DVH-IMS-V1.2/` | Phase execution artifacts only | ✅ YES |
| `/restore-points/v1.2/` | Restore point markers only | ✅ YES (unchanged) |

**Post-Correction Statement:**
"Repository structure now complies with DVH-IMS V1.2 governance. No execution artifacts remain in /docs/."

---

## 7. Scope Boundaries

### IN SCOPE
- Relocate Phase 2 Workflow Verification Report
- Update folder READMEs
- Verify restore point isolation

### OUT OF SCOPE
- No content changes to any document
- No Phase 2 execution continuation
- No restore point modifications
- No code changes

---

## 8. Deliverables

1. Phase 2 report relocated to `/phases/DVH-IMS-V1.2/`
2. `/docs/` README updated (if needed)
3. `/phases/` README updated
4. Verification report confirming compliance

**Awaiting approval to execute this correction.**
