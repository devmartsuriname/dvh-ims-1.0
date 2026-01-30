# DVH-IMS V1.3 — Phase 3 Audit Hooks Mapping

**Document Type:** Audit Event Definition Specification  
**Version:** 1.0  
**Date:** 2026-01-30  
**Phase:** Phase 3 — Role & Workflow Activation Preparation  
**Status:** PREPARED — NOT TRIGGERED

---

## 1. Document Purpose

This document defines the **audit event hooks** that will be required when the 4 prepared roles are activated. These hooks are **prepared for future activation** but are **NOT triggered** in the current system.

---

## 2. Current Audit Event Structure

### 2.1 Existing audit_event Table Schema

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entity_type | text | 'subsidy_case' or 'housing_registration' |
| entity_id | uuid | Reference to case/registration |
| action | text | Action performed |
| actor_user_id | uuid | User who performed action |
| actor_role | text | Role of actor |
| reason | text | Optional reason |
| metadata_json | jsonb | Additional context |
| correlation_id | uuid | Links related events |
| occurred_at | timestamptz | Timestamp |

### 2.2 Current Audit Actions (Active)

| Action | Entity Type | Triggered By |
|--------|-------------|--------------|
| CASE_CREATED | subsidy_case | frontdesk_bouwsubsidie |
| CASE_SUBMITTED | subsidy_case | frontdesk_bouwsubsidie |
| STATUS_CHANGED | subsidy_case | Various |
| CASE_APPROVED | subsidy_case | minister |
| CASE_REJECTED | subsidy_case | minister |
| REGISTRATION_CREATED | housing_registration | frontdesk_housing |
| REGISTRATION_SUBMITTED | housing_registration | frontdesk_housing |
| STATUS_CHANGED | housing_registration | Various |
| NOTIFICATION_CREATED | admin_notification | System |
| NOTIFICATION_READ | admin_notification | Various |

---

## 3. Prepared Audit Actions — Social Field Worker

### 3.1 Bouwsubsidie Actions

| Action | Entity Type | Trigger Condition | Required Metadata |
|--------|-------------|-------------------|-------------------|
| SOCIAL_ASSESSMENT_STARTED | subsidy_case | Status → IN_SOCIAL_REVIEW | assessment_type |
| SOCIAL_ASSESSMENT_COMPLETED | subsidy_case | Status → SOCIAL_COMPLETED | assessment_result, recommendation |
| SOCIAL_ASSESSMENT_RETURNED | subsidy_case | Status → RETURNED_TO_INTAKE | return_reason |
| SOCIAL_REPORT_CREATED | social_report | Report created | report_type |
| SOCIAL_REPORT_UPDATED | social_report | Report updated | updated_fields |
| SOCIAL_REPORT_FINALIZED | social_report | Report finalized | finalized_by |

### 3.2 Woningregistratie Actions

| Action | Entity Type | Trigger Condition | Required Metadata |
|--------|-------------|-------------------|-------------------|
| SOCIAL_ASSESSMENT_STARTED | housing_registration | Status → IN_SOCIAL_REVIEW | assessment_type |
| SOCIAL_ASSESSMENT_COMPLETED | housing_registration | Status → SOCIAL_COMPLETED | assessment_result, urgency_score |
| SOCIAL_ASSESSMENT_RETURNED | housing_registration | Status → RETURNED_TO_INTAKE | return_reason |
| URGENCY_SCORE_UPDATED | housing_urgency | Score modified | old_score, new_score, justification |

### 3.3 Audit Event Template

```typescript
// PREPARED — NOT ACTIVE
// Social Field Worker Audit Events

interface SocialFieldWorkerAuditEvent {
  entity_type: 'subsidy_case' | 'housing_registration' | 'social_report' | 'housing_urgency';
  action: 
    | 'SOCIAL_ASSESSMENT_STARTED'
    | 'SOCIAL_ASSESSMENT_COMPLETED'
    | 'SOCIAL_ASSESSMENT_RETURNED'
    | 'SOCIAL_REPORT_CREATED'
    | 'SOCIAL_REPORT_UPDATED'
    | 'SOCIAL_REPORT_FINALIZED'
    | 'URGENCY_SCORE_UPDATED';
  actor_role: 'social_field_worker';
  metadata_json: {
    assessment_type?: 'initial' | 'followup' | 'urgent';
    assessment_result?: 'positive' | 'negative' | 'pending';
    recommendation?: string;
    return_reason?: string;
    urgency_score?: number;
    old_score?: number;
    new_score?: number;
    justification?: string;
  };
}
```

