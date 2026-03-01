# Restore Point — v1.7.x Applicant List Avatar Initials

**Created:** 2026-03-01
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

## Scope

Replace static/missing applicant avatars in list views with deterministic initials-based avatars.

## Files Touched

| File | Action |
|------|--------|
| `src/components/applicants/ApplicantInitialsAvatar.tsx` | CREATE |
| `src/app/(admin)/dashboards/components/User.tsx` | EDIT — replace `<img avatar2>` with `<ApplicantInitialsAvatar>` |
| `src/app/(admin)/subsidy-cases/components/CaseTable.tsx` | EDIT — add initials avatar to Applicant column formatter |
| `src/app/(admin)/housing-registrations/components/RegistrationTable.tsx` | EDIT — add initials avatar to Applicant column formatter |
| `docs/backend.md` | EDIT — add changelog entry |
| `docs/DVH-IMS-V1.0_1.1/architecture.md` | EDIT — add changelog entry |

## Rollback Strategy

1. Delete `src/components/applicants/ApplicantInitialsAvatar.tsx`
2. Revert `User.tsx` to restore `avatar2` import and `<img>` tags
3. Revert `CaseTable.tsx` Applicant column to plain text
4. Revert `RegistrationTable.tsx` Applicant column to plain text
5. Remove changelog entries from `docs/backend.md` and `docs/DVH-IMS-V1.0_1.1/architecture.md`

## Verification Screens

- Dashboard: Recent Subsidy Cases widget
- Dashboard: Recent Housing Registrations widget
- Subsidy Cases list (/subsidy-cases)
- Housing Registrations list (/housing-registrations)

## Constraints

- No DB/schema/RLS/edge function changes
- No global avatar component modifications
- Darkone styling only (existing CSS classes)
