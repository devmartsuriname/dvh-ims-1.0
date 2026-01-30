# DVH-IMS V1.3 — Phase 3 Role Preparation

**Document Type:** Role Definition Specification  
**Version:** 1.0  
**Date:** 2026-01-30  
**Phase:** Phase 3 — Role & Workflow Activation Preparation  
**Status:** PREPARED — NOT ACTIVE

---

## 1. Document Purpose

This document defines the structural specifications for the 4 roles documented in V1.2 that are NOT YET instantiated in the database. These roles are **prepared for future activation** but remain **non-operational** in the current system.

---

## 2. Current Role Inventory (Active)

| Enum Value | V1.2 Mapping | Database Status | TypeScript Status |
|------------|--------------|-----------------|-------------------|
| `system_admin` | System Administrator | ✅ ACTIVE | ✅ ACTIVE |
| `minister` | Minister | ✅ ACTIVE | ✅ ACTIVE |
| `project_leader` | Project Leader/Deputy Director | ✅ ACTIVE | ✅ ACTIVE |
| `frontdesk_bouwsubsidie` | Frontdesk (Bouwsubsidie) | ✅ ACTIVE | ✅ ACTIVE |
| `frontdesk_housing` | Frontdesk (Woningregistratie) | ✅ ACTIVE | ✅ ACTIVE |
| `admin_staff` | Administrative Officer | ✅ ACTIVE | ✅ ACTIVE |
| `audit` | Auditor | ✅ ACTIVE | ✅ ACTIVE |

**Total Active Roles:** 7

---

## 3. Prepared Roles (Not Active)

### 3.1 Social Field Worker

| Attribute | Value |
|-----------|-------|
| **Proposed Enum Value** | `social_field_worker` |
| **Dutch Name** | Sociaal Veldwerker |
| **Service Applicability** | Both (Bouwsubsidie + Woningregistratie) |
| **Decision Chain Position** | Step 1P (Parallel with Frontdesk) |
| **Scope Type** | District-scoped |
| **Database Status** | ⏸️ PREPARED — NOT ACTIVE |
| **TypeScript Status** | ⏸️ PREPARED — NOT ACTIVE |

#### Core Authority
- Social assessment of applicant household
- Household composition verification
- Living conditions evaluation
- Social urgency determination
- Recommendation for case progression

#### Workflow States (Prepared)
| From Status | To Status | Action |
|-------------|-----------|--------|
| SUBMITTED | IN_SOCIAL_REVIEW | Start social assessment |
| IN_SOCIAL_REVIEW | SOCIAL_COMPLETED | Complete assessment (positive) |
| IN_SOCIAL_REVIEW | RETURNED_TO_INTAKE | Return for additional info |

#### Audit Actions (Prepared)
| Action | Entity Type | Required Metadata |
|--------|-------------|-------------------|
| SOCIAL_ASSESSMENT_STARTED | subsidy_case / housing_registration | assessment_type |
| SOCIAL_ASSESSMENT_COMPLETED | subsidy_case / housing_registration | assessment_result, recommendation |
| SOCIAL_ASSESSMENT_RETURNED | subsidy_case / housing_registration | return_reason |

#### Activation Status
**⏸️ PREPARED — NOT ACTIVE**

This role requires database enum extension and RLS policy creation before activation.

---

### 3.2 Technical Inspector

| Attribute | Value |
|-----------|-------|
| **Proposed Enum Value** | `technical_inspector` |
| **Dutch Name** | Technisch Inspecteur |
| **Service Applicability** | Bouwsubsidie Only |
| **Decision Chain Position** | Step 2 |
| **Scope Type** | District-scoped |
| **Database Status** | ⏸️ PREPARED — NOT ACTIVE |
| **TypeScript Status** | ⏸️ PREPARED — NOT ACTIVE |

#### Core Authority
- Technical assessment of construction project
- Budget verification and validation
- Construction feasibility evaluation
- Material and contractor verification
- Technical approval for subsidy amount

#### Workflow States (Prepared)
| From Status | To Status | Action |
|-------------|-----------|--------|
| SOCIAL_COMPLETED | IN_TECHNICAL_REVIEW | Start technical inspection |
| IN_TECHNICAL_REVIEW | TECHNICAL_APPROVED | Approve technical aspects |
| IN_TECHNICAL_REVIEW | TECHNICAL_REJECTED | Reject on technical grounds |
| IN_TECHNICAL_REVIEW | RETURNED_TO_SOCIAL | Return for social re-assessment |

