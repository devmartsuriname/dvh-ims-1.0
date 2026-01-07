# VolksHuisvesting IMS – Backend Specification

**Status:** Reference document for Phase 0+
**Platform:** Lovable Cloud (Supabase)
**Governance:** Government Grade, RLS-first, Audit-first

---

## 1. Platform Overview

The VolksHuisvesting IMS backend is powered by **Lovable Cloud**, which provides:

- **PostgreSQL Database** - All persistent data storage
- **Row Level Security (RLS)** - Access control at database level
- **Authentication** - Staff authentication via Supabase Auth
- **Edge Functions** - Serverless logic for workflows
- **Storage** - Document and file storage

---

## 2. Authentication Configuration

### 2.1 Staff Authentication
- Method: Email + Password
- Provider: Supabase Auth
- Session: JWT-based

### 2.2 Citizen Access (No Authentication)
- Citizens do not log in
- Access via reference number + secure token
- Token stored as hash only

### 2.3 Auth Configuration Checklist
- [ ] Enable email/password authentication
- [ ] Disable social providers (not required for v1.0)
- [ ] Configure password requirements
- [ ] Set up email templates (optional for v1.0)

---

## 3. Database Configuration

### 3.1 Schema Structure
All tables are created in the `public` schema.

### 3.2 Required Extensions
- `uuid-ossp` - UUID generation
- `pgcrypto` - Token hashing

### 3.3 Table Creation Order (Dependencies)

**Phase 0:**
1. app_user_profile
2. audit_event

**Phase 1 (Shared Core):**
1. person
2. household
3. household_member
4. contact_point
5. address

**Phase 2 (Bouwsubsidie):**
1. subsidy_case
2. subsidy_case_status_history
3. subsidy_document_requirement
4. subsidy_document_upload
5. social_report
6. technical_report
7. generated_document

**Phase 3 (Housing Registration):**
1. housing_registration
2. housing_registration_status_history
3. housing_urgency
4. public_status_access

**Phase 4 (Allocation):**
1. district_quota
2. allocation_run
3. allocation_candidate
4. allocation_decision
5. assignment_record

**Phase 6 (Reporting):**
1. report_snapshot

---

## 4. Row Level Security (RLS)

### 4.1 Core Principles
- **Deny-all default** - No access without explicit policy
- **Least privilege** - Minimum required access per role
- **District scoping** - Operational roles filtered by district

### 4.2 RLS Policy Template

```sql
-- Enable RLS on table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner
ALTER TABLE table_name FORCE ROW LEVEL SECURITY;

-- Example policy structure
CREATE POLICY "policy_name" ON table_name
  FOR SELECT  -- or INSERT, UPDATE, DELETE
  TO authenticated
  USING (
    -- Access condition based on user role and scope
    EXISTS (
      SELECT 1 FROM app_user_profile
      WHERE user_id = auth.uid()
      AND is_active = true
      AND role IN ('allowed_role_1', 'allowed_role_2')
    )
  );
```

### 4.3 Role-Based Access Summary

| Role | Scope | Read | Write | Special |
|------|-------|------|-------|---------|
| Minister | National | All | Approvals only | Raadvoorstel approval |
| Project Leader | National | All | All | Allocation execution |
| Frontdesk | District | Limited | Create intake | No evaluation |
| Administrative Staff | District | Cases | Screening | Urgency entry |
| Social Field Worker | Own reports | Own | Submit report | Immutable after submit |
| Technical Inspector | Own reports | Own | Submit report | Immutable after submit |
| Audit | National | All | None | Read-only |

---

## 5. Edge Functions

### 5.1 Planned Edge Functions

| Function | Phase | Purpose |
|----------|-------|---------|
| generate-raadvoorstel | 2 | Generate DOCX from case data |
| execute-allocation-run | 4 | Run allocation algorithm |
| generate-reference-number | 5 | Create unique BS/WR reference |
| hash-access-token | 5 | Securely hash citizen tokens |
| validate-status-transition | 2+ | Enforce valid status changes |

### 5.2 Edge Function Guidelines
- All functions must log to audit_event
- No direct database writes without audit
- Error handling must be explicit
- No silent failures

---

## 6. Storage Configuration

### 6.1 Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| case-documents | Uploaded case documents | Authenticated staff |
| generated-documents | System-generated DOCX | Authenticated staff |

### 6.2 Storage Policies
- Files linked to case/registration via database record
- No direct public access
- Access controlled via RLS on linking table

---

## 7. Secrets Management

### 7.1 Required Secrets
- None required for v1.0 (no external integrations)

### 7.2 Future Secrets (Post v1.0)
- Email service API key (if email notifications added)
- External system integration keys

---

## 8. Environment Configuration

### 8.1 Lovable Cloud Settings
- Instance size: Default (upgrade if performance issues)
- Region: Default

### 8.2 Database Settings
- Connection pooling: Enabled
- Statement timeout: Default

---

## 9. Audit Event Logging

### 9.1 Mandatory Audit Points
Every significant action MUST create an audit_event:

- Record creation (case, registration, person, etc.)
- Status transitions
- Document uploads
- Urgency assessments
- Quota changes
- Allocation runs
- Allocation decisions
- Raadvoorstel generation
- Raadvoorstel approval

### 9.2 Audit Event Structure

```sql
INSERT INTO audit_event (
  actor_user_id,
  actor_role,
  action,
  entity_type,
  entity_id,
  occurred_at,
  reason,
  metadata_json
) VALUES (
  auth.uid(),
  'role_name',
  'action_name',
  'entity_type',
  'entity_uuid',
  now(),
  'reason_text',
  '{"key": "value"}'::jsonb
);
```

---

## 10. Error Handling

### 10.1 Database Errors
- All database errors must be caught
- Errors must be reported, not silently swallowed
- Failed transactions must be rolled back

### 10.2 Edge Function Errors
- Return explicit error responses
- Log errors to audit_event with error details
- Never expose internal error details to clients

---

## 11. Dependencies

This document must remain aligned with:
- Database & RLS Specification
- Architecture & Security
- Execution Plan

---

**End of Backend Specification**
