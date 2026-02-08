# DVH-IMS — Field Worker Flows

**Version:** V1.5 (Test & Stabilization)
**Audience:** social_field_worker, technical_inspector
**Status:** AS-IS operational reference — no new features

---

## 1. My Visits

- Route: `/my-visits`
- Displays visits assigned to you via Case Assignments
- Shows: case number, applicant name, assignment date, status
- Use this as your primary work queue

---

## 2. Control Queue (Read Access)

- Route: `/control-queue`
- View subsidy cases in your district
- Read-only: you cannot change case status or assignments from here
- Use for context when reviewing your assigned cases

---

## 3. Viewing Assigned Cases

- Route: `/case-assignments`
- View your own active assignments
- See: case reference, your role context, assignment status, date
- You cannot see other workers' assignments
- You cannot create, reassign, or revoke assignments

---

## 4. Social Field Worker — Report Submission

### When to Submit
- After completing a social assessment visit for an assigned case
- Case must be in the appropriate workflow step

### How to Submit
1. Navigate to the assigned case via My Visits or Control Queue
2. Open the Social Review interface
3. Complete the structured assessment form (report_json)
4. Submit the report — this finalizes the assessment

### What Gets Logged
- `SOCIAL_ASSESSMENT_STARTED` — when you begin the report
- `SOCIAL_ASSESSMENT_COMPLETED` — when you finalize and submit
- Actor (your user ID), role, case ID, and timestamp are recorded

### Key Rules
- Reports cannot be edited after finalization (`is_finalized = true`)
- One social report per case (1:1 relationship)
- You must be assigned to the case to submit a report

---

## 5. Technical Inspector — Report Submission

### When to Submit
- After completing a technical inspection visit for an assigned case
- Case must be in the appropriate workflow step

### How to Submit
1. Navigate to the assigned case via My Visits or Control Queue
2. Open the Technical Review interface
3. Complete the structured inspection form (report_json)
4. Submit the report — this finalizes the inspection

### What Gets Logged
- `TECHNICAL_INSPECTION_STARTED` — when you begin the report
- `TECHNICAL_INSPECTION_COMPLETED` — when you finalize and submit
- Actor (your user ID), role, case ID, and timestamp are recorded

### Key Rules
- Reports cannot be edited after finalization (`is_finalized = true`)
- One technical report per case (1:1 relationship)
- You must be assigned to the case to submit a report

---

## 6. What Field Workers CANNOT Do

| Action | Permitted? |
|--------|-----------|
| Create, reassign, or revoke assignments | ❌ No |
| Make decisions on dossiers (approve/reject) | ❌ No |
| Schedule visits for others | ❌ No |
| Access the Archive | ❌ No |
| View audit logs | ❌ No |
| Manage user accounts or roles | ❌ No |
| Access other districts' data | ❌ No |
| Edit finalized reports | ❌ No |
| Generate Raadvoorstel documents | ❌ No |
| View other workers' assignments | ❌ No |