#### Audit Actions (Prepared)
| Action | Entity Type | Required Metadata |
|--------|-------------|-------------------|
| TECHNICAL_INSPECTION_STARTED | subsidy_case | inspection_type, site_address |
| TECHNICAL_INSPECTION_COMPLETED | subsidy_case | inspection_result, approved_amount |
| TECHNICAL_INSPECTION_FAILED | subsidy_case | failure_reason, recommended_action |

#### Service Restriction
**This role is explicitly EXCLUDED from Woningregistratie.**

Woningregistratie does not require technical inspection; the workflow proceeds directly from Social Assessment to Administrative Review.

#### Activation Status
**⏸️ PREPARED — NOT ACTIVE**

This role requires database enum extension and RLS policy creation before activation.

---

### 3.3 Director

| Attribute | Value |
|-----------|-------|
| **Proposed Enum Value** | `director` |
| **Dutch Name** | Directeur |
| **Service Applicability** | Both Services |
| **Decision Chain Position** | Step 5 |
| **Scope Type** | National (no district restriction) |
| **Database Status** | ⏸️ PREPARED — NOT ACTIVE |
| **TypeScript Status** | ⏸️ PREPARED — NOT ACTIVE |

#### Core Authority
- Organizational approval authority
- Policy compliance verification
- Budget allocation oversight
- Final decision authority for Woningregistratie
- Escalation to Ministerial chain for Bouwsubsidie

#### Workflow States (Prepared)
| From Status | To Status | Action |
|-------------|-----------|--------|
| PROJECT_LEADER_APPROVED | IN_DIRECTOR_REVIEW | Start director review |
| IN_DIRECTOR_REVIEW | DIRECTOR_APPROVED | Approve (escalate to Minister chain for BS) |
| IN_DIRECTOR_REVIEW | DIRECTOR_REJECTED | Reject case |
| IN_DIRECTOR_REVIEW | ALLOCATED | Final approval (WR only) |
| IN_DIRECTOR_REVIEW | RETURNED_TO_PROJECT_LEADER | Return for policy clarification |

#### Audit Actions (Prepared)
| Action | Entity Type | Required Metadata |
|--------|-------------|-------------------|
| DIRECTOR_REVIEW_STARTED | subsidy_case / housing_registration | review_type |
| DIRECTOR_APPROVED | subsidy_case / housing_registration | approval_notes |
| DIRECTOR_REJECTED | subsidy_case / housing_registration | rejection_reason |
| DIRECTOR_ESCALATED | subsidy_case | escalation_reason |

#### Service-Specific Behavior
- **Bouwsubsidie:** Director approval escalates to Ministerial Advisor
- **Woningregistratie:** Director approval is FINAL (no ministerial chain)

#### Activation Status
**⏸️ PREPARED — NOT ACTIVE**

This role requires database enum extension and RLS policy creation before activation.

---

### 3.4 Ministerial Advisor

| Attribute | Value |
|-----------|-------|
| **Proposed Enum Value** | `ministerial_advisor` |
| **Dutch Name** | Beleidsadviseur Minister |
| **Service Applicability** | Bouwsubsidie Only |
| **Decision Chain Position** | Step 6 |
| **Scope Type** | National (no district restriction) |
| **Database Status** | ⏸️ PREPARED — NOT ACTIVE |
| **TypeScript Status** | ⏸️ PREPARED — NOT ACTIVE |

#### Core Authority
- Advisory review for Minister decision
- Policy alignment verification
- Paraaf (initialing) authority
- Recommendation to Minister
- Case briefing preparation

#### Workflow States (Prepared)
| From Status | To Status | Action |
|-------------|-----------|--------|
| DIRECTOR_APPROVED | IN_MINISTERIAL_ADVICE | Start ministerial advice |
| IN_MINISTERIAL_ADVICE | MINISTERIAL_ADVICE_COMPLETE | Complete advice with paraaf |
| IN_MINISTERIAL_ADVICE | RETURNED_TO_DIRECTOR | Return for organizational clarification |

#### Audit Actions (Prepared)
| Action | Entity Type | Required Metadata |
|--------|-------------|-------------------|
| MINISTERIAL_ADVICE_STARTED | subsidy_case | advice_request_type |
| MINISTERIAL_ADVICE_COMPLETED | subsidy_case | advice_recommendation, paraaf_applied |
| MINISTERIAL_PARAAF_APPLIED | subsidy_case | paraaf_timestamp |

#### Service Restriction
**This role is explicitly EXCLUDED from Woningregistratie.**

Woningregistratie decisions are finalized by the Director; no ministerial chain is required.

#### Activation Status
**⏸️ PREPARED — NOT ACTIVE**

This role requires database enum extension and RLS policy creation before activation.

---

## 4. Role Hierarchy Summary