---

## 4. Prepared Audit Actions — Technical Inspector

### 4.1 Bouwsubsidie Actions (Only Service)

| Action | Entity Type | Trigger Condition | Required Metadata |
|--------|-------------|-------------------|-------------------|
| TECHNICAL_INSPECTION_STARTED | subsidy_case | Status → IN_TECHNICAL_REVIEW | inspection_type, site_address |
| TECHNICAL_INSPECTION_COMPLETED | subsidy_case | Status → TECHNICAL_APPROVED | inspection_result, approved_amount |
| TECHNICAL_INSPECTION_FAILED | subsidy_case | Status → TECHNICAL_REJECTED | failure_reason, recommended_action |
| TECHNICAL_INSPECTION_RETURNED | subsidy_case | Status → RETURNED_TO_SOCIAL | return_reason |
| TECHNICAL_REPORT_CREATED | technical_report | Report created | report_type |
| TECHNICAL_REPORT_UPDATED | technical_report | Report updated | updated_fields |
| TECHNICAL_REPORT_FINALIZED | technical_report | Report finalized | finalized_by, approved_amount |
| BUDGET_VERIFIED | subsidy_case | Budget verification complete | requested_amount, approved_amount, variance |

### 4.2 Audit Event Template

```typescript
// PREPARED — NOT ACTIVE
// Technical Inspector Audit Events

interface TechnicalInspectorAuditEvent {
  entity_type: 'subsidy_case' | 'technical_report';
  action: 
    | 'TECHNICAL_INSPECTION_STARTED'
    | 'TECHNICAL_INSPECTION_COMPLETED'
    | 'TECHNICAL_INSPECTION_FAILED'
    | 'TECHNICAL_INSPECTION_RETURNED'
    | 'TECHNICAL_REPORT_CREATED'
    | 'TECHNICAL_REPORT_UPDATED'
    | 'TECHNICAL_REPORT_FINALIZED'
    | 'BUDGET_VERIFIED';
  actor_role: 'technical_inspector';
  metadata_json: {
    inspection_type?: 'site_visit' | 'document_review' | 'contractor_verification';
    site_address?: string;
    inspection_result?: 'approved' | 'rejected' | 'conditional';
    approved_amount?: number;
    requested_amount?: number;
    variance?: number;
    failure_reason?: string;
    recommended_action?: string;
    return_reason?: string;
  };
}
```

---

## 5. Prepared Audit Actions — Director

### 5.1 Bouwsubsidie Actions

| Action | Entity Type | Trigger Condition | Required Metadata |
|--------|-------------|-------------------|-------------------|
| DIRECTOR_REVIEW_STARTED | subsidy_case | Status → IN_DIRECTOR_REVIEW | review_type |
| DIRECTOR_APPROVED | subsidy_case | Status → DIRECTOR_APPROVED | approval_notes |
| DIRECTOR_REJECTED | subsidy_case | Status → DIRECTOR_REJECTED | rejection_reason |
| DIRECTOR_RETURNED | subsidy_case | Status → RETURNED_TO_POLICY | return_reason |
| DIRECTOR_ESCALATED | subsidy_case | Escalation to Minister chain | escalation_reason |

### 5.2 Woningregistratie Actions (Final Decision Authority)

| Action | Entity Type | Trigger Condition | Required Metadata |
|--------|-------------|-------------------|-------------------|
| DIRECTOR_REVIEW_STARTED | housing_registration | Status → IN_DIRECTOR_REVIEW | review_type |
| DIRECTOR_APPROVED | housing_registration | Status → REGISTERED | approval_notes |
| DIRECTOR_REJECTED | housing_registration | Status → REJECTED | rejection_reason |
| DIRECTOR_RETURNED | housing_registration | Status → RETURNED_TO_POLICY | return_reason |
| ALLOCATION_AUTHORIZED | housing_registration | Allocation decision | allocation_notes |

### 5.3 Audit Event Template

