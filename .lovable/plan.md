

# Investigation: Allocation Tab Placeholder on Housing Registration Detail

## Finding

The "Allocation" tab (lines 575–586 in `src/app/(admin)/housing-registrations/[id]/page.tsx`) is a **hardcoded placeholder** showing "Allocation functionality coming in Phase 4". This is not a bug — it was intentionally left as a stub.

## Why It Was "Skipped"

The Allocation Engine was built as a **separate module** with its own pages:
- `/allocation-quotas` — District Quotas
- `/allocation-runs` — Run execution
- `/allocation-decisions` — Decision management
- `/allocation-assignments` — Assignment registration

These pages operate on their own tables (`allocation_run`, `allocation_candidate`, `allocation_decision`, `assignment_record`). However, **no one connected this data back to individual housing registration records**. The tab was left as a placeholder with the intent to wire it up later.

## What the Tab Should Show

The database already has the relationships to display allocation data per registration:
- `allocation_candidate.registration_id` → candidates considered for this registration
- `allocation_decision.registration_id` → decisions made
- `assignment_record.registration_id` → final assignments

## Current App Status Context

The registration shown (WR-2026-000014) has status **"Under Review"**. Per the workflow transitions defined in the code:

```
received → under_review → urgency_assessed → waiting_list → matched → allocated → finalized
```

A registration in "Under Review" would not yet have allocation data anyway — it hasn't reached the `waiting_list` or `matched` stage. But the tab should still show meaningful content (e.g., "Not yet eligible for allocation" or the actual allocation history if any exists).

## Proposed Fix

Replace the placeholder with a real data-fetching panel that:

1. Queries `allocation_candidate`, `allocation_decision`, and `assignment_record` for the current `registration_id`
2. If no data exists, shows a status-aware message:
   - Before `waiting_list`: "This registration has not yet reached the allocation stage"
   - At `waiting_list`: "Awaiting allocation run for district [X]"
   - At `matched`/`allocated`: Shows candidate/decision/assignment details
3. Displays a timeline of allocation events if data exists

### Files to modify
- `src/app/(admin)/housing-registrations/[id]/page.tsx` — replace placeholder tab content with real queries and conditional display

### Files to create
- `src/app/(admin)/housing-registrations/[id]/components/AllocationPanel.tsx` — extracted component for the allocation tab

### Constraints
- Read-only display — no new write operations
- No schema changes
- No RLS changes
- No business logic changes
- Uses existing table relationships

