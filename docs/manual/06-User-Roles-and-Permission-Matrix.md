# DVH-IMS — User Roles and Permission Matrix

**Document:** 06 — User Roles and Permission Matrix
**Version:** V1.7
**Classification:** Official — For Ministerial Review
**Date:** March 2026

---

## 1. Overview

DVH-IMS enforces a strict role-based access control model with **11 defined roles**. Each user is assigned one or more roles that determine exactly what they can see and do. Roles are stored in the `user_roles` table and can only be assigned by a `system_admin`.

---

## 2. Role Definitions

### National Roles (Cross-District Access)

| Role | Description | Primary Module |
|------|------------|---------------|
| `system_admin` | Full system access, user management, role assignment | All modules |
| `project_leader` | Policy review, case assignments, oversight | Bouwsubsidie |
| `minister` | Final decision authority for subsidy cases | Bouwsubsidie |
| `director` | Organizational approval for subsidy cases | Bouwsubsidie |
| `ministerial_advisor` | Advisory review and formal recommendation (paraaf) | Bouwsubsidie |
| `audit` | Read-only compliance and audit verification | All modules (read-only) |

### District-Scoped Roles (Own District Only)

| Role | Description | Primary Module |
|------|------------|---------------|
| `frontdesk_bouwsubsidie` | Intake processing for subsidy applications | Bouwsubsidie |
| `frontdesk_housing` | Intake processing for housing registrations | Woningregistratie |
| `admin_staff` | Administrative review for subsidy cases | Bouwsubsidie |
| `social_field_worker` | Social assessment visits and report submission | Bouwsubsidie |
| `technical_inspector` | Technical inspection visits and report submission | Bouwsubsidie |

---

## 3. Module Access Matrix

| Module | system_admin | project_leader | minister | director | ministerial_advisor | audit | frontdesk_bouwsubsidie | frontdesk_housing | admin_staff | social_field_worker | technical_inspector |
|--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Persons | ✅ | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ✅ | ✅ | ✅ | 👁️ | 👁️ |
| Households | ✅ | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ✅ | ✅ | ✅ | 👁️ | 👁️ |
| Subsidy Cases | ✅ | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ✅ | ❌ | ✅ | 👁️ | 👁️ |
| Control Queue | ✅ | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ✅ | ❌ | ✅ | 👁️ | 👁️ |
| Housing Registrations | ✅ | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Housing Waiting List | ✅ | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Case Assignments | ✅ | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | ❌ | 👁️ | 👁️ | 👁️ |
| My Visits | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Schedule Visits | ✅ | ✅ | 👁️ | 👁️ | ❌ | ❌ | 👁️ | ❌ | 👁️ | 👁️ | 👁️ |
| Allocation Quotas | ✅ | ✅ | 👁️ | 👁️ | ❌ | 👁️ | ❌ | 👁️ | ❌ | ❌ | ❌ |
| Allocation Runs | ✅ | ✅ | 👁️ | 👁️ | ❌ | 👁️ | ❌ | 👁️ | ❌ | ❌ | ❌ |
| Allocation Decisions | ✅ | ✅ | 👁️ | 👁️ | ❌ | 👁️ | ❌ | 👁️ | ❌ | ❌ | ❌ |
| Allocation Assignments | ✅ | ✅ | 👁️ | 👁️ | ❌ | 👁️ | ❌ | 👁️ | ❌ | ❌ | ❌ |
| Archive | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Audit Log | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Legend:** ✅ = Full access (view + actions) | 👁️ = Read-only | ❌ = No access

---

## 4. Status Change Authority

### Bouwsubsidie Decision Chain

| Decision Step | Authorized Role | Status Transition |
|--------------|----------------|-------------------|
| Intake review | frontdesk_bouwsubsidie | SUBMITTED → IN_REVIEW |
| Social review | social_field_worker | → SOCIAL_REVIEW |
| Technical inspection | technical_inspector | → TECHNICAL_REVIEW |
| Admin review | admin_staff | → ADMIN_REVIEW |
| Policy review | project_leader | → POLICY_REVIEW |
| Organizational approval | director | → DIRECTOR_APPROVED / RETURNED |
| Advisory review | ministerial_advisor | → ADVISOR_REVIEWED |
| Final decision | minister | → MINISTER_APPROVED / RETURNED |

### Housing Registration

| Action | Authorized Roles |
|--------|-----------------|
| Review registration | frontdesk_housing, system_admin |
| Approve/Reject | frontdesk_housing, system_admin |
| Update waiting list status | frontdesk_housing, system_admin |

---

## 5. Document Rights

| Capability | Authorized Roles |
|-----------|-----------------|
| View uploaded documents | All roles with case/registration access |
| Verify subsidy documents | frontdesk_bouwsubsidie, admin_staff, system_admin |
| Verify housing documents | frontdesk_housing, system_admin |
| Upload documents (public wizard) | Citizens (anonymous) |
| Download documents | All roles with case/registration access |

---

## 6. Assignment Authority

| Action | Authorized Roles |
|--------|-----------------|
| Create case assignments | system_admin, project_leader |
| Reassign cases | system_admin, project_leader |
| Revoke assignments | system_admin, project_leader |
| Complete assignments | system_admin, project_leader |
| View own assignments | social_field_worker, technical_inspector, admin_staff |
| View all assignments | system_admin, project_leader, director, minister, ministerial_advisor, audit |

---

## 7. Report Submission Authority

| Report Type | Authorized Role | Constraints |
|------------|----------------|-------------|
| Social Assessment Report | social_field_worker | Must be assigned to the case; one report per case; immutable after finalization |
| Technical Inspection Report | technical_inspector | Must be assigned to the case; one report per case; immutable after finalization |

---

## 8. Allocation Authority

| Action | Authorized Roles |
|--------|-----------------|
| Manage district quotas | system_admin, project_leader |
| Execute allocation runs | system_admin, project_leader |
| Record allocation decisions | system_admin, project_leader |
| Register housing assignments | system_admin, project_leader |
| View allocation data | system_admin, project_leader, director, minister, audit, frontdesk_housing |

---

## 9. Audit Log Access

| Capability | Authorized Roles |
|-----------|-----------------|
| View audit log | system_admin, project_leader, minister, director, ministerial_advisor, audit |
| Filter/search audit events | Same as above |
| Modify/delete audit records | ❌ No one — immutable by design |

---

## 10. User Management Authority

| Action | Authorized Role |
|--------|----------------|
| Create user accounts | system_admin |
| Assign/revoke roles | system_admin |
| Deactivate users | system_admin |
| Set district assignment | system_admin |

---

## 11. Scope Summary

| Role | District Scope | Data Visibility |
|------|---------------|----------------|
| system_admin | National | All districts |
| project_leader | National | All districts |
| minister | National | All districts |
| director | National | All districts |
| ministerial_advisor | National | All districts |
| audit | National | All districts |
| frontdesk_bouwsubsidie | District | Own district only |
| frontdesk_housing | District | Own district only |
| admin_staff | District | Own district only |
| social_field_worker | District | Own district only |
| technical_inspector | District | Own district only |

---

*End of User Roles and Permission Matrix*
