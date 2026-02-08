# DVH-IMS — Frontdesk Working Instructions

**Version:** V1.5 (Test & Stabilization)
**Audience:** frontdesk_bouwsubsidie, frontdesk_housing
**Status:** AS-IS operational reference — no new features

---

## 1. Bouwsubsidie Frontdesk (`frontdesk_bouwsubsidie`)

### Intake Processing
1. Navigate to the **Control Queue** (`/control-queue`)
2. New applications submitted via the public wizard appear with status `SUBMITTED`
3. Review the application details: applicant info, household, documents
4. Verify uploaded documents against requirements
5. Mark documents as verified when confirmed authentic

### Subsidy Case Creation
- Cases are created automatically when a citizen submits via the public wizard
- Frontdesk does NOT create cases manually
- Each case receives a unique `case_number` (auto-generated)

### Control Queue Usage
- Filter cases by status, district, and date
- View case details including applicant, household, and documents
- District-scoped: you only see cases in your assigned district

### Document Verification
- Review each uploaded document against the requirement checklist
- Mark individual documents as verified
- All verifications are audit-logged

---

## 2. Housing Frontdesk (`frontdesk_housing`)

### Registration Processing
1. Navigate to **Housing Registrations** page
2. New registrations from the public wizard appear with status `SUBMITTED`
3. Review applicant details, household composition, and documents
4. Verify uploaded documents

### Waiting List Management
- View registrations ordered by waiting list position
- Waiting list position is assigned automatically at registration
- No manual re-ordering of the waiting list

### Allocation Decisions
- View allocation run results when executed by authorized roles
- Review candidate rankings and scores
- District-scoped: only your district's registrations are visible

---

## 3. Shared Core: Person & Household Lookup

### Person Search
- Search by `national_id` (ID number)
- View person details: name, date of birth, gender, nationality
- View associated contact points (phone, email)

### Household View
- View household composition (members and relationships)
- View current address
- View linked subsidy cases or housing registrations

---

## 4. What Frontdesk Roles CANNOT Do

| Action | Permitted? |
|--------|-----------|
| Create or modify case assignments | ❌ No |
| Make decisions on dossiers (approve/reject) | ❌ No |
| Access the Archive | ❌ No |
| View or access audit logs | ❌ No |
| Change dossier status beyond intake | ❌ No |
| Manage user accounts or roles | ❌ No |
| Schedule or manage visits | ❌ No |
| Generate Raadvoorstel documents | ❌ No |
| Run allocation engine | ❌ No |
| Access other districts' data | ❌ No |
