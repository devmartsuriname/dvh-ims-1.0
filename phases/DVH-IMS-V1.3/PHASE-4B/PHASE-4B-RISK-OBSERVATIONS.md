# DVH-IMS V1.3 — Phase 4B Risk Observations

## Document Type: Risk Assessment
## Version: 1.0
## Date: 2026-01-30
## Phase: Phase 4B — Technical Inspector Activation (Bouwsubsidie Only)

---

## 1. Risks Identified

### 1.1 Cases Stuck in `social_completed`

**Risk Level:** LOW

**Description:** Cases currently in `social_completed` status can no longer transition directly to `screening`. They must now go through `in_technical_review`.

**Mitigation:**
- UI shows available transitions clearly
- Users can see `In Technical Review` as the next step
- No data loss - cases remain processable

**Impact:** Operational process change only. No technical blockers.

---

### 1.2 Enum Value Cannot Be Removed

**Risk Level:** INFORMATIONAL

**Description:** PostgreSQL does not allow removing enum values. The `technical_inspector` value is permanent.

**Mitigation:**
- Value can remain inert if role is deactivated
- RLS policies can be dropped to disable access
- This is standard PostgreSQL behavior

**Impact:** None. This is expected behavior.

---

### 1.3 Migration Splitting Required

**Risk Level:** RESOLVED

**Description:** Initial migration failed because new enum values cannot be used in the same transaction where they are created.

**Resolution:** Migration was split into two parts:
1. Enum extension only
2. Trigger + RLS policies

**Impact:** None. Issue was resolved during implementation.

---

### 1.4 Pre-existing Linter Warnings

**Risk Level:** INFORMATIONAL

**Description:** The security linter reports 11 WARN-level issues for `USING (true)` policies. These are pre-existing and relate to anonymous public submission flows.

**Observation:** These policies are intentional for the public intake wizard and do not represent vulnerabilities. They allow:
- Anonymous person creation
- Anonymous household creation
- Anonymous case submission
- Anonymous status lookup (via token)

**Impact:** None. These are by design and out of Phase 4B scope.

---

## 2. Risks NOT Observed

| Potential Risk | Status |
|----------------|--------|
| RLS policy conflicts | NOT OBSERVED |
| Trigger function errors | NOT OBSERVED |
| TypeScript compilation issues | NOT OBSERVED |
| UI rendering problems | NOT OBSERVED |
| Cross-module contamination | NOT OBSERVED |
| Woningregistratie impact | NOT OBSERVED |
| Social Field Worker regression | NOT OBSERVED |

---

## 3. Monitoring Recommendations

| Area | Recommendation |
|------|----------------|
| Transition Failures | Monitor audit_event for INVALID_TRANSITION_BLOCKED |
| RLS Denials | Check Supabase logs for policy violation errors |
| User Confusion | Collect feedback on new workflow steps |

---

## 4. Rollback Readiness

**Rollback Plan Status:** READY

If rollback is required:
1. Drop 12 RLS policies for technical_inspector
2. Revert trigger to Phase 4A matrix
3. Revert TypeScript changes
4. Revert UI changes
5. Enum value remains but is inert

**Estimated Rollback Time:** ~15 minutes

---

## 5. Risk Summary

| Risk Level | Count |
|------------|-------|
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 1 |
| INFORMATIONAL | 3 |
| RESOLVED | 1 |

---

## 6. Conclusion

**No blocking risks identified.**

**Phase 4B implementation is LOW RISK.**

**System stability is MAINTAINED.**

---

**RISK ASSESSMENT COMPLETE**
