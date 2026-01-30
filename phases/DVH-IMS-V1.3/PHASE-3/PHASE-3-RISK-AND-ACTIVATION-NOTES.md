# DVH-IMS V1.3 — Phase 3 Risk and Activation Notes

**Document Type:** Risk Assessment and Activation Guide  
**Version:** 1.0  
**Date:** 2026-01-30  
**Phase:** Phase 3 — Role & Workflow Activation Preparation  
**Status:** REFERENCE DOCUMENT

---

## 1. Document Purpose

This document provides:

1. Risk assessment for role activation
2. Prerequisites checklist for activation
3. Activation sequence guidance
4. Rollback procedures
5. Verification criteria

---

## 2. Risk Assessment Matrix

### 2.1 Database Enum Extension Risks

| Risk ID | Risk Description | Likelihood | Impact | Mitigation |
|---------|------------------|------------|--------|------------|
| R-01 | Enum extension fails | Low | High | Test in staging first |
| R-02 | Existing queries break | Low | Medium | Enum extension is additive |
| R-03 | TypeScript types mismatch | Medium | Medium | Regenerate types after migration |
| R-04 | Rollback complexity | Medium | High | Enum values cannot be removed easily |

### 2.2 RLS Policy Risks

| Risk ID | Risk Description | Likelihood | Impact | Mitigation |
|---------|------------------|------------|--------|------------|
| R-05 | Policy conflicts | Medium | High | Test all role combinations |
| R-06 | Overly permissive policies | Low | Critical | Review with security checklist |
| R-07 | Overly restrictive policies | Medium | Medium | User acceptance testing |
| R-08 | Performance degradation | Low | Medium | Index optimization |

### 2.3 Workflow Integration Risks

| Risk ID | Risk Description | Likelihood | Impact | Mitigation |
|---------|------------------|------------|--------|------------|
| R-09 | Status transition deadlocks | Medium | High | Validate transition matrix |
| R-10 | Parallel processing conflicts | Medium | Medium | Synchronization point enforcement |
| R-11 | Audit trail gaps | Low | Critical | Correlation ID enforcement |
| R-12 | Notification routing errors | Medium | Medium | Test notification targeting |

### 2.4 User Experience Risks

| Risk ID | Risk Description | Likelihood | Impact | Mitigation |
|---------|------------------|------------|--------|------------|
| R-13 | Role confusion | Medium | Medium | Clear role documentation |
| R-14 | UI complexity increase | High | Medium | Phased UI rollout |
| R-15 | Training requirements | High | Medium | Training materials preparation |

---

## 3. Activation Prerequisites Checklist

### 3.1 Infrastructure Prerequisites

| # | Prerequisite | Status | Owner |
|---|--------------|--------|-------|
| 1 | Staging environment available | ⏸️ REQUIRED | DevOps |
| 2 | Database backup created | ⏸️ REQUIRED | DBA |
| 3 | Rollback procedure tested | ⏸️ REQUIRED | DevOps |
| 4 | Performance baseline established | ⏸️ REQUIRED | DevOps |

### 3.2 Database Prerequisites

| # | Prerequisite | Status | Owner |
|---|--------------|--------|-------|
| 5 | app_role enum extension script prepared | ✅ PREPARED | DBA |
| 6 | Status enum extension script prepared | ⏸️ REQUIRED | DBA |
| 7 | Security function updates prepared | ✅ PREPARED | DBA |
| 8 | RLS policy scripts prepared | ✅ PREPARED | DBA |
| 9 | Status history trigger updates prepared | ⏸️ REQUIRED | DBA |

### 3.3 Application Prerequisites

| # | Prerequisite | Status | Owner |
|---|--------------|--------|-------|
| 10 | TypeScript type definitions prepared | ✅ PREPARED | Dev |
| 11 | Role hook updates prepared | ⏸️ REQUIRED | Dev |
| 12 | UI components prepared | ⏸️ REQUIRED | Dev |
| 13 | Status change handlers updated | ⏸️ REQUIRED | Dev |
| 14 | Audit hook integration prepared | ✅ PREPARED | Dev |

### 3.4 Operational Prerequisites

| # | Prerequisite | Status | Owner |
|---|--------------|--------|-------|
| 15 | User accounts created | ⏸️ REQUIRED | Admin |
| 16 | Role assignments documented | ⏸️ REQUIRED | Admin |
| 17 | Training materials prepared | ⏸️ REQUIRED | Training |
| 18 | Go-live communication plan | ⏸️ REQUIRED | PM |

---

## 4. Activation Sequence

### 4.1 Phase 4A: Database Preparation (Proposed)

**Scope:** Database changes only, no UI activation

**Steps:**
1. Create database backup
2. Execute enum extension migration
3. Execute security function updates
4. Execute RLS policy creation
5. Execute status history trigger updates
6. Regenerate Supabase types
7. Verify database state

**Duration:** 1-2 hours  
**Rollback Window:** 24 hours

### 4.2 Phase 4B: Backend Integration (Proposed)

**Scope:** TypeScript updates, no UI activation

**Steps:**
1. Update TypeScript role types
2. Update role hook
3. Update status change handlers
4. Integrate audit hooks
5. Run unit tests
6. Verify backend functionality

**Duration:** 2-4 hours  
**Rollback Window:** 48 hours

### 4.3 Phase 4C: UI Activation (Proposed)

**Scope:** User-facing changes

**Steps:**
1. Enable role selection in user management
2. Enable role-specific views
3. Enable role-specific actions
4. Run end-to-end tests
5. User acceptance testing

