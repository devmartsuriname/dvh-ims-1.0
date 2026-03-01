# DVH-IMS v1.7.x — Applicant List Avatar Fix (Initials Fallback)

## Current State

Three locations render applicant info in list/table rows:

1. **Dashboard widget** (`src/app/(admin)/dashboards/components/User.tsx`) — "Recent Subsidy Cases" (line 62) and "Recent Housing Registrations" (line 117) both use a hardcoded static avatar image (`avatar-2.jpg`) for every row.
2. **Subsidy Cases list** (`src/app/(admin)/subsidy-cases/components/CaseTable.tsx`) — Grid.js table, Applicant column is plain text (no avatar at all).
3. **Housing Registrations list** (`src/app/(admin)/housing-registrations/components/RegistrationTable.tsx`) — Grid.js table, Applicant column is plain text (no avatar at all).

None of these use a shared Avatar component — the dashboard uses raw `<img>` tags, and the Grid.js tables use string data. This means changes are fully isolated with zero global side-effect risk.

## Implementation Steps

### Step 0 — Restore Point

Create `docs/restore-points/v1.7/RESTORE_POINT_V1_7_APPLICANT_LIST_AVATAR_INITIALS.md` listing all files to be touched and rollback instructions.

### Step 1 — Create ApplicantInitialsAvatar Component

**New file:** `src/components/applicants/ApplicantInitialsAvatar.tsx`

A small, self-contained component used ONLY in applicant list rows.

**Props:** `firstName?: string`, `lastName?: string`, `size?: 'xs' | 'sm'`

**Initials logic (defensive):**

- Both names present: first char of each, uppercased
- Only one name: first two chars (or one if single char)
- No name at all: renders "?"

**Deterministic color:** Simple hash of the full name string, mapped to a fixed palette of 8 Darkone-compatible Bootstrap background classes (e.g., `bg-primary`, `bg-success`, `bg-info`, `bg-warning`, `bg-danger`, `bg-secondary`, `bg-dark`, `bg-purple`). Same name always produces same color.

**Accessibility:** `aria-label="Applicant: {Full Name} ({Initials})"`

**Styling:** Uses existing `.avatar-xs` / `.avatar-title` / `.rounded-circle` classes from `_avatar.scss`. No new CSS.

### Step 2 — Update Dashboard Widget (User.tsx)

Replace the two `<img src={avatar2}>` usages (lines 62 and 117) with the new `<ApplicantInitialsAvatar>` component, passing `firstName={item.person?.first_name}` and `lastName={item.person?.last_name}`.

Remove the unused `avatar2` import.

### Step 3 — Update Grid.js Tables (CaseTable + RegistrationTable)

Since Grid.js uses `html()` string formatters, the Applicant column formatter will be updated to render an inline initials circle via raw HTML (same logic as the React component but as a template string).

Create a shared utility function `renderApplicantAvatarHtml(firstName, lastName)` in a small helper (or inline) that:

- Computes initials + deterministic color class
- Returns an HTML string: `<span class="avatar-xs rounded-circle avatar-title bg-{color} d-inline-flex" aria-label="...">{INITIALS}</span><span class="ms-1">{name}</span>`

Update the `data` mapping in both tables to pass `firstName` and `lastName` separately (instead of pre-concatenated), and update the Applicant column to use a `formatter` with `html()`.

### Step 4 — Documentation Updates

- Update `docs/backend.md` with a v1.7.x entry for this change.
- Update `docs/DVH-IMS-V1.0_1.1/architecture.md` under Admin UI section.

### Files Changed Summary


| File                                                                            | Action                                               |
| ------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `src/components/applicants/ApplicantInitialsAvatar.tsx`                         | CREATE                                               |
| `src/app/(admin)/dashboards/components/User.tsx`                                | EDIT — replace static avatar with initials component |
| `src/app/(admin)/subsidy-cases/components/CaseTable.tsx`                        | EDIT — add initials avatar to Applicant column       |
| `src/app/(admin)/housing-registrations/components/RegistrationTable.tsx`        | EDIT — add initials avatar to Applicant column       |
| `docs/restore-points/v1.7/RESTORE_POINT_V1_7_APPLICANT_LIST_AVATAR_INITIALS.md` | CREATE                                               |
| `docs/backend.md`                                                               | EDIT                                                 |
| `docs/DVH-IMS-V1.0_1.1/architecture.md`                                         | EDIT                                                 |


### NOTE — Approval Conditions (Hard Gates)

You may proceed ONLY if the following conditions are strictly respected:

1) Scope Limitation

   - Apply the initials avatar logic ONLY to applicant list contexts:

     • Housing Registrations list

     • Subsidy Cases list

     • Recent Subsidy Cases widget

   - Do NOT modify global Avatar components.

   - Do NOT change profile pages, detail pages, header avatars, or admin user avatars.

2) Zero-Risk Implementation

   - No database, schema, RLS, or backend changes.

   - No edge function modifications.

   - No new CSS files or design refactors.

   - Use existing Darkone/Tailwind utility classes only.

   - If Grid.js HTML formatter is used, inject initials safely without adding new dependencies.

If any of these conditions cannot be met exactly, STOP and report before proceeding.  
  
Risk Assessment


| Risk                     | Level | Reason                                               |
| ------------------------ | ----- | ---------------------------------------------------- |
| Global avatar regression | NONE  | No shared Avatar component is modified               |
| Layout break             | NONE  | Uses existing `.avatar-xs` + `.avatar-title` classes |
| DB/RLS impact            | NONE  | No backend changes                                   |
| Bouwsubsidie regression  | NONE  | Only Applicant column rendering changes              |
