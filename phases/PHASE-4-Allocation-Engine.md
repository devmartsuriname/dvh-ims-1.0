# Phase 4 — Allocation Engine

**Project:** VolksHuisvesting IMS (DVH-IMS-1.0)  
**Status:** Documentation Only  
**Authority:** Delroy (Final)

---

## A. Phase Objective

Implement the Allocation Engine for housing distribution:
- District quota management
- Allocation run execution
- Candidate selection based on urgency and waiting list
- Decision tracking and audit trail
- External assignment registration

---

## B. Explicit Scope (ALLOWED)

| Category | Allowed Actions |
|----------|-----------------|
| Database | Create `district_quota` table |
| Database | Create `allocation_run` table |
| Database | Create `allocation_candidate` table |
| Database | Create `allocation_decision` table |
| Database | Create `assignment_record` table |
| Database | Create RLS policies for all Allocation tables |
| UI | Create Quota Management page (Admin - Project Leader) |
| UI | Create Allocation Run page (Admin - Project Leader) |
| UI | Create Allocation Decisions list |
| UI | Create Assignment Registration page |
| Integration | Create `execute-allocation-run` Edge Function |

---

## C. Explicit Out of Scope (FORBIDDEN)

| Category | Forbidden Actions |
|----------|-------------------|
| Modules | Bouwsubsidie modifications |
| Modules | Housing Registration table modifications |
| Shared Core | Modifications to Person/Household tables |
| UI | Public-facing pages |
| UI | Layout modifications |
| UI | SCSS changes |
| Features | Housing inventory/unit management (out of v1.0 scope) |

---

## D. Database Impact (DOCUMENTATION ONLY)

### Tables to Create

#### `district_quota`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| district_code | text | NO | - | District identifier |
| period_start | date | NO | - | Period start date |
| period_end | date | NO | - | Period end date |
| total_quota | integer | NO | - | Total allocations allowed |
| allocated_count | integer | NO | 0 | Current allocation count |
| created_by | uuid | NO | - | Creator user ID |
| created_at | timestamptz | NO | now() | Creation timestamp |
| updated_at | timestamptz | NO | now() | Last update |

#### `allocation_run`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| district_code | text | NO | - | District identifier |
| run_date | timestamptz | NO | now() | Run timestamp |
| run_status | text | NO | 'pending' | pending/running/completed/failed |
| candidates_count | integer | YES | - | Number of candidates |
| allocations_count | integer | YES | - | Number of allocations |
| executed_by | uuid | NO | - | Executor user ID |
| completed_at | timestamptz | YES | - | Completion time |
| error_message | text | YES | - | Error if failed |

#### `allocation_candidate`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| run_id | uuid | NO | - | FK to allocation_run |
| registration_id | uuid | NO | - | FK to housing_registration |
| urgency_score | integer | NO | - | Score at time of run |
| waiting_list_position | integer | NO | - | Position at time of run |
| composite_rank | integer | NO | - | Final ranking |
| is_selected | boolean | NO | false | Selected for allocation |

#### `allocation_decision`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| run_id | uuid | NO | - | FK to allocation_run |
| candidate_id | uuid | NO | - | FK to allocation_candidate |
| registration_id | uuid | NO | - | FK to housing_registration |
| decision | text | NO | - | allocated/deferred/rejected |
| decision_reason | text | YES | - | Reason for decision |
| decided_by | uuid | NO | - | Decider user ID |
| decided_at | timestamptz | NO | now() | Decision timestamp |

#### `assignment_record`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| registration_id | uuid | NO | - | FK to housing_registration |
| decision_id | uuid | YES | - | FK to allocation_decision |
| assignment_type | text | NO | - | internal/external |
| assignment_date | date | NO | - | Date of assignment |
| housing_reference | text | YES | - | External reference |
| notes | text | YES | - | Additional notes |
| recorded_by | uuid | NO | - | Recorder user ID |
| recorded_at | timestamptz | NO | now() | Recording timestamp |

### RLS Policy Matrix