### 4.1 Complete V1.2 Role Model (11 Roles)

| # | Role | Enum Value | Status | Service |
|---|------|------------|--------|---------|
| 1 | System Administrator | system_admin | ✅ ACTIVE | Technical |
| 2 | Frontdesk (Bouwsubsidie) | frontdesk_bouwsubsidie | ✅ ACTIVE | BS |
| 3 | Frontdesk (Woningregistratie) | frontdesk_housing | ✅ ACTIVE | WR |
| 4 | Social Field Worker | social_field_worker | ⏸️ PREPARED | Both |
| 5 | Technical Inspector | technical_inspector | ⏸️ PREPARED | BS Only |
| 6 | Administrative Officer | admin_staff | ✅ ACTIVE | Both |
| 7 | Project Leader | project_leader | ✅ ACTIVE | Both |
| 8 | Director | director | ⏸️ PREPARED | Both |
| 9 | Ministerial Advisor | ministerial_advisor | ⏸️ PREPARED | BS Only |
| 10 | Minister | minister | ✅ ACTIVE | BS Only |
| 11 | Auditor | audit | ✅ ACTIVE | Read-Only |

### 4.2 Status Distribution

| Status | Count | Roles |
|--------|-------|-------|
| ✅ ACTIVE | 7 | system_admin, minister, project_leader, frontdesk_bouwsubsidie, frontdesk_housing, admin_staff, audit |
| ⏸️ PREPARED | 4 | social_field_worker, technical_inspector, director, ministerial_advisor |

---

## 5. Scope Classification

### 5.1 National Roles (No District Restriction)

| Role | Status |
|------|--------|
| system_admin | ✅ ACTIVE |
| minister | ✅ ACTIVE |
| project_leader | ✅ ACTIVE |
| director | ⏸️ PREPARED |
| ministerial_advisor | ⏸️ PREPARED |
| audit | ✅ ACTIVE |

### 5.2 District-Scoped Roles

| Role | Status |
|------|--------|
| frontdesk_bouwsubsidie | ✅ ACTIVE |
| frontdesk_housing | ✅ ACTIVE |
| admin_staff | ✅ ACTIVE |
| social_field_worker | ⏸️ PREPARED |
| technical_inspector | ⏸️ PREPARED |

---

## 6. Service Applicability Matrix

| Role | Bouwsubsidie | Woningregistratie |
|------|--------------|-------------------|
| system_admin | ✅ | ✅ |
| frontdesk_bouwsubsidie | ✅ | ❌ |
| frontdesk_housing | ❌ | ✅ |
| social_field_worker | ✅ | ✅ |
| technical_inspector | ✅ | ❌ |
| admin_staff | ✅ | ✅ |
| project_leader | ✅ | ✅ |
| director | ✅ | ✅ |
| ministerial_advisor | ✅ | ❌ |
| minister | ✅ | ❌ |
| audit | ✅ | ✅ |

---

## 7. Activation Requirements

### 7.1 Database Changes

```sql
-- PREPARED MIGRATION — NOT APPLIED
-- Activation Phase: Future (requires explicit authorization)

-- Step 1: Extend app_role enum
ALTER TYPE public.app_role ADD VALUE 'social_field_worker';
ALTER TYPE public.app_role ADD VALUE 'technical_inspector';
ALTER TYPE public.app_role ADD VALUE 'director';
ALTER TYPE public.app_role ADD VALUE 'ministerial_advisor';

-- Step 2: Update is_national_role function
CREATE OR REPLACE FUNCTION public.is_national_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id
    AND role IN (
      'system_admin', 'minister', 'project_leader', 'audit',
      'director', 'ministerial_advisor'  -- NEW ROLES
    )
  )
$$;
```

### 7.2 TypeScript Changes

```typescript
// PREPARED TYPE EXTENSION — NOT ACTIVE
// File: src/hooks/useUserRole.ts

export type AppRole = 
  | 'system_admin'
  | 'minister'
  | 'project_leader'
  | 'frontdesk_bouwsubsidie'
  | 'frontdesk_housing'
  | 'admin_staff'
  | 'audit'
  // NEW ROLES (activation required)
  | 'social_field_worker'
  | 'technical_inspector'
  | 'director'
  | 'ministerial_advisor'
```

---

## 8. Governance Statement

**This document defines role specifications for PREPARATION ONLY.**

**No roles defined in this document are active in the system.**

**Activation requires explicit authorization and a dedicated implementation phase.**

**The current system operates with 7 active roles only.**

---

**PHASE 3 — ROLE PREPARATION — COMPLETE**

---

**END OF DOCUMENT**
