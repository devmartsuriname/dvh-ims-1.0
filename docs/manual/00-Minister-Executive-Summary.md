# DVH-IMS — Executive Summary for the Minister

**Document:** 00 — Minister Executive Summary
**Version:** V1.7
**Classification:** Official — For Ministerial Review
**Date:** March 2026

---

## 1. Purpose of This Document

This executive summary provides the Minister of Volkshuisvesting (Public Housing) with a high-level overview of the Digital Housing Management Information System (DVH-IMS). It describes the system's purpose, the services it delivers, the governance model it enforces, and the accountability framework that protects the integrity of every decision.

---

## 2. System Purpose

DVH-IMS is the national digital platform for managing two core public housing services in Suriname:

1. **Bouwsubsidie** (Construction Subsidy) — Financial support for citizens who need assistance with housing construction or improvement.
2. **Woningregistratie & Allocatie** (Housing Registration & Allocation) — Registration of citizens seeking public housing, with a transparent allocation engine based on urgency, waiting time, and district quotas.

The system replaces manual, paper-based processes with a fully digital, auditable workflow that ensures transparency, traceability, and legal compliance at every step.

---

## 3. Who Uses the System

### Citizens (Public Users)
- Citizens apply for services via public online forms at **https://volkshuisvesting.sr**
- No login or account is required — applications are anonymous
- After submission, citizens receive a **reference number** and **security token** to track their application status online

### Government Staff (Authenticated Users)
- Staff access the administrative interface at **https://volkshuisvesting.sr/auth/sign-in**
- Access is controlled by **11 defined roles**, each with specific permissions
- All staff actions are logged in an immutable audit trail

---

## 4. The Two Services

### 4.1 Bouwsubsidie (Construction Subsidy)

Citizens apply online by providing personal information, household details, current address, application context, and supporting documents. Each application enters an **8-step mandatory decision chain**:

| Step | Responsible Role | Action |
|------|-----------------|--------|
| 1 | Frontdesk | Intake review and document verification |
| 2 | Social Field Worker | Social assessment visit and report |
| 3 | Technical Inspector | Technical inspection visit and report |
| 4 | Administrative Staff | Administrative completeness review |
| 5 | Project Leader | Policy compliance review |
| 6 | Director | Organizational approval |
| 7 | Ministerial Advisor | Advisory review and formal recommendation (paraaf) |
| 8 | Minister | Final decision: approve or return |

**No step can be skipped or executed out of order.** The system enforces this programmatically.

After final approval, the system generates a **Raadvoorstel** (Council Document) that serves as the official government record.

### 4.2 Woningregistratie & Allocatie (Housing Registration & Allocation)

Citizens register their housing need online. Registrations are processed by frontdesk staff, placed on a **waiting list**, and scored for **urgency** (medical needs, emergency situations). When housing units become available, the **Allocation Engine** runs an automated matching process:

1. District quotas define available units per district
2. The engine ranks eligible candidates by urgency score and waiting list position
3. Allocation decisions are recorded and assigned
4. All decisions are auditable

---

## 5. Governance Model

### 5.1 Role-Based Access Control

Every user has one or more assigned roles that determine exactly what they can see and do:

- **National roles** (system_admin, project_leader, minister, director, ministerial_advisor, audit) have cross-district visibility
- **District roles** (frontdesk, field workers, admin staff) are restricted to their assigned district
- The **audit** role has read-only access to all data for compliance verification

### 5.2 Mandatory Audit Trail

Every action in the system creates an immutable audit record:

- **Who** performed the action (user ID and role)
- **What** was done (action type and affected entity)
- **When** it happened (timestamp)
- **Why** (mandatory reason/justification for status changes and decisions)

The audit log cannot be edited or deleted — not even by system administrators.

### 5.3 Minister Deviation Logging

When the Minister's decision differs from the Ministerial Advisor's recommendation, the system requires a **mandatory free-text explanation**. This deviation is permanently recorded in the audit trail, ensuring accountability and legal traceability.

### 5.4 Row-Level Security (RLS)

The database enforces access rules at the data level. Even if the user interface were bypassed, the database itself would reject unauthorized access. This provides defense-in-depth security.

---

## 6. Key System Characteristics

| Characteristic | Description |
|---------------|-------------|
| **Transparency** | Every decision is traceable from submission to outcome |
| **Accountability** | All actions are attributed to specific users with specific roles |
| **Integrity** | The 8-step chain cannot be bypassed; audit logs are immutable |
| **Fairness** | Allocation uses objective criteria (urgency, waiting time, quotas) |
| **Security** | Role-based access, district scoping, database-level enforcement |
| **Accessibility** | Citizens apply anonymously online; no government office visit required |

---

## 7. System URLs

| Purpose | URL |
|---------|-----|
| Public Landing Page | https://volkshuisvesting.sr/ |
| Housing Registration | https://volkshuisvesting.sr/housing/register |
| Subsidy Application | https://volkshuisvesting.sr/bouwsubsidie/apply |
| Application Status Tracker | https://volkshuisvesting.sr/status |
| Staff Login | https://volkshuisvesting.sr/auth/sign-in |
| Admin Dashboard | https://volkshuisvesting.sr/dashboards |

---

## 8. What Happens After Submission

### For Bouwsubsidie
1. Citizen submits application → receives reference number + security token
2. Frontdesk reviews and verifies documents
3. Social and technical assessments are conducted
4. Administrative and policy reviews confirm eligibility
5. Director provides organizational approval
6. Ministerial Advisor provides formal recommendation
7. Minister makes final decision
8. If approved: Raadvoorstel is generated as official record

### For Housing Registration
1. Citizen submits registration → receives reference number + security token
2. Frontdesk reviews and verifies documents
3. Registration enters the waiting list
4. Urgency assessment assigns priority score
5. When units are available: Allocation Engine matches candidates
6. Decisions are recorded and housing is assigned

Citizens can track their application status at any time using their reference number and security token at **https://volkshuisvesting.sr/status**.

---

## 9. Current System Boundaries

The following capabilities are **not** included in the current version:

- Email, SMS, or push notifications
- Automated task routing or workload balancing
- KPI dashboards or performance metrics
- Citizen user accounts or citizen portal
- Deadline tracking or SLA monitoring

All actions require manual initiation by authorized staff members.

---

## 10. Accompanying Documentation

This executive summary is part of a comprehensive system manual. The full manual includes:

| Document | Content |
|----------|---------|
| 01 — System Overview | Architecture and module map |
| 02 — Housing Registration Workflow | Public applicant flow |
| 03 — Subsidy Application Workflow | Public applicant flow |
| 04 — Admin: Housing Management | Staff processing workflow |
| 05 — Admin: Subsidy Management | Staff processing and decision chain |
| 06 — Roles & Permission Matrix | All 11 roles with detailed access rights |
| 07 — Status Lifecycle | State diagrams and transition rules |
| 08 — Document Management | Upload, verification, and generated documents |
| 09 — Audit Logging | Traceability and compliance |
| 10 — Allocation Engine | Quota management and matching logic |
| 11 — Governance Controls | Security enforcement and compliance |
| 12 — Module Specification | Detailed breakdown of every system module |
| 13 — Operational Scenarios | End-to-end test scenarios |
| 14 — Troubleshooting & FAQ | Common issues and solutions |
| 15 — Glossary | System terminology and definitions |

---

*End of Executive Summary*
