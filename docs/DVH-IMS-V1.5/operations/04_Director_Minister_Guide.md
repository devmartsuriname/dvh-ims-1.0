# DVH-IMS — Director and Minister Read-Only Guide

**Version:** V1.5 (Test & Stabilization)
**Audience:** director, ministerial_advisor, minister
**Status:** AS-IS operational reference — no new features

---

## 1. Dashboard Overview

- Route: `/dashboard`
- System-wide activity overview
- Available to all oversight roles
- No KPI tracking or automated reporting exists in this version

---

## 2. Control Queue (Read-Only Oversight)

- Route: `/control-queue`
- View all subsidy cases across all districts (national scope)
- Filter by status, district, and date
- No data mutations permitted from this view

---

## 3. Subsidy Cases

- Route: `/subsidy-cases` (via Control Queue)
- View full dossier details: applicant, household, documents, reports
- Decision authority per the 8-step workflow:

| Role | Decision Step | Action |
|------|--------------|--------|
| director | Step 6: Organizational Approval | Approve or return dossier |
| ministerial_advisor | Step 7: Advisory Review | Provide formal advice (paraaf) |
| minister | Step 8: Final Decision | Approve or return dossier |

### Decision Rules
- Each decision step requires mandatory justification (reason field)
- All decisions are audit-logged with actor, action, reason, and timestamp
- Returning a dossier sends it back to the previous step
- The Minister's deviation from Ministerial Advisor's advice is immutably logged

---

## 4. Case Assignments (Read-Only Oversight)

- Route: `/case-assignments`
- View all worker-to-case assignments across all districts
- See: case reference, assigned worker, role, status, date, reason
- No assignment creation, modification, or revocation permitted

---

## 5. Archive Access

- Route: `/archive`
- Access terminal dossiers (approved/rejected/finalized)
- National-level scope: all districts visible
- Strictly read-only — no modifications permitted
- Filter by status, date range, and district

---

## 6. Audit Log Access

- Route: `/audit-log`
- View all audit events across the system
- Filter by: date range, action type, entity type, actor
- Useful for verifying decision trails and accountability
- Append-only: no editing or deletion of audit records

---

## 7. What Oversight Roles CANNOT Do

| Action | Permitted? |
|--------|-----------|
| Create or modify case assignments | ❌ No |
| Create or edit person/household records | ❌ No |
| Upload or verify documents | ❌ No |
| Submit social or technical reports | ❌ No |
| Schedule visits | ❌ No |
| Manage user accounts or roles | ❌ No |
| Run allocation engine | ❌ No |
| Generate Raadvoorstel documents outside workflow | ❌ No |
| Delete or modify audit records | ❌ No |
| Bypass the sequential decision chain | ❌ No |
