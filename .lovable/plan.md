

# DVH-IMS v1.7.x — Smoke Test Plan (Docs Sync Admin / Wizard)

## Static Code Analysis: PASS

All admin views correctly import from the shared `src/config/documentRequirements.ts`. No hardcoded lists, no deprecated documents, no duplicated definitions.

### Alignment Verification (Code-Level)

| Service | Shared Config | Wizard Constants | Admin Detail | DirectorReview | Match |
|---------|--------------|-----------------|--------------|----------------|-------|
| Bouwsubsidie | 5M + 2O | 5M + 2O (same codes) | Uses shared config | Uses shared config | YES |
| Housing | 3M + 3O | 3M + 3O (same codes) | Uses shared config | N/A | YES |

### Document Code Cross-Check

**Bouwsubsidie** (all 3 sources aligned):
- ID_COPY (mandatory) -- wizard, config, admin
- INCOME_PROOF (mandatory) -- wizard, config, admin
- LAND_TITLE (mandatory) -- wizard, config, admin
- BANK_STATEMENT (mandatory) -- wizard, config, admin
- HOUSEHOLD_COMP (mandatory) -- wizard, config, admin
- CBB_EXTRACT (optional) -- wizard, config, admin
- FAMILY_EXTRACT (optional) -- wizard, config, admin

**Housing** (all 3 sources aligned):
- ID_COPY (mandatory) -- wizard, config, admin
- INCOME_PROOF (mandatory) -- wizard, config, admin
- RESIDENCE_PROOF (mandatory) -- wizard, config, admin
- FAMILY_COMPOSITION (optional) -- wizard, config, admin
- MEDICAL_CERT (optional) -- wizard, config, admin
- EMERGENCY_PROOF (optional) -- wizard, config, admin

### Deprecated Documents Check: PASS
Construction Plan, Cost Estimate, Building Permit do NOT appear in shared config or admin views.

---

## Runtime Smoke Test Plan

Since this is a smoke test with no code changes expected, the runtime validation requires browser-based testing against the live staging preview.

### Test A: Bouwsubsidie

1. Navigate to Admin > Subsidy Cases > select any existing case with uploaded documents
2. Open Documents tab
3. **Verify Required Documents sidebar** shows exactly 7 items (5 mandatory with *, 2 optional without *)
4. **Verify names match**: Copy of ID, Inkomensverklaring (AOV/loonstrook), Land Title / Deed, Bank Statement, Household Composition, CBB uittreksel / Nationaliteit verklaring, Gezinuittreksel
5. **Verify checkmark logic**: uploaded docs show green check, missing show grey X
6. **Verify Director Review tab** (if case is in director-eligible status): Document Completeness badge shows correct X/5 count
7. Screenshot evidence

### Test B: Housing Registration

1. Navigate to Admin > Housing Registrations > select any existing registration with uploaded documents
2. Open Documents tab
3. **Verify Required Documents sidebar** shows exactly 6 items (3 mandatory with *, 3 optional without *)
4. **Verify names match**: Copy of ID, Income Proof, Residence Proof, Family Composition, Medical Certificate, Emergency Proof
5. **Verify checkmark logic**: uploaded docs show green check, missing show grey X
6. Screenshot evidence

### Test C: Console / Layout

1. Check browser console for React key warnings or errors on both Documents tabs
2. Verify no layout overflow or shift in the sidebar panel

---

## Potential Data-Layer Concern (Non-Blocking)

The Uploaded Documents table in the Bouwsubsidie admin shows `doc.requirement?.document_name` from the database `subsidy_document_requirement` join. If DB records have stale names (e.g., old labels), the Uploaded column could display different names than the Required sidebar. This is NOT a code bug -- it would be a data migration concern. Same pattern exists for Housing with `housing_document_requirement`.

**Recommendation**: If names mismatch at runtime, a one-time DB update of `document_name` in the requirement tables would resolve it. No code change needed.

---

## Execution Approach

1. Use browser automation to navigate to admin views and capture screenshots
2. Compare rendered lists against shared config definitions
3. Report PASS/FAIL per test item
4. Update docs/backend.md and docs/architecture.md with smoke test outcome
5. No code changes unless a FAIL is found (minimal fix only, with approval)

## Files to Update (Documentation Only, Post-Test)

| File | Update |
|------|--------|
| `docs/backend.md` | Add smoke test outcome for v1.7.x doc sync |
| `docs/DVH-IMS-V1.0_1.1/architecture.md` | Note shared config validation status |

