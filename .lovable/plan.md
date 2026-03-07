# V1.9 Phase 3 — Schema Recommendation Report

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Scope:** Analysis only — no implementation

---

## Options Evaluated

### Option A — Add columns to `subsidy_case`

**Rejected.** A case can require multiple visits (social visit, technical inspection, follow-up). Adding `scheduled_date` / `inspector_id` to the case row limits to one visit per case and pollutes the case entity with scheduling concerns.

### Option B — Dedicated `inspection_visit` table

**Recommended.** Clean separation. Supports multiple visits per case, full history, independent lifecycle.

### Option C — Extend `case_assignment`

**Rejected.** `case_assignment` is append-only and immutable by design (no UPDATE, no DELETE). Visit scheduling requires mutable state (reschedule date, update visit status from `scheduled` → `completed`). Adding mutable scheduling columns to an immutable table creates a governance conflict. The `case_assignment` table also serves a different purpose: tracking role-based responsibility, not operational visit logistics.

---

## Recommendation: New `inspection_visit` table

### Proposed Schema

```sql
create table public.inspection_visit (
  id              uuid primary key default gen_random_uuid(),
  case_id         uuid not null references public.subsidy_case(id),
  visit_type      text not null,           -- 'social' | 'technical' | 'follow_up'
  assigned_to     uuid not null references auth.users(id),
  scheduled_date  date not null,
  scheduled_by    uuid not null references auth.users(id),
  visit_status    text not null default 'scheduled',  -- 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  visit_notes     text,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
```

### Reasons

1. **Multiple visits per case** — One case may need a social visit AND a technical inspection, or follow-up visits. One-to-many relationship is natural.
2. **Mutable lifecycle** — Visits can be rescheduled or cancelled. This requires UPDATE capability, which `case_assignment` explicitly denies.
3. **Clean separation** — `case_assignment` = "who is responsible for this case." `inspection_visit` = "when does the inspector physically go to the address." Different concerns.
4. **Audit compatibility** — Each visit action (schedule, reschedule, complete, cancel) generates an `audit_event` entry with `entity_type: 'inspection_visit'`.
5. **Reporting** — Easy to query visit counts, completion rates, inspector workload by date range.

### Relations to Existing Tables

```text
subsidy_case  ──1:N──  inspection_visit
auth.users    ──1:N──  inspection_visit (assigned_to)
auth.users    ──1:N──  inspection_visit (scheduled_by)
```

No changes to `case_assignment`, `subsidy_case`, or any other existing table.

### Required Indexes

```sql
create index idx_inspection_visit_case_id on inspection_visit(case_id);
create index idx_inspection_visit_assigned_to on inspection_visit(assigned_to);
create index idx_inspection_visit_scheduled_date on inspection_visit(scheduled_date);
create index idx_inspection_visit_status on inspection_visit(visit_status);
```

### RLS Policies


| Action | Allowed Roles                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| INSERT | `system_admin`, `project_leader`                                                                                                     |
| SELECT | `system_admin`, `project_leader`, `admin_staff`, `audit`, `director`, own assignments (`assigned_to = auth.uid()`) for field workers |
| UPDATE | `system_admin`, `project_leader` (reschedule/cancel), `assigned_to` user (mark completed + add notes)                                |
| DELETE | Denied                                                                                                                               |


### Migration Impact

- One new table creation
- Four RLS policies
- One `updated_at` trigger (reuse existing `update_updated_at_column` function)
- Zero changes to existing tables
- Zero changes to existing RLS policies

### Example Workflow

```text
1. Case BS-2026-000008 enters 'fieldwork' status
2. Project Leader opens Schedule Visits page
3. Clicks "Schedule Visit" on the case row
4. Selects inspector, date, visit type → INSERT into inspection_visit
5. audit_event logged: action='visit_scheduled'
6. Inspector sees visit in My Visits
7. Inspector completes visit → UPDATE visit_status='completed', completed_at=now()
8. audit_event logged: action='visit_completed'
9. Project Leader advances case to next status
```

---

Approved.

Proceed with Phase 3 implementation using the dedicated `inspection_visit` table as recommended.

During implementation, also ensure:

1. `visit_type` and `visit_status` are enforced with explicit allowed values at DB level (check constraint or equivalent)

2. all visit actions `visit_scheduled`, `visit_rescheduled`, `visit_completed`, `visit_cancelled`) are audit-logged

3. no existing `case_assignment` behavior is changed

4. Schedule Visits remains compatible with My Visits filtering for assigned inspectors  
  
Awaiting approval to implement Phase 3 using this schema.