# DVH-IMS V1.3 — Phase 4C Risk Observations

## Document Type: Risk Analysis
## Version: 1.0
## Date: 2026-02-01
## Phase: Phase 4C — Administrative Officer Workflow Activation

---

## 1. Identified Risks

### 1.1 Cases in technical_approved Status

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Cases stuck in technical_approved | Medium | UI shows clear path to in_admin_review | ✅ MITIGATED |

**Details:** Cases currently in `technical_approved` status can no longer transition directly to `screening`. They must proceed through `in_admin_review`. The UI now displays this transition path clearly.

### 1.2 User Expectation Adjustment

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Users expect direct path to screening | Low | Status badges provide visual guidance | ✅ MITIGATED |

**Details:** Admin staff users who previously processed cases directly from technical approval to screening will now see the intermediate admin review step.

---

## 2. Non-Risks (Clarifications)

### 2.1 No New RLS Policies

| Concern | Resolution |
|---------|------------|
| Will admin_staff have access to new statuses? | Yes - existing policies are status-agnostic for district-scoped access |

**Details:** The existing `admin_staff` RLS policies do not filter by status value. They only enforce district scoping. Therefore, cases in `in_admin_review`, `admin_complete`, and `returned_to_technical` are automatically accessible.

### 2.2 No Enum Extension

| Concern | Resolution |
|---------|------------|
| Is a new role needed? | No - admin_staff role already exists and has appropriate permissions |

**Details:** Unlike Phase 4A (social_field_worker) and Phase 4B (technical_inspector), Phase 4C does not add a new role. It activates a workflow step using the existing `admin_staff` role.

---

## 3. Operational Considerations

### 3.1 Workflow Sequence

| Stage | Actor | Status Values |
|-------|-------|---------------|
| 1. Social Review | social_field_worker | in_social_review, social_completed |
| 2. Technical Review | technical_inspector | in_technical_review, technical_approved |
| 3. Admin Review | admin_staff | in_admin_review, admin_complete |
| 4. Processing | frontdesk_bouwsubsidie | screening, fieldwork, etc. |

### 3.2 Return Paths

| Return Path | From Status | To Status | Purpose |
|-------------|-------------|-----------|---------|
| returned_to_intake | in_social_review | returned_to_intake | Social worker needs more info |
| returned_to_social | in_technical_review | returned_to_social | Tech needs social re-review |
| returned_to_technical | in_admin_review | returned_to_technical | Admin needs tech re-review |

---

## 4. Security Observations

### 4.1 Trigger Enforcement

| Observation | Status |
|-------------|--------|
| Backend trigger prevents bypass | ✅ ENFORCED |
| SECURITY DEFINER prevents role escalation | ✅ CONFIRMED |
| Invalid transitions logged to audit | ✅ ACTIVE |

### 4.2 Policy Observations

| Observation | Status |
|-------------|--------|
| District scoping maintained | ✅ CONFIRMED |
| Cross-district access blocked | ✅ ENFORCED |
| admin_staff cannot access housing module | ✅ CONFIRMED (separate RLS) |

---

## 5. Pre-existing Security Warnings

The security linter reports 11 warnings about "RLS Policy Always True". These are **pre-existing** conditions related to anonymous insert policies for the public wizard (Phase 9 implementation) and are NOT related to Phase 4C changes.

| Warning Type | Tables | Reason |
|--------------|--------|--------|
| USING (true) INSERT | person, household, etc. | Public wizard submission |

These warnings are architectural decisions for the public-facing wizard and do not represent security vulnerabilities for authenticated admin operations.

---

## 6. Performance Considerations

| Consideration | Impact | Notes |
|---------------|--------|-------|
| Additional workflow step | Minimal | Status updates are O(1) operations |
| Trigger execution | Minimal | Single function call per status change |
| Additional audit logging | Minimal | Append-only insert operation |

---

## 7. Rollback Readiness

### 7.1 Database Rollback

If Phase 4C needs to be reverted:

```sql
-- Revert to Phase 4B trigger (technical_approved → screening allowed)
-- Use restore point RESTORE_POINT_V1.3_PHASE4C_START
```

### 7.2 Application Rollback

1. Revert `src/hooks/useAuditLog.ts` to Phase 4B version
2. Revert `src/app/(admin)/subsidy-cases/[id]/page.tsx` to Phase 4B version

---

## 8. Recommendations

### 8.1 User Communication

| Action | Priority | Status |
|--------|----------|--------|
| Notify admin staff of new workflow step | Medium | PENDING (operational) |
| Update user documentation | Low | NOT IN SCOPE |

### 8.2 Monitoring

| Action | Priority | Status |
|--------|----------|--------|
| Monitor audit logs for blocked transitions | Medium | RECOMMENDED |
| Track cases in returned_to_technical | Low | OPTIONAL |

---

## 9. Risk Summary

| Category | Count | Severity |
|----------|-------|----------|
| Critical Risks | 0 | - |
| High Risks | 0 | - |
| Medium Risks | 1 | Mitigated |
| Low Risks | 1 | Mitigated |

---

**PHASE 4C RISK ANALYSIS COMPLETE — NO BLOCKERS IDENTIFIED**

---

**END OF RISK OBSERVATIONS**
