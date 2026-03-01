# DVH-IMS — Public Workflow: Subsidy Application (Bouwsubsidie)

**Document:** 03 — Frontend Workflow: Subsidy Application (Bouwsubsidie)
**Version:** V1.7
**Classification:** Official — For Ministerial Review
**Date:** March 2026

> **Note on screenshots:** Screenshot references (e.g., `[Screenshot: ...]`) indicate where annotated, PII-masked screenshots will be inserted during the visual documentation pass.

---

## 1. Overview

Citizens who need financial support for housing construction or improvement can apply for a Construction Subsidy (Bouwsubsidie) through a 7-step online wizard. No login or account is required. Upon completion, the citizen receives a reference number and security token to track their application status.

**URL:** https://volkshuisvesting.sr/bouwsubsidie/apply

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
| Date of Birth | Date of birth | ✅ Yes |
| Gender | Male / Female | ✅ Yes |

[Screenshot: Subsidy Wizard — Step 1 Personal Identification]

### Step 2 — Contact Information

| Field | Description | Required |
|-------|------------|----------|
| Phone Number | Contact telephone number | ✅ Yes |
| Email | Email address | ✅ Yes |

[Screenshot: Subsidy Wizard — Step 2 Contact Information]

### Step 3 — Household Information

| Field | Description | Required |
|-------|------------|----------|
| Household Size | Total number of persons in household | ✅ Yes |
| Dependents | Number of dependents | ✅ Yes |

[Screenshot: Subsidy Wizard — Step 3 Household Information]

### Step 4 — Current Address

| Field | Description | Required |
|-------|------------|----------|
| Address Line 1 | Street address | ✅ Yes |
| District | Residential district | ✅ Yes |
| Ressort | Administrative subdivision within district | ✅ Yes |

[Screenshot: Subsidy Wizard — Step 4 Current Address]

### Step 5 — Application Context

| Field | Description | Required |
|-------|------------|----------|
| Application Reason | Free-text explanation of construction/improvement need | ✅ Yes |
| Estimated Amount | Estimated cost of construction/improvement (SRD) | ✅ Yes |
| Is Calamity | Whether the application is due to a disaster/calamity | ✅ Yes |

[Screenshot: Subsidy Wizard — Step 5 Application Context]

### Step 6 — Document Uploads

Citizens must upload supporting documents. The system displays the full requirements list with mandatory/optional indicators.

**Required Documents (Mandatory):**

| Document | Code |
|----------|------|
| Copy of ID | ID_COPY |
| Inkomensverklaring (AOV/loonstrook) | INCOME_DECLARATION |
| Land Title / Deed | LAND_TITLE |
| Bank Statement | BANK_STATEMENT |
| Household Composition | HOUSEHOLD_COMPOSITION |

**Optional Documents:**

| Document | Code |
|----------|------|
| CBB uittreksel / Nationaliteit verklaring | CBB_EXTRACT |
| Gezinuittreksel | FAMILY_EXTRACT |

- Accepted file types: PDF, JPEG, PNG
- Files are uploaded to secure cloud storage
- Each file is tagged with a timestamp and linked to the case

[Screenshot: Subsidy Wizard — Step 6 Document Uploads]

### Step 7 — Review and Declaration

The citizen reviews all entered information across all steps. A declaration checkbox must be accepted before submission.

| Element | Description |
|---------|------------|
| Summary | All entered data displayed for review |
| Declaration | "I hereby declare that all information provided is truthful and complete" |
| Submit Button | Submits the application (disabled until declaration is accepted) |

[Screenshot: Subsidy Wizard — Step 7 Review and Declaration]

---

## 4. What Happens After Submission

### 4.1 Immediate Response

Upon successful submission, the system:

1. Creates a **Person** record (or reuses an existing person with the same national ID)
2. Creates a **Household** record with the applicant as primary person
3. Creates a **Subsidy Case** record with status `SUBMITTED`
4. Creates an **Address** record linked to the household
5. Stores all uploaded **documents** in secure storage
6. Generates a unique **case number** (format: `BS-YYYYMMDD-XXXX`)
7. Generates a **security token** (random, hashed with SHA-256 before storage)
8. Creates an **audit event** recording the submission
9. Creates a **public status access** record for status tracking

### 4.2 Confirmation Page

The citizen sees:
- ✅ Success message
- 📋 Case number (e.g., `BS-20260301-0015`)
- 🔑 Security token (displayed once — citizen must save it)
- ℹ️ Instructions to save both values for future status tracking

**Important:** The security token is shown only once. It cannot be retrieved later.

[Screenshot: Subsidy Wizard — Confirmation Page]

### 4.3 Status Tracking

Citizens can check their application status at:
**https://volkshuisvesting.sr/status**

Required inputs:
- Case number (reference number)
- Security token

The system verifies the token against the stored hash and displays the current status and history if valid.

---

## 5. What Happens Next (Staff Side)

After citizen submission, the application enters the **8-step mandatory decision chain**:

| Step | Role | What Happens |
|------|------|-------------|
| 1 | Frontdesk | Reviews application, verifies documents |
| 2 | Social Field Worker | Conducts social assessment visit, submits report |
| 3 | Technical Inspector | Conducts technical inspection, submits report |
| 4 | Administrative Staff | Reviews administrative completeness |
| 5 | Project Leader | Reviews policy compliance |
| 6 | Director | Provides organizational approval |
| 7 | Ministerial Advisor | Provides formal recommendation (paraaf) |
| 8 | Minister | Makes final decision (approve or return) |

No step can be skipped. The system enforces sequential execution.

For the complete staff-side workflow, see **Document 05 — Admin Workflow: Subsidy Management**.

---

## 6. Error Handling

| Scenario | System Behavior |
|----------|----------------|
| Missing mandatory field | Form prevents navigation to next step |
| Missing mandatory document | Form prevents submission |
| Rate limit exceeded (>5/hour) | Error message displayed; retry after cooldown |
| Duplicate national ID | Existing person record is reused (not an error) |
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

*End of Subsidy Application Public Workflow*
