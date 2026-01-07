# VolksHuisvesting IMS – Architecture & Security (Government Grade)

**Status:** Definitive EN Version
**Alignment:** 1:1 derived from approved NL Architecture & Security document
**Deadline:** 30 January 2026
**Governance:** Devmart Government Grade + Guardian Rules

---

## 1. Purpose of this Document
This document defines the **target architecture and security model** for the VolksHuisvesting IMS. It establishes how the system is structured, secured, and governed at a government-grade level.

This document is **binding** for:
- Database & RLS implementation
- UX flows (public wizard and admin)
- Execution planning and enforcement

---

## 2. High-Level System Architecture

### 2.1 Core Components

1. **Public Web (Citizen-facing)**
   - Landing Page (Service Selection)
   - Public Wizards (Bouwsubsidie & Housing Registration)
   - Citizen Status Tracking (reference + token)
   - Light Theme only

2. **Admin Web (Internal)**
   - Separate authentication
   - Darkone Admin (1:1 parity)
   - Module A: Bouwsubsidie
   - Module B: Housing Registration & Allocation

3. **Backend Platform**
   - Supabase Auth
   - PostgreSQL Database
   - Row Level Security (RLS)
   - Storage (documents)
   - Edge Functions (workflow & document generation)

---

## 3. Modular Separation (Hard Rule)

### 3.1 Modules

- **Module A – Bouwsubsidie**
  - Independent case lifecycle
  - Own status model and audit trail

- **Module B – Housing Registration & Allocation**
  - Independent registration and allocation lifecycle
  - Own status model and audit trail

### 3.2 Shared Core

The **Shared Core** is the only allowed intersection between modules and consists of:
- Person
- Household
- Household Members
- Address and Contact Information

**Hard rule:**
- No shared statuses
- No shared workflows
- No cross-module writes outside Shared Core

---

## 4. Data Domains

### 4.1 Domain A – Bouwsubsidie
- Case intake and screening
- Document requirements
- Social and technical assessments
- Decision workflow
- Raadvoorstel generation (DOCX)

### 4.2 Domain B – Housing Registration & Allocation
- Citizen registration
- Urgency assessment
- District quota management
- Allocation runs and decisions
- External housing assignment registration

### 4.3 Domain C – Governance & Audit
- User roles and access
- Audit events (append-only)
- Reporting and KPIs

---

## 5. Identity & Access Management

### 5.1 Authentication
- Staff authentication via Supabase Auth
- Citizens do not authenticate
- Citizens receive:
  - Reference number
  - Secure access token for status tracking

### 5.2 Authorization
Authorization is enforced exclusively through:
- Row Level Security (RLS)
- Role assignments
- District scoping where applicable

No UI-based permission logic is allowed without RLS enforcement.

---

## 6. Roles & Responsibilities

The system supports the following fixed roles:

- Minister
- Project Leader
- Frontdesk Officer
- Administrative Staff
- Social Field Worker
- Technical Inspector
- Audit / Read-only

Roles are immutable in v1.0.

---

## 7. Row Level Security (Conceptual Model)

### 7.1 Principles
- Least privilege
- Explicit allow, implicit deny
- District-based filtering for operational roles

### 7.2 Access Scope
- **Minister:** National read, approval actions
- **Project Leader:** National read/write, allocation execution
- **Frontdesk:** Create intake records, limited district read
- **Administrative Staff:** Screening and urgency (district)
- **Field Workers:** Write own reports only
- **Audit:** Read-only across all domains

---

## 8. Audit & Accountability Layers

### 8.1 Mandatory Audit Coverage
The system must record:
- Record creation
- Status transitions
- Document uploads and validations
- Urgency score changes
- Allocation runs and decisions
- Raadvoorstel generation and approvals

### 8.2 Audit Data Requirements
Each audit event must include:
- Actor (user/system)
- Role
- Timestamp
- Action
- Affected entity
- Reason/comment (mandatory for decisions)

Audit logs are append-only and immutable.

---

## 9. Raadvoorstel Generation Architecture

### 9.1 Trigger
- Case status changes to **Approved for Council**
- Project Leader confirms generation

### 9.2 Processing
- Edge Function generates DOCX using approved template
- Document stored as concept
- Approval workflow enforced

---

## 10. Public Status Tracking (Security)

### 10.1 Access Model
- Citizen access via reference number + token
- Token stored only as hash

### 10.2 Data Exposure
Citizens may only view:
- Current status
- Last update date
- Next procedural step
- Contact information

No internal data is exposed.

---

## 11. Non-Negotiable Guardian Rules

- Darkone Admin must remain 1:1
- No Bootstrap or alternative UI frameworks
- No custom icon libraries
- Public frontend Light Theme only
- RLS enforced before production
- Audit-first over speed

---

## 12. Dependencies

This document must remain aligned with:
- Master PRD (EN)
- Database & RLS Specification
- UX Flows (Wizard + Admin)
- Raadvoorstel Template
- Execution Plan

---

**End of Architecture & Security (EN)**
