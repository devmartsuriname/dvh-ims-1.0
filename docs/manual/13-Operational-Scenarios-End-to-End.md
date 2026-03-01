# DVH-IMS — Operational Scenarios: End-to-End

**Document:** 13 — Operational Scenarios End-to-End
**Version:** V1.7
**Classification:** Official — For Ministerial Review
**Date:** March 2026

---

## Scenario 1: Citizen Submits Housing Registration

### Preconditions
- Citizen has a valid national ID
- Internet access and modern browser
- Rate limit not exceeded (< 5 submissions/hour)

### Steps
1. Citizen navigates to https://volkshuisvesting.sr/housing/register
2. Completes Step 1: Personal Identification (national ID, name, DOB, gender)
3. Completes Step 2: Contact Information (phone, email)
4. Completes Step 3: Current Living Situation (address, district, housing type, rent, residents)
5. Completes Step 4: Housing Preference (interest type, preferred district)
6. Completes Step 5: Reason for Application
7. Completes Step 6: Income Information
8. Completes Step 7: Special Needs / Urgency (disability, emergency indicators)
9. Completes Step 8: Document Uploads (mandatory: ID copy, income proof, residence proof)
10. Completes Step 9: Reviews all data, accepts declaration, clicks Submit

### Expected Outcomes
- Registration created with status `SUBMITTED`
- Reference number displayed (format: `WR-YYYYMMDD-XXXX`)
- Security token displayed (one-time only)
- Person record created (or existing person reused if same national_id)
- Household and address records created
- Documents stored in `citizen-uploads` bucket
- Audit event: CREATE (housing_registration) with correlation_id

### Where to Verify
- **Staff:** Admin → Housing Registrations → filter by district → new row visible
- **Audit:** Admin → Audit Log → filter by entity_type = `housing_registration` → CREATE event
- **Citizen:** https://volkshuisvesting.sr/status → enter reference number + token

### Common Failure Modes
| Issue | Cause | Resolution |
|-------|-------|------------|
| Validation error on email | Format mismatch | Correct email format |
| Missing mandatory document | File not uploaded | Upload required document |
| Rate limit exceeded | >5 submissions/hour | Wait and retry |
| Duplicate national_id | Prior submission exists | System reuses existing person (not an error) |

---

## Scenario 2: Citizen Submits Subsidy Application

### Preconditions
- Citizen has a valid national ID
- Internet access and modern browser

### Steps
1. Citizen navigates to https://volkshuisvesting.sr/bouwsubsidie/apply
2. Completes Step 1: Personal Identification
3. Completes Step 2: Contact Information
4. Completes Step 3: Household Information (size, dependents)
5. Completes Step 4: Current Address (street, district, ressort)
6. Completes Step 5: Application Context (reason, estimated amount, calamity flag)
7. Completes Step 6: Document Uploads (mandatory: ID copy, income declaration, land title, bank statement, household composition)
8. Completes Step 7: Reviews all data, accepts declaration, clicks Submit

### Expected Outcomes
- Subsidy case created with status `SUBMITTED`
- Case number displayed (format: `BS-YYYYMMDD-XXXX`)
- Security token displayed (one-time only)
- All supporting records created (person, household, address, documents)
- Audit event: CREATE (subsidy_case) with correlation_id

### Where to Verify
- **Staff:** Admin → Control Queue or Subsidy Cases → new case visible
- **Audit:** Admin → Audit Log → CREATE event for subsidy_case
- **Citizen:** Status tracker with case number + token

---

## Scenario 3: Frontdesk Processes Housing Registration

### Preconditions
- Registration exists with status `SUBMITTED`
- User has `frontdesk_housing` role in the correct district

### Steps
1. Login at https://volkshuisvesting.sr/auth/sign-in
2. Navigate to Housing Registrations
3. Locate the new registration (filter by status: SUBMITTED)
4. Click View to open detail view
5. Review applicant information, household data, and housing preference
6. Open Documents tab
7. Download and review each uploaded document
8. Mark documents as verified (click verify per document)
9. Change status from SUBMITTED to IN_REVIEW (provide reason)
10. After full review, change status to APPROVED (provide reason)

### Expected Outcomes
- Documents marked as verified (is_verified = true, verified_by, verified_at)
- Status history entries: SUBMITTED → IN_REVIEW → APPROVED
- Audit events: DOCUMENT_VERIFIED (per document), STATUS_CHANGE (×2)
- Registration enters waiting list

### Where to Verify
- **Detail View:** Status History tab shows all transitions with reasons
- **Audit Log:** Filter by entity_id → all events for this registration

---

## Scenario 4: Full Subsidy Decision Chain

### Preconditions
- Subsidy case exists with status `SUBMITTED`
- Workers assigned via Case Assignments for social and technical reviews

