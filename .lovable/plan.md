

# Fix: Correct Grid.js Cell Indices for Applicant Initials Avatars

## Problem

Both Grid.js tables have an off-by-one index bug in the Applicant column formatter:

**CaseTable.tsx** (line 105-106):
- Data array: `[case_number(0), firstName(1), lastName(2), national_id(3), ...]`
- Formatter reads: `cells[2]` (lastName) and `cells[3]` (national_id) — WRONG
- Should read: `cells[1]` (firstName) and `cells[2]` (lastName)

**RegistrationTable.tsx** (line 122-125):
- Data array: `[reference_number(0), firstName(1), lastName(2), district(3), ...]`
- Formatter reads: `cells[2]` (lastName) and `cells[3]` (district) — WRONG
- Should read: `cells[1]` (firstName) and `cells[2]` (lastName)

This causes incorrect initials and potentially garbled names on both list pages.

## Fix (2 files, 2 lines each)

### 1. `src/app/(admin)/subsidy-cases/components/CaseTable.tsx`

Change the Applicant formatter (lines 105-106):
```
// Before:
const firstName = row.cells[2].data as string
const lastName = row.cells[3].data as string

// After:
const firstName = row.cells[1].data as string
const lastName = row.cells[2].data as string
```

### 2. `src/app/(admin)/housing-registrations/components/RegistrationTable.tsx`

Change the Applicant formatter (lines 123-124):
```
// Before:
const firstName = row.cells[2].data as string
const lastName = row.cells[3].data as string

// After:
const firstName = row.cells[1].data as string
const lastName = row.cells[2].data as string
```

## Verification

After fix, confirm on both list pages:
- Initials match actual applicant names (e.g., "Chantal Peroti" shows "CP", not "P-" or garbled)
- Dashboard widget initials remain correct (no change needed there)
- No layout regression

## Risk: NONE
- No DB/RLS/edge function changes
- Only correcting array index references in 2 files