| Table | Policy | Operation | Expression |
|-------|--------|-----------|------------|
| district_quota | Project Leader only | ALL | Role = project_leader |
| allocation_run | Project Leader can execute | INSERT/UPDATE | Role = project_leader |
| allocation_run | Authorized can read | SELECT | Role-based |
| allocation_candidate | System generated | INSERT | Via Edge Function |
| allocation_decision | Project Leader decides | INSERT/UPDATE | Role = project_leader |
| assignment_record | Authorized can record | INSERT | Role-based |
| assignment_record | Immutable after creation | UPDATE | DENY all |

---

## E. UI Impact (DOCUMENTATION ONLY)

### Admin Pages (Darkone 1:1)

| Page | Route | Access | Description |
|------|-------|--------|-------------|
| Quota Management | `/admin/allocation/quotas` | Project Leader | Manage district quotas |
| Allocation Runs | `/admin/allocation/runs` | Project Leader | Execute and view runs |
| Allocation Decisions | `/admin/allocation/decisions` | Project Leader | View/make decisions |
| Assignment Registration | `/admin/allocation/assignments` | Admin Staff | Record assignments |

### Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| QuotaManagement | `src/app/admin/allocation/quotas/` | Quota CRUD |
| AllocationRunList | `src/app/admin/allocation/runs/` | Run listing |
| AllocationRunExecutor | `src/components/allocation/` | Run execution |
| DecisionList | `src/app/admin/allocation/decisions/` | Decision listing |
| DecisionForm | `src/components/allocation/` | Decision making |
| AssignmentForm | `src/app/admin/allocation/assignments/` | Assignment recording |

### Access Control

| Page | Roles Allowed |
|------|---------------|
| Quota Management | Project Leader |
| Allocation Runs | Project Leader |
| Allocation Decisions | Project Leader |
| Assignment Registration | Project Leader, Admin Staff |

---

## F. Security & RLS Considerations

### Role-Based Access

| Role | Quota | Run | Decision | Assignment |
|------|-------|-----|----------|------------|
| Minister | Read | Read | Read | Read |
| Project Leader | Full | Full | Full | Full |
| Admin Staff | None | Read | Read | Create |
| Audit | Read | Read | Read | Read |
| Others | None | None | None | None |

### Allocation Integrity

- Quota limits enforced at database level
- Allocation runs are transactional
- Decisions are immutable after creation
- Full audit trail for all actions

### Edge Function Security

- Service role key used (server-side only)
- User authorization verified before execution
- Transaction rollback on failure
- Error logging for debugging

---

## G. Verification Criteria

### Database Verification

- [ ] All 5 Allocation tables created
- [ ] RLS enabled on all tables
- [ ] FORCE RLS applied on all tables
- [ ] Quota constraints enforced
- [ ] Decision immutability enforced

### UI Verification

- [ ] Quota management works
- [ ] Allocation run execution works
- [ ] Decision list displays correctly
- [ ] Decision making form works
- [ ] Assignment registration works
- [ ] Access control enforced per role
- [ ] Darkone 1:1 compliance verified

### Edge Function Verification

- [ ] Edge Function deploys successfully
- [ ] Allocation algorithm produces correct results
- [ ] Quota limits respected
- [ ] Transaction integrity maintained
- [ ] Error handling works correctly

### End-to-End Verification

- [ ] Complete allocation flow works
- [ ] From waiting list → allocation run → decision → assignment
- [ ] Quota decrements correctly
- [ ] Registration status updates correctly
- [ ] All actions logged to audit_event

---

## H. Restore Point Definition

### Restore Point Name
`phase-4-complete`

### Restore Point Contents
- All Phase 4 database migrations applied
- All Phase 4 UI components created
- Edge Function deployed
- Verification checklist completed
- Clean build state

### Rollback Procedure
If Phase 4 fails verification:
1. Revert to `phase-3-complete`
2. Drop Phase 4 tables
3. Delete Edge Function
4. Report failure details
5. Await remediation instructions

---

## I. Hard Stop Statement

**MANDATORY HARD STOP AFTER PHASE 4 COMPLETION**

Upon completing Phase 4:
1. Execute all verification criteria
2. Submit completion report in standard format
3. **STOP** — Do not proceed to Phase 5
4. Await explicit written authorization from Delroy

**NO AUTO-PROCEED TO PHASE 5**

---

**End of Phase 4 Documentation**