### Steps
1. **Frontdesk** (frontdesk_bouwsubsidie): Review application, verify documents, advance to IN_REVIEW
2. **Assignment Manager** (project_leader): Assign social_field_worker and technical_inspector to the case
3. **Social Field Worker**: Navigate to My Visits → open assigned case → complete Social Review report → finalize
4. **Technical Inspector**: Navigate to My Visits → open assigned case → complete Technical Inspection report → finalize
5. **Admin Staff**: Open case → review administrative completeness → advance status
6. **Project Leader**: Open case → review policy compliance → advance status
7. **Director**: Open case → Director Review tab → approve with justification
8. **Ministerial Advisor**: Open case → Advisor tab → provide recommendation (paraaf) with justification
9. **Minister**: Open case → Minister Decision tab → approve with justification

### Expected Outcomes
- Case status progresses through all 8 steps sequentially
- Social and technical reports finalized (is_finalized = true)
- Director approval, advisor recommendation, and minister decision all recorded
- Raadvoorstel generated after minister approval
- Case reaches terminal status: CLOSED_APPROVED
- Complete audit trail with 15+ audit events

### Where to Verify
- **Case Detail:** Status History tab → full chain of transitions
- **Audit Log:** Filter by entity_id → complete decision chain events
- **Archive:** Case appears in Archive after reaching terminal status

---

## Scenario 5: Allocation Run and Housing Assignment

### Preconditions
- Multiple housing registrations with status WAITLISTED in target district
- District quota defined with available units
- User has `system_admin` or `project_leader` role

### Steps
1. Navigate to Allocation Quotas → verify/set quota for target district
2. Navigate to Allocation Runs → initiate new run for target district
3. System executes allocation algorithm → candidates ranked
4. Navigate to Allocation Decisions → review ranked candidates
5. Accept top candidates (provide reason); reject others if needed
6. Navigate to Allocation Assignments → register housing assignments for accepted candidates
7. Registration statuses update to ALLOCATED → ASSIGNED

### Expected Outcomes
- Allocation run record: completed, candidates_count, allocations_count
- Candidate records with composite_rank, urgency_score, waiting_list_position
- Decision records: accepted/rejected with reasons
- Assignment records with housing references
- Registration statuses updated
- Audit trail for all allocation actions

### Where to Verify
- **Allocation Runs:** Run detail shows candidates and scores
- **Allocation Decisions:** Accept/reject decisions with reasons
- **Housing Registrations:** Status updated to ALLOCATED/ASSIGNED
- **Audit Log:** Allocation-related events

---

## Scenario 6: Minister Deviates from Advisor Recommendation

### Preconditions
- Subsidy case has reached MINISTER_DECISION status
- Ministerial Advisor has provided recommendation (e.g., APPROVE)
- Minister disagrees and wants to RETURN the dossier

### Steps
1. Minister logs in and navigates to the subsidy case
2. Opens the Minister Decision tab
3. Selects RETURN (instead of APPROVE, which was the advisor's recommendation)
4. System detects deviation from advisor recommendation
5. System displays mandatory deviation explanation field
6. Minister provides written explanation for why they are deviating
7. Minister confirms the decision

### Expected Outcomes
- Case status: MINISTER_RETURNED
- Status history entry with Minister's reason
- Audit event: MINISTER_RETURNED with reason and metadata containing advisor's original recommendation
- Deviation explanation permanently recorded and immutable
- Case returns to earlier step for rework

### Where to Verify
- **Case Detail:** Status History → MINISTER_RETURNED entry with deviation explanation
- **Audit Log:** MINISTER_RETURNED event with metadata_json showing advisor recommendation vs minister decision

---

## Scenario 7: Archive Lookup of Closed Case

### Preconditions
- A subsidy case or housing registration has reached terminal status
- User has archive access (system_admin, project_leader, director, minister, ministerial_advisor, audit)

### Steps
1. Navigate to https://volkshuisvesting.sr/archive
2. Filter by service type, status, district, or date range
3. Locate the target dossier
4. Open the detail view
5. Review: applicant info, documents, reports, decisions, status history

### Expected Outcomes
- Full dossier displayed (read-only)
- All documents, reports, and decisions accessible
- Complete status history visible
- No modification possible (all controls disabled)

### Where to Verify
- **Archive Detail:** All tabs show data; no edit/action buttons visible

---

## Scenario 8: Audit Trail Verification

### Preconditions
- User has `audit` role (or other audit-log-access role)
- A specific case needs audit verification

### Steps
1. Navigate to https://volkshuisvesting.sr/audit-log
2. Filter by entity_type (e.g., `subsidy_case`)
3. Filter by entity_id (the specific case UUID)
4. Review all events chronologically
5. Verify: each decision step has corresponding audit events
6. Check: all events have actor_user_id, actor_role, reason
7. Verify: no gaps in the decision chain
8. Check: any RETURNED events have mandatory reasons
9. If ministerial deviation exists: verify metadata_json contains advisor recommendation

### Expected Outcomes
- Complete chronological event list for the entity
- Every decision step represented by audit events
- All events attributed to specific users and roles
- No gaps or anomalies in the chain
- Deviation logging verified (if applicable)

---

*End of Operational Scenarios End-to-End*