**Duration:** 4-8 hours  
**Rollback Window:** 72 hours

### 4.4 Phase 4D: Production Rollout (Proposed)

**Scope:** Go-live

**Steps:**
1. Create production backup
2. Execute database migrations
3. Deploy application updates
4. Create user accounts
5. Assign roles
6. Monitor for issues
7. Confirm activation complete

**Duration:** 4-6 hours  
**Rollback Window:** 1 week

---

## 5. Rollback Procedures

### 5.1 Database Rollback Considerations

**CRITICAL:** PostgreSQL enum values CANNOT be easily removed once added.

**Mitigation Options:**

1. **Option A: Leave inactive values**
   - Enum values remain but are not referenced
   - RLS policies are dropped
   - UI hides inactive roles
   - Lowest risk, recommended

2. **Option B: Create new enum type**
   - Create new app_role_v2 enum
   - Migrate all references
   - Drop old enum
   - High risk, not recommended

3. **Option C: Restore from backup**
   - Full database restore
   - Data loss since backup
   - Emergency only

### 5.2 Rollback Scripts

```sql
-- ROLLBACK SCRIPT — OPTION A (RECOMMENDED)
-- Drop RLS policies for new roles

/*
DROP POLICY IF EXISTS "social_field_worker_select_subsidy_case" ON public.subsidy_case;
DROP POLICY IF EXISTS "social_field_worker_update_subsidy_case" ON public.subsidy_case;
-- ... additional policy drops

-- Revert security functions
CREATE OR REPLACE FUNCTION public.is_national_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id
    AND role IN ('system_admin', 'minister', 'project_leader', 'audit')
  )
$$;
*/

-- Note: Enum values remain but are inert
```

### 5.3 Application Rollback

1. Revert TypeScript type changes (git revert)
2. Revert role hook changes (git revert)
3. Revert UI changes (git revert)
4. Deploy previous version
5. Verify functionality

---

## 6. Verification Criteria

### 6.1 Database Verification

| Test ID | Test Description | Expected Result |
|---------|------------------|-----------------|
| AV-01 | Query app_role enum | Shows 11 values |
| AV-02 | Query is_national_role function | Includes director, ministerial_advisor |
| AV-03 | Query RLS policies | New policies exist |
| AV-04 | Test has_role for new roles | Returns correct boolean |

### 6.2 Backend Verification

| Test ID | Test Description | Expected Result |
|---------|------------------|-----------------|
| AV-05 | TypeScript compilation | No errors |
| AV-06 | Role hook returns new roles | 11 roles available |
| AV-07 | Status change handlers work | All transitions valid |
| AV-08 | Audit events created | Correct action logged |

### 6.3 UI Verification

| Test ID | Test Description | Expected Result |
|---------|------------------|-----------------|
| AV-09 | Role dropdown shows new roles | All 11 roles visible |
| AV-10 | Role-specific views render | Correct view per role |
| AV-11 | Role-specific actions work | Correct transitions |
| AV-12 | Notifications route correctly | Right recipients |

### 6.4 Security Verification

| Test ID | Test Description | Expected Result |
|---------|------------------|-----------------|
| AV-13 | Cross-role access denied | RLS blocks unauthorized |
| AV-14 | District scope enforced | District roles see own district only |
| AV-15 | Service scope enforced | BS-only roles don't see WR |
| AV-16 | Audit trail complete | All actions logged |

---

## 7. Monitoring Plan

### 7.1 Key Metrics

| Metric | Normal Range | Alert Threshold |
|--------|--------------|-----------------|
| RLS policy evaluation time | < 10ms | > 50ms |
| Status change latency | < 500ms | > 2s |
| Audit event creation rate | Baseline ± 20% | > 50% increase |
| Error rate | < 0.1% | > 1% |

### 7.2 Monitoring Queries

```sql
-- MONITORING QUERY — Performance
-- Check RLS policy performance

/*
SELECT 
  relname as table_name,
  seq_scan,
  idx_scan,
  n_tup_ins,
  n_tup_upd
FROM pg_stat_user_tables
WHERE relname IN ('subsidy_case', 'housing_registration', 'user_roles')
ORDER BY seq_scan DESC;
*/

-- MONITORING QUERY — Audit Events
-- Check audit event creation rate

/*
SELECT 
  date_trunc('hour', occurred_at) as hour,
  actor_role,
  action,
  COUNT(*) as event_count
FROM audit_event
WHERE occurred_at > NOW() - INTERVAL '24 hours'
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 4 DESC;
*/
```

---

## 8. Communication Plan

### 8.1 Stakeholder Notification

| Stakeholder | Notification Timing | Content |
|-------------|---------------------|---------|
| System Admin | 1 week before | Full technical details |
| Department Heads | 3 days before | Role changes summary |
| End Users | 1 day before | Training materials |
| All Staff | Day of activation | Go-live announcement |

### 8.2 Training Requirements

| Role | Training Type | Duration |
|------|---------------|----------|
| Social Field Worker | Full workflow training | 4 hours |
| Technical Inspector | Full workflow + reports | 6 hours |
| Director | Approval workflow | 2 hours |
| Ministerial Advisor | Advisory workflow | 2 hours |

---

## 9. Governance Statement

**This document provides activation guidance for FUTURE REFERENCE.**

**No activation is authorized by this document.**

**Activation requires explicit authorization from Delroy.**

**The current system remains unchanged.**

---

**PHASE 3 — RISK AND ACTIVATION NOTES — COMPLETE**

---

**END OF DOCUMENT**
