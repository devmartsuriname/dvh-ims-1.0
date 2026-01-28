# Restore Point: Route Hard Deny - START

**Created:** 2026-01-28
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Type:** Pre-Implementation Checkpoint

---

## Purpose

This restore point documents the system state before implementing the catch-all 404 route and related fixes.

---

## Current Issues Identified

1. **Missing Catch-All Route**: Router lacks `path="*"` handler, causing blank pages for unregistered paths
2. **Broken Dashboard Links**: Two navigation links point to non-existent routes
3. **Template Branding**: index.html still contains Darkone template meta tags

---

## Current Authoritative Route Inventory (22 Routes)

### Public Routes (4)
| Path | Component | Status |
|------|-----------|--------|
| `/` | LandingPage | VALID |
| `/bouwsubsidie/apply` | BouwsubsidieWizard | VALID |
| `/housing/register` | HousingWizard | VALID |
| `/status` | StatusTracker | VALID |

### Auth Routes (4)
| Path | Component | Status |
|------|-----------|--------|
| `/auth/sign-in` | AuthSignIn | VALID |
| `/auth/sign-up` | AuthSignUp | VALID |
| `/auth/reset-password` | ResetPassword | VALID |
| `/error-pages/pages-404` | Error404 | VALID |

### Admin Routes (14)
| Path | Component | Status |
|------|-----------|--------|
| `/dashboards` | Dashboards | VALID |
| `/persons` | PersonList | VALID |
| `/persons/:id` | PersonDetail | VALID |
| `/households` | HouseholdList | VALID |
| `/households/:id` | HouseholdDetail | VALID |
| `/subsidy-cases` | SubsidyCaseList | VALID |
| `/subsidy-cases/:id` | SubsidyCaseDetail | VALID |
| `/housing-registrations` | HousingRegistrationList | VALID |
| `/housing-registrations/:id` | HousingRegistrationDetail | VALID |
| `/housing-waiting-list` | HousingWaitingList | VALID |
| `/allocation-quotas` | AllocationQuotas | VALID |
| `/allocation-runs` | AllocationRuns | VALID |
| `/allocation-runs/:id` | AllocationRunDetail | VALID |
| `/allocation-decisions` | AllocationDecisions | VALID |
| `/allocation-assignments` | AllocationAssignments | VALID |
| `/audit-log` | AuditLog | VALID |

---

## Files to be Modified

| File | Change |
|------|--------|
| `src/routes/router.tsx` | Add catch-all 404 route |
| `src/app/(admin)/dashboards/components/User.tsx` | Fix 2 broken navigation links |
| `index.html` | Update meta tags to DVH-IMS branding |

---

## Evidence: Demo Route Scan Results

Repository-wide scan confirmed ZERO demo/template routes exist in the codebase:

| Pattern | Status |
|---------|--------|
| `/pricing` | NOT PRESENT |
| `/faq` | NOT PRESENT |
| `/blog/` | NOT PRESENT |
| `/account-settings` | NOT PRESENT |
| `/user-profile` | NOT PRESENT |
| `/landing/startup` | NOT PRESENT |
| `/maps/vector-maps` | NOT PRESENT |

URL dropdown suggestions are browser-level autocomplete artifacts, not application-driven.

---

## Governance Compliance

- Guardian Rules: COMPLIANT
- Darkone Admin 1:1: MAINTAINED
- No scope creep: CONFIRMED
