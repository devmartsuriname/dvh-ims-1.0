# DVH-IMS — Public Workflow: Housing Registration

**Document:** 02 — Frontend Workflow: Housing Registration (Woningregistratie)
**Version:** V1.7
**Classification:** Official — For Ministerial Review
**Date:** March 2026

> **Note on screenshots:** Screenshot references (e.g., `[Screenshot: ...]`) indicate where annotated, PII-masked screenshots will be inserted during the visual documentation pass.

---

## 1. Overview

Citizens seeking public housing in Suriname can register their need through a 9-step online wizard. No login or account is required. Upon completion, the citizen receives a reference number and security token to track their registration status.

**URL:** https://volkshuisvesting.sr/housing/register

---

## 2. Preconditions

- The citizen must have a valid national ID number
- A modern web browser with internet access is required
- No account or prior registration is needed
- The system accepts a maximum of 5 submissions per hour per IP address (rate limiting)

---

## 3. Step-by-Step Wizard

### Step 1 — Personal Identification

| Field | Description | Required |
|-------|------------|----------|
| National ID | Citizen's identification number | ✅ Yes |
| First Name | Legal first name | ✅ Yes |
| Last Name | Legal last name | ✅ Yes |
| Date of Birth | Date of birth (YYYY-MM-DD format) | ✅ Yes |
| Gender | Male / Female | ✅ Yes |

[Screenshot: Housing Wizard — Step 1 Personal Identification]

### Step 2 — Contact Information

| Field | Description | Required |
|-------|------------|----------|
| Phone Number | Contact telephone number | ✅ Yes |
| Email | Email address | ✅ Yes |

[Screenshot: Housing Wizard — Step 2 Contact Information]

### Step 3 — Current Living Situation

| Field | Description | Required |
|-------|------------|----------|
| Address Line 1 | Current street address | ✅ Yes |
| District | Current residential district | ✅ Yes |
| Current Housing Type | Type of current housing | ✅ Yes |
| Monthly Rent | Current monthly rent (if applicable) | ✅ Yes |
| Number of Residents | Total persons in current dwelling | ✅ Yes |

[Screenshot: Housing Wizard — Step 3 Current Living Situation]

### Step 4 — Housing Preference

| Field | Description | Required |
|-------|------------|----------|
| Interest Type | Rent / Rent-to-Own / Purchase | ✅ Yes |
| Preferred District | Desired district for housing | ✅ Yes |

[Screenshot: Housing Wizard — Step 4 Housing Preference]

### Step 5 — Reason for Application

| Field | Description | Required |
|-------|------------|----------|
| Application Reason | Free-text explanation of housing need | ✅ Yes |

[Screenshot: Housing Wizard — Step 5 Application Reason]

### Step 6 — Income Information

| Field | Description | Required |
|-------|------------|----------|
| Income Source | Source of income | ✅ Yes |
| Monthly Income (Applicant) | Applicant's monthly income | ✅ Yes |
| Monthly Income (Partner) | Partner's monthly income (if applicable) | ✅ Yes |

[Screenshot: Housing Wizard — Step 6 Income Information]

### Step 7 — Special Needs / Urgency

| Field | Description | Required |
|-------|------------|----------|
| Has Disability | Whether applicant or household member has a disability | ✅ Yes |
| Has Emergency | Whether there is an urgent housing emergency | ✅ Yes |
| Urgency Details | Details about the emergency situation (if applicable) | Conditional |

[Screenshot: Housing Wizard — Step 7 Special Needs]

### Step 8 — Document Uploads

Citizens must upload supporting documents. The system displays the full requirements list with mandatory/optional indicators.

**Required Documents (Mandatory):**

| Document | Code |
|----------|------|
| Copy of ID | ID_COPY |
| Income Proof | INCOME_PROOF |
| Residence Proof | RESIDENCE_PROOF |

**Optional Documents:**

| Document | Code |
|----------|------|
| Family Composition | FAMILY_COMPOSITION |
| Medical Certificate | MEDICAL_CERTIFICATE |
| Emergency Proof | EMERGENCY_PROOF |

- Accepted file types: PDF, JPEG, PNG
- Files are uploaded to secure cloud storage
- Each file is tagged with a timestamp and linked to the registration

[Screenshot: Housing Wizard — Step 8 Document Uploads]

### Step 9 — Review and Declaration

The citizen reviews all entered information across all steps. A declaration checkbox must be accepted before submission.

| Element | Description |
|---------|------------|
| Summary | All entered data displayed for review |
| Declaration | "I hereby declare that all information provided is truthful and complete" |
| Submit Button | Submits the application (disabled until declaration is accepted) |

[Screenshot: Housing Wizard — Step 9 Review and Declaration]

---

## 4. What Happens After Submission

### 4.1 Immediate Response

Upon successful submission, the system:

1. Creates a **Person** record (or reuses an existing person with the same national ID)
2. Creates a **Household** record with the applicant as primary person
3. Creates a **Housing Registration** record with status `SUBMITTED`
4. Creates an **Address** record linked to the household
5. Stores all uploaded **documents** in secure storage
6. Generates a unique **reference number** (format: `WR-YYYYMMDD-XXXX`)
7. Generates a **security token** (random, hashed with SHA-256 before storage)
8. Creates an **audit event** recording the submission
9. Creates a **public status access** record for status tracking

### 4.2 Confirmation Page

The citizen sees:
- ✅ Success message
- 📋 Reference number (e.g., `WR-20260301-0042`)
- 🔑 Security token (displayed once — citizen must save it)
- ℹ️ Instructions to save both values for future status tracking

**Important:** The security token is shown only once. It cannot be retrieved later.

[Screenshot: Housing Wizard — Confirmation Page]

### 4.3 Status Tracking

Citizens can check their registration status at:
**https://volkshuisvesting.sr/status**

Required inputs:
- Reference number
- Security token

The system verifies the token against the stored hash and displays the current status and history if valid.

---

## 5. What Happens Next (Staff Side)

After citizen submission:

1. The registration appears in the **Housing Registrations** list for frontdesk staff in the relevant district
2. Frontdesk reviews the submission and verifies uploaded documents
3. The registration is placed on the **waiting list** with an assigned position
4. An **urgency assessment** may be conducted if special needs were indicated
5. When housing units become available, the **Allocation Engine** considers the registration

For the complete staff-side workflow, see **Document 04 — Admin Workflow: Housing Management**.

---

## 6. Error Handling

| Scenario | System Behavior |
|----------|----------------|
| Missing mandatory field | Form prevents navigation to next step |
| Missing mandatory document | Form prevents submission |
| Rate limit exceeded (>5/hour) | Error message displayed; retry after cooldown |
| Duplicate national ID | Existing person record is reused (not an error) |
| Reference number collision | System auto-retries with new reference number (transparent to user) |
| Network error during submission | Error message displayed; citizen can retry |
| Invalid file format | Upload rejected with format guidance |

---

## 7. Security Considerations

- All data is transmitted over HTTPS (encrypted in transit)
- Document uploads are stored in an isolated, access-controlled storage bucket
- The security token is hashed before storage — the system never stores the plain-text token
- Server-side validation prevents malformed or malicious data
- Rate limiting prevents abuse of the submission endpoint
- No personally identifiable information is logged in application logs

---

*End of Housing Registration Public Workflow*
