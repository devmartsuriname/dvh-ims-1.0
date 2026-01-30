# DVH-IMS V1.2 — Deferred Items Manifest

**Version:** 1.0  
**Date:** 2026-01-30  
**Status:** FINAL  
**Document Type:** Consolidation Artifact

---

## 1. Purpose

This document consolidates all items explicitly deferred during the V1.2 documentation and verification cycle. These items were identified during Phase 1-5 verification activities and are documented here for tracking and future planning.

---

## 2. Deferred Items by Category

### 2.1 Database/Backend Enhancements

| ID | Item | Source Phase | Impact | Deferred To | Notes |
|----|------|--------------|--------|-------------|-------|
| D-01 | Backend Transition Enforcement (DB triggers) | Phase 4 | Medium | V1.3 or Scale Pack | Transitions currently enforced in UI only |
| D-02 | Legacy Audit Events (pre-Phase 2) | Phase 4 | Low | Accepted | Historical gap, no remediation needed |

### 2.2 Service Layer Formalization

| ID | Item | Source Phase | Impact | Deferred To | Notes |
|----|------|--------------|--------|-------------|-------|
| S-01 | Financial Assessment Service formalization | Phase 5 | Low | V1.3 | Fields exist, workflow supports manual assessment |
| S-02 | Subsidy Allocation formal workflow | Phase 5 | Low | V1.3 | approved_amount + finalized status sufficient |
| S-03 | Notification Orchestration Service | Phase 5 | Expected | V1.3 | Documented as planning-only in V1.2 |
| S-04 | Reporting Aggregations (database-level) | Phase 5 | Low | Scale Pack B | Dashboard functional, optimization deferred |

### 2.3 Scale Readiness Items

| ID | Item | Source Document | Impact | Deferred To | Notes |
|----|------|-----------------|--------|-------------|-------|
| SP-A | Admin Listings Server-Side Pagination | Scale Readiness Roadmap | Medium | Scale Pack A | Current: client-side pagination |
| SP-B | Dashboard KPI Aggregations | Scale Readiness Roadmap | Medium | Scale Pack B | Current: real-time queries |
| SP-C | Form Selector Async Search | Scale Readiness Roadmap | Medium | Scale Pack C | Current: preloaded selectors |

---

## 3. Impact Analysis

### 3.1 V1.1 Operational Impact

| Category | Impact | Assessment |
|----------|--------|------------|
| Core Functionality | NONE | All V1.1 features operational |
| Audit Logging | NONE | Fully operational |
| RBAC Enforcement | NONE | RLS active on all tables |
| Public Wizards | NONE | Frozen and functional |

### 3.2 Scale Thresholds

Per Scale Readiness Roadmap:
- **Current capacity:** ~500 concurrent users (estimated)
- **Pagination threshold:** ~1000 dossiers per module
- **Dashboard threshold:** ~5000 total records

---

## 4. Governance Tracking

### 4.1 Items NOT Deferred (Completed in V1.2)

| Phase | Completed Verification |
|-------|------------------------|
| Phase 1 | User/Role Operationalization |
| Phase 2 | Workflow Integrity |
| Phase 3 | Audit Coverage |
| Phase 4 | RBAC Enforcement |
| Phase 5 | Service Alignment (documentation) |

### 4.2 Items Explicitly Excluded from V1.2

| Item | Reason | Reference |
|------|--------|-----------|
| Public Wizard Changes | Frozen in V1.1 | Scope & Objectives |
| Legacy Data Migration | Not in scope | Implementation Roadmap |
| External Integrations | Excluded | Services Decomposition |
| Email/SMS Gateways | Planning only | Notifications document |

---

## 5. Future Planning Reference

### 5.1 V1.3 Candidate Items

1. D-01: Backend Transition Enforcement
2. S-01: Financial Assessment Service
3. S-02: Subsidy Allocation Workflow
4. S-03: Notification Orchestration

### 5.2 Scale Pack Sequence

1. **Scale Pack A:** Server-side pagination for admin listings
2. **Scale Pack B:** Dashboard aggregation views + S-04
3. **Scale Pack C:** Async search for form selectors

---

## 6. Approval

This manifest consolidates all deferred items from V1.2 Phases 1-5.

- **Consolidated by:** DVH-IMS System
- **Date:** 2026-01-30
- **Authority:** Delroy (Project Owner)

---

**END OF DOCUMENT**
