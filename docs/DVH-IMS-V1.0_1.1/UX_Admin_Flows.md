# VolksHuisvesting IMS – UX Admin Flows (EN)

**Status:** Definitive EN Version
**Alignment:** 1:1 derived from approved NL UX Flows (Sections 5-8)
**Principles:** Darkone Admin 1:1, role-based access, audit-first

---

## 1. Admin Interface – Global Structure (Darkone)

### 1.1 Global Navigation
- Dashboard (KPIs)
- Global search (BS / WR)
- Audit log
- User & Role management

### 1.2 UI Constraints (Hard)
- Darkone Admin must remain 1:1
- Darkone SCSS and Assets Library only
- No Bootstrap extensions
- No custom icon libraries
- No layout changes

---

## 2. Admin – Module A: Construction Subsidy (Bouwsubsidie)

### 2.1 Pages
- Case list (filterable by status, district)
- Case detail with tabs:
  - **Overview** - Case summary and applicant info
  - **Document checklist** - Required documents status
  - **Social report** - Field worker assessment
  - **Technical report** - Inspector assessment
  - **Status history** - Full audit trail
  - **Council proposal (Raadvoorstel)** - DOCX generation and approval

### 2.2 Actions per Role
- **Frontdesk:** View list, create intake record
- **Administrative Staff:** Document screening, status updates
- **Social Field Worker:** Submit social report
- **Technical Inspector:** Submit technical report
- **Project Leader:** Approve for council, trigger Raadvoorstel
- **Minister:** Approve Raadvoorstel
- **Audit:** Read-only access

---

## 3. Admin – Module B: Housing Registration & Allocation

### 3.1 Pages
- Registration list (filterable by status, district)
- Registration detail with tabs:
  - **Overview** - Registration summary
  - **Urgency assessment** - Score and band
  - **Status history** - Full audit trail
  - **Allocation & assignment** - Allocation decisions

### 3.2 Allocation Area (Project Leader Only)
- District quota management
- Allocation runs
- Allocation decisions

### 3.3 Actions per Role
- **Frontdesk:** View list, create registration
- **Administrative Staff:** Urgency data entry, screening
- **Project Leader:** Manage quotas, execute allocation runs, approve decisions
- **Minister:** View dashboards (read-only)
- **Audit:** Read-only access

---

## 4. Role-Based Core Flows

### 4.1 Frontdesk
- Register intake (Bouwsubsidie or Housing)
- Issue receipt to citizen
- No evaluation or scoring permitted

### 4.2 Administrative Staff
- Document screening (verify completeness)
- Urgency data entry (Housing module)
- Update case status within permitted transitions

### 4.3 Social / Technical Staff
- Submit field reports
- Cannot edit after submission (immutable)
- Report linked to case permanently

### 4.4 Project Leader
- Full case/registration oversight
- Approvals and status escalations
- Allocation execution
- Trigger council proposal generation

### 4.5 Minister
- Read-only dashboards
- Council proposal approval (final sign-off)
- No direct case manipulation

### 4.6 Audit
- Read-only access across all modules
- Full audit log visibility
- No write permissions

---

## 5. Dashboard KPIs

### 5.1 Bouwsubsidie KPIs
- Total cases by status
- Average processing time
- Cases pending documents
- Raadvoorstel pending approval

### 5.2 Housing Registration KPIs
- Total registrations by status
- Registrations by urgency band
- Allocation run statistics
- Assignments by district

---

## 6. Audit Log Interface

### 6.1 Visibility
- Accessible to Audit role and above
- Filterable by:
  - Date range
  - Entity type
  - Action type
  - Actor

### 6.2 Display Fields
- Timestamp
- Actor (name and role)
- Action
- Entity type and ID
- Reason (if provided)

---

## 7. User & Role Management

### 7.1 Accessible To
- Project Leader
- Admin roles (if defined)

### 7.2 Capabilities
- View user list
- Assign roles
- Set district scope
- Activate/deactivate users

---

## 8. Dependencies

This document must remain aligned with:
- Master PRD (EN)
- Architecture & Security (EN)
- Database & RLS Specification (EN)
- UX Public Wizard & Design Uniformity (EN)

---

**End of UX Admin Flows (EN)**
