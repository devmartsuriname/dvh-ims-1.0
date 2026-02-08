

# Update V1.5 Phase 2 Planning — Resolve Q1-Q6 (PRD-Bound)

**Type:** Documentation update (single file)
**Scope:** Replace Section 10 with finalized, binding decisions

---

## File to Modify

`docs/DVH-IMS-V1.5/V1.5_Phase2_Assignments_Planning.md`

---

## Changes

### 1. Update Section 10 header and content

Replace the current "Open Questions and Decision Points" table (lines 147-156) with a new section titled:

**"10. Resolved Decision Points (PRD-Bound)"**

Prefaced with: "The following questions have been resolved based on the Master PRD. These decisions are BINDING and no interpretation or expansion is permitted."

Resolved answers:

| ID | Decision | Source |
|----|----------|--------|
| Q1 | An Assignment is an OPERATIONAL task allocation within an existing dossier. Assignments do NOT affect dossier status, decision-making, prioritization, or scoring. | Master PRD |
| Q2 | Only the Projectleider / Onderdirecteur may assign, modify, or revoke assignments. Operational roles may only receive and execute. Director, Minister, Policy Advisor, and Audit roles are read-only. | Master PRD |
| Q3 | Assignments are PERSON-BASED. Mandatory for auditability and individual accountability. | Master PRD |
| Q4 | There is NO direct relationship between assignments and dossier status. Assignments do NOT trigger or influence status transitions. | Master PRD |
| Q5 | All assignment actions are audit-mandatory: who, what, when, which dossier, and reason. | Master PRD |
| Q6 | NOT ALLOWED: No auto-routing, workload balancing, notifications, escalations, or performance metrics in V1.5 Phase 2. | Master PRD |

### 2. Update Role Interaction Matrix (Section 5)

Align with Q2 decision. Remove `admin_staff` assign/reassign capabilities and `social_field_worker`/`technical_inspector` self-assign. Only `system_admin` and `project_leader` retain assign/reassign authority:

| Role | Can Assign | Can Reassign | Can View Own | Can View All | Can Schedule Visit |
|------|-----------|-------------|-------------|-------------|-------------------|
| system_admin | Yes (all) | Yes (all) | Yes | Yes | Yes |
| project_leader | Yes (all) | Yes (all) | Yes | Yes | Yes |
| admin_staff | No | No | Yes | District | No |
| frontdesk_bouwsubsidie | No | No | Yes | No | No |
| social_field_worker | No | No | Yes | No | No |
| technical_inspector | No | No | Yes | No | No |
| director | No | No | No | Yes (read-only) | No |
| ministerial_advisor | No | No | No | Yes (read-only) | No |
| minister | No | No | No | Yes (read-only) | No |
| audit | No | No | No | Yes (read-only) | No |

### 3. No other changes

All other sections (1-9, 11) remain unchanged. The execution gate statement in Section 11 remains as-is.

---

## Governance Compliance

- Decisions are PRD-derived only -- no new scope introduced
- No schema, RLS, UI, or implementation changes
- Document remains in PROPOSED status until implementation is authorized