```typescript
// PREPARED — NOT ACTIVE
// Director Audit Events

interface DirectorAuditEvent {
  entity_type: 'subsidy_case' | 'housing_registration';
  action: 
    | 'DIRECTOR_REVIEW_STARTED'
    | 'DIRECTOR_APPROVED'
    | 'DIRECTOR_REJECTED'
    | 'DIRECTOR_RETURNED'
    | 'DIRECTOR_ESCALATED'
    | 'ALLOCATION_AUTHORIZED';
  actor_role: 'director';
  metadata_json: {
    review_type?: 'standard' | 'expedited' | 'complex';
    approval_notes?: string;
    rejection_reason?: string;
    return_reason?: string;
    escalation_reason?: string;
    allocation_notes?: string;
  };
}
```

---

## 6. Prepared Audit Actions — Ministerial Advisor

### 6.1 Bouwsubsidie Actions (Only Service)

| Action | Entity Type | Trigger Condition | Required Metadata |
|--------|-------------|-------------------|-------------------|
| MINISTERIAL_ADVICE_STARTED | subsidy_case | Status → IN_MINISTERIAL_ADVICE | advice_request_type |
| MINISTERIAL_ADVICE_COMPLETED | subsidy_case | Status → ADVICE_COMPLETE | advice_recommendation |
| MINISTERIAL_ADVICE_RETURNED | subsidy_case | Status → RETURNED_TO_DIRECTOR | return_reason |
| MINISTERIAL_PARAAF_APPLIED | subsidy_case | Paraaf (initialing) applied | paraaf_timestamp |
| BRIEFING_PREPARED | subsidy_case | Minister briefing created | briefing_type |

### 6.2 Audit Event Template

```typescript
// PREPARED — NOT ACTIVE
// Ministerial Advisor Audit Events

interface MinisterialAdvisorAuditEvent {
  entity_type: 'subsidy_case';
  action: 
    | 'MINISTERIAL_ADVICE_STARTED'
    | 'MINISTERIAL_ADVICE_COMPLETED'
    | 'MINISTERIAL_ADVICE_RETURNED'
    | 'MINISTERIAL_PARAAF_APPLIED'
    | 'BRIEFING_PREPARED';
  actor_role: 'ministerial_advisor';
  metadata_json: {
    advice_request_type?: 'standard' | 'urgent' | 'complex';
    advice_recommendation?: 'approve' | 'reject' | 'defer';
    return_reason?: string;
    paraaf_timestamp?: string;
    briefing_type?: 'summary' | 'detailed' | 'expedited';
  };
}
```

---

## 7. Audit Hook Integration Pattern

### 7.1 Prepared Hook Structure

```typescript
// PREPARED — NOT ACTIVE
// This hook pattern will be implemented during activation

import { supabase } from '@/integrations/supabase/client';

interface PreparedAuditHookParams {
  entityType: 'subsidy_case' | 'housing_registration';
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
  reason?: string;
  correlationId: string;
}

// PREPARED — NOT ACTIVE
const createPreparedAuditEvent = async (params: PreparedAuditHookParams) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get user's role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const { error } = await supabase
    .from('audit_event')
    .insert({
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: params.action,
      actor_user_id: user.id,
      actor_role: roleData?.role || 'unknown',
      reason: params.reason,
      metadata_json: params.metadata || {},
      correlation_id: params.correlationId,
    });

  if (error) throw error;
};
```

### 7.2 Status Change Hook Pattern

```typescript
// PREPARED — NOT ACTIVE
// Status change hook with audit event

const handlePreparedStatusChange = async (
  entityType: 'subsidy_case' | 'housing_registration',
  entityId: string,
  fromStatus: string,
  toStatus: string,
  reason?: string,
  correlationId: string
) => {
  // Determine action based on status transition
  const action = getAuditActionForTransition(entityType, fromStatus, toStatus);
  
  await createPreparedAuditEvent({
    entityType,
    entityId,
    action,
    metadata: {
      from_status: fromStatus,
      to_status: toStatus,
      transition_timestamp: new Date().toISOString(),
    },
    reason,
    correlationId,
  });
};

// PREPARED — NOT ACTIVE
const getAuditActionForTransition = (
  entityType: string,
  fromStatus: string,
  toStatus: string
): string => {
  // Social Field Worker transitions
  if (toStatus === 'IN_SOCIAL_REVIEW') return 'SOCIAL_ASSESSMENT_STARTED';
  if (toStatus === 'SOCIAL_COMPLETED') return 'SOCIAL_ASSESSMENT_COMPLETED';
  
  // Technical Inspector transitions
  if (toStatus === 'IN_TECHNICAL_REVIEW') return 'TECHNICAL_INSPECTION_STARTED';
  if (toStatus === 'TECHNICAL_APPROVED') return 'TECHNICAL_INSPECTION_COMPLETED';
  if (toStatus === 'TECHNICAL_REJECTED') return 'TECHNICAL_INSPECTION_FAILED';
  
  // Director transitions
  if (toStatus === 'IN_DIRECTOR_REVIEW') return 'DIRECTOR_REVIEW_STARTED';
  if (toStatus === 'DIRECTOR_APPROVED') return 'DIRECTOR_APPROVED';
  if (toStatus === 'DIRECTOR_REJECTED') return 'DIRECTOR_REJECTED';
  
  // Ministerial Advisor transitions
  if (toStatus === 'IN_MINISTERIAL_ADVICE') return 'MINISTERIAL_ADVICE_STARTED';
  if (toStatus === 'ADVICE_COMPLETE') return 'MINISTERIAL_ADVICE_COMPLETED';
  
  return 'STATUS_CHANGED';
};
```

