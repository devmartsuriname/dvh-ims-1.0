# VolksHuisvesting IMS – UX Public Wizard & Design Uniformity (EN)

**Status:** Definitive EN Version
**Alignment:** 1:1 derived from approved NL UX Flows (Sections 1-4)
**Principles:** Public-first, minister-proof simplicity, Darkone 1:1, Light Theme only

---

## 1. Public Entry – Landing Page (Wizard Hub)

### 1.1 Purpose
The public landing page is the **single entry point** for citizens. It must be simple, calm, and explanatory.

### 1.2 Available Actions
- Apply for **Construction Subsidy (Bouwsubsidie)**
- Register as **Housing Seeker**
- **Track application status**

### 1.3 UI Constraints (Hard)
- Darkone SCSS and Assets Library only
- Light Theme only
- No login, no accounts, no dashboards

---

## 2. Public Status Tracking (Citizen)

### 2.1 Access Method
Citizens track status using:
- Reference number (BS-YYYY-XXXX or WR-YYYY-XXXX)
- Secure access token

### 2.2 Information Shown
- Current status (citizen-friendly label)
- Last update date
- Next step (plain language)
- Contact information

### 2.3 Security Rules
- Token is mandatory
- No internal notes, scores, or documents exposed
- Rate limiting enforced

---

## 3. Public Wizard A – Construction Subsidy (Bouwsubsidie)

### Step 0 – Introduction
- Explanation of process
- No evaluation at the counter
- Acknowledgement only

### Step 1 – Personal Identification
- National ID number (required)
- Full name (required)
- Date of birth (optional)
- Gender (optional)

### Step 2 – Contact Information
- Phone number (required)
- Email address (optional)

### Step 3 – Household Information
- Household size
- Dependents (optional)

### Step 4 – Current Address
- Address line
- District (required)
- Ressort (optional)

### Step 5 – Application Context
- Reason for application (predefined options)
- Estimated required amount (optional)
- Calamity indicator (yes/no)

### Step 6 – Document Declaration
- Checklist of required documents
- Declaration of possession (yes/no per item)

### Step 7 – Review & Confirmation
- Summary of provided data
- Declaration of truthfulness

### Step 8 – Receipt
- Case reference number
- Status access token
- Next contact guidance

---

## 4. Public Wizard B – Housing Registration

### Step 0 – Introduction
- Explanation of waiting list and allocation model

### Step 1 – Personal Identification
- National ID number
- Full name
- Date of birth (optional)

### Step 2 – Contact Information
- Phone number (required)
- Email address (optional)

### Step 3 – Current Living Situation
- Current address
- District
- Type of housing
- Monthly rent (optional)
- Number of residents

### Step 4 – Housing Preference
- Interest type (rent / rent-to-own / purchase)
- Preferred district (required)

### Step 5 – Reason for Application
- Reason selection (e.g. overcrowding, unsafe housing, calamity)

### Step 6 – Income (Self-Declared)
- Income source
- Monthly income (applicant / partner)

### Step 7 – Special Needs / Urgency
- Disability (yes/no)
- Calamity or emergency (yes/no)

### Step 8 – Review & Confirmation
- Summary
- Declaration of truthfulness

### Step 9 – Registration Receipt
- Registration number
- Status access token

---

## 5. Design Uniformity Rules (Public Frontend)

### 5.1 Theme
- **Light Theme ONLY** for all public-facing pages
- Dark theme explicitly excluded from v1.0

### 5.2 Styling
- Darkone SCSS only
- Darkone Assets Library only
- No custom CSS frameworks
- No Bootstrap extensions
- No custom icon libraries

### 5.3 Typography & Layout
- Follow Darkone baseline typography
- Consistent spacing and alignment
- Mobile-responsive design required

### 5.4 Components
- Use only Darkone-approved components
- No external UI component libraries
- Wizard step indicators must be consistent

### 5.5 Copy & Language Rules
- Plain language
- No policy or legal jargon
- Clear expectations
- Citizen-friendly status labels

---

## 6. Dependencies

This document must remain aligned with:
- Master PRD (EN)
- Architecture & Security (EN)
- Database & RLS Specification (EN)

---

**End of UX Public Wizard & Design Uniformity (EN)**