---

## 8. Correlation ID Requirements

### 8.1 Correlation ID Usage

All audit events from prepared roles MUST include a correlation_id to:

1. Link related events in a decision chain
2. Enable audit trail reconstruction
3. Support notification correlation
4. Enable error investigation

### 8.2 Correlation ID Generation Pattern

```typescript
// PREPARED — NOT ACTIVE
// Correlation ID generation for workflow chains

const generateWorkflowCorrelationId = (
  entityType: 'subsidy_case' | 'housing_registration',
  entityId: string,
  workflowStep: string
): string => {
  const prefix = entityType === 'subsidy_case' ? 'BS' : 'WR';
  const timestamp = Date.now().toString(36);
  const stepCode = workflowStep.substring(0, 3).toUpperCase();
  return `${prefix}-${entityId.substring(0, 8)}-${stepCode}-${timestamp}`;
};
```

---

## 9. Audit Event Aggregation Views

### 9.1 Prepared View Definitions

```sql
-- PREPARED VIEW — NOT CREATED
-- Aggregated audit view for workflow analysis

/*
CREATE VIEW public.v_workflow_audit_summary AS
SELECT 
  entity_type,
  entity_id,
  actor_role,
  action,
  correlation_id,
  occurred_at,
  CASE 
    WHEN action LIKE 'SOCIAL_%' THEN 'social_assessment'
    WHEN action LIKE 'TECHNICAL_%' THEN 'technical_inspection'
    WHEN action LIKE 'DIRECTOR_%' THEN 'director_review'
    WHEN action LIKE 'MINISTERIAL_%' THEN 'ministerial_advice'
    ELSE 'other'
  END AS workflow_stage,
  metadata_json
FROM audit_event
WHERE action IN (
  'SOCIAL_ASSESSMENT_STARTED', 'SOCIAL_ASSESSMENT_COMPLETED',
  'TECHNICAL_INSPECTION_STARTED', 'TECHNICAL_INSPECTION_COMPLETED',
  'DIRECTOR_REVIEW_STARTED', 'DIRECTOR_APPROVED', 'DIRECTOR_REJECTED',
  'MINISTERIAL_ADVICE_STARTED', 'MINISTERIAL_ADVICE_COMPLETED'
)
ORDER BY occurred_at DESC;
*/
```

---

## 10. Activation Checklist

### 10.1 Pre-Activation Requirements

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Roles activated in database | ⏸️ REQUIRED |
| 2 | Status enums extended | ⏸️ REQUIRED |
| 3 | Status history triggers updated | ⏸️ REQUIRED |
| 4 | RLS policies applied | ⏸️ REQUIRED |
| 5 | UI components updated | ⏸️ REQUIRED |

### 10.2 Audit Hook Activation Order

1. Update audit action constants
2. Implement status change audit hooks
3. Implement report creation/update hooks
4. Implement notification-linked audit events
5. Create aggregation views

---

## 11. Governance Statement

**This document defines audit event specifications for PREPARATION ONLY.**

**No audit hooks defined in this document are triggered in the system.**

**Activation requires explicit authorization and a dedicated implementation phase.**

**The current system uses existing audit event patterns only.**

---

**PHASE 3 — AUDIT HOOKS MAPPING — COMPLETE**

---

**END OF DOCUMENT**
