# DVH-IMS V1.3 — PHASE 5B PUBLIC NL COVERAGE REPORT

**Date:** 2026-02-01  
**Phase:** V1.3 Phase 5B — Full Public NL Standardization  
**Status:** ✅ COMPLETE

---

## EXECUTIVE SUMMARY

All public-facing pages now default to Dutch (NL) with English (EN) available via language switcher.

---

## PAGE-BY-PAGE NL COVERAGE

### 1. Landing Page (`/`)

| Element | NL Key | Status |
|---------|--------|--------|
| Hero Title | `landing.heroTitle` | ✅ |
| Hero Description | `landing.heroDescription` | ✅ |
| Services Title | `landing.servicesTitle` | ✅ |
| Services Subtitle | `landing.servicesSubtitle` | ✅ |
| Bouwsubsidie Card Title | `landing.bouwsubsidie.title` | ✅ |
| Bouwsubsidie Card Description | `landing.bouwsubsidie.description` | ✅ |
| Bouwsubsidie Button | `landing.bouwsubsidie.button` | ✅ |
| Housing Card Title | `landing.housing.title` | ✅ |
| Housing Card Description | `landing.housing.description` | ✅ |
| Housing Button | `landing.housing.button` | ✅ |
| Status Card Title | `landing.status.title` | ✅ |
| Status Card Description | `landing.status.description` | ✅ |
| Status Button | `landing.status.button` | ✅ |

**Coverage: 13/13 elements (100%)**

---

### 2. Housing Registration Wizard (`/housing/register`)

#### 2.1 Wizard Page
| Element | NL Key | Status |
|---------|--------|--------|
| Page Title | `housing.title` | ✅ |
| Step Titles (10 steps) | `housing.steps.*` | ✅ |
| Error Messages | `housing.errors.*` | ✅ |

#### 2.2 Step 0 — Introduction
| Element | NL Key | Status |
|---------|--------|--------|
| Title | `housing.step0.title` | ✅ |
| Description | `housing.step0.description` | ✅ |
| Requirements List | `housing.step0.requirements.*` | ✅ |
| Start Button | `housing.step0.startButton` | ✅ |

#### 2.3 Step 1 — Personal Information
| Element | NL Key | Status |
|---------|--------|--------|
| Title | `housing.step1.title` | ✅ |
| First Name Label | `housing.step1.firstName` | ✅ |
| Last Name Label | `housing.step1.lastName` | ✅ |
| National ID Label | `housing.step1.nationalId` | ✅ |
| Date of Birth Label | `housing.step1.dateOfBirth` | ✅ |
| Gender Label | `housing.step1.gender` | ✅ |
| Gender Options | `housing.gender.*` | ✅ |

#### 2.4 Step 2 — Contact Information
| Element | NL Key | Status |
|---------|--------|--------|
| Title | `housing.step2.title` | ✅ |
| Phone Number Label | `housing.step2.phoneNumber` | ✅ |
| Email Label | `housing.step2.email` | ✅ |
| Address Label | `housing.step2.address` | ✅ |

#### 2.5 Step 3 — Living Situation
| Element | NL Key | Status |
|---------|--------|--------|
| Title | `housing.step3.title` | ✅ |
| Current Housing Label | `housing.step3.currentHousing` | ✅ |
| Household Size Label | `housing.step3.householdSize` | ✅ |
| Years at Address Label | `housing.step3.yearsAtAddress` | ✅ |
| Living Situation Options | `housing.livingSituations.*` | ✅ |

#### 2.6 Step 4 — Housing Preference
| Element | NL Key | Status |
|---------|--------|--------|
| Title | `housing.step4.title` | ✅ |
| Housing Type Label | `housing.step4.housingType` | ✅ |
| District Label | `housing.step4.district` | ✅ |
| Housing Type Options | `housing.housingTypes.*` | ✅ |
| District Options | `bouwsubsidie.districts.*` | ✅ |

#### 2.7 Step 5 — Reason for Application
| Element | NL Key | Status |
|---------|--------|--------|
| Title | `housing.step5.title` | ✅ |
| Reason Label | `housing.step5.reason` | ✅ |
| Additional Info Label | `housing.step5.additionalInfo` | ✅ |
| Reason Options | `housing.reasons.*` | ✅ |

#### 2.8 Step 6 — Income Information
| Element | NL Key | Status |
|---------|--------|--------|
| Title | `housing.step6.title` | ✅ |
| Income Source Label | `housing.step6.incomeSource` | ✅ |
| Monthly Income Label | `housing.step6.monthlyIncome` | ✅ |
| Income Source Options | `housing.incomeSources.*` | ✅ |

#### 2.9 Step 7 — Urgency Assessment
| Element | NL Key | Status |
|---------|--------|--------|
| Title | `housing.step7.title` | ✅ |
| Urgency Factors | `housing.step7.urgencyFactors.*` | ✅ |
| Medical Needs Label | `housing.step7.medicalNeeds` | ✅ |
| Safety Concerns Label | `housing.step7.safetyConcerns` | ✅ |

#### 2.10 Step 8 — Review
| Element | NL Key | Status |
|---------|--------|--------|
| Title | `housing.step8.title` | ✅ |
| Section Headers | `housing.step8.sections.*` | ✅ |
| Edit Buttons | `housing.step8.edit` | ✅ |
| Submit Button | `housing.step8.submit` | ✅ |
| Declaration Text | `housing.step8.declaration` | ✅ |

#### 2.11 Step 9 — Receipt
| Element | NL Key | Status |
|---------|--------|--------|
| Success Title | `housing.step9.successTitle` | ✅ |
| Success Message | `housing.step9.successMessage` | ✅ |
| Reference Number Label | `housing.step9.referenceNumber` | ✅ |
| Access Token Label | `housing.step9.accessToken` | ✅ |
| Next Steps | `housing.step9.nextSteps.*` | ✅ |
| Print Button | `housing.step9.printButton` | ✅ |
| Home Button | `housing.step9.homeButton` | ✅ |

**Housing Wizard Coverage: 100+ elements (100%)**

---

### 3. Status Tracker (`/status`)

#### 3.1 Status Page
| Element | NL Key | Status |
|---------|--------|--------|
| Page Title | `status.title` | ✅ |
| Page Description | `status.description` | ✅ |
| Error Messages | `status.errors.*` | ✅ |

#### 3.2 StatusForm Component
| Element | NL Key | Status |
|---------|--------|--------|
| Reference Number Label | `status.form.referenceNumber` | ✅ |
| Access Token Label | `status.form.accessToken` | ✅ |
| Submit Button | `status.form.submit` | ✅ |
| Validation Messages | `status.form.validation.*` | ✅ |

#### 3.3 StatusResult Component
| Element | NL Key | Status |
|---------|--------|--------|
| Current Status Label | `status.result.currentStatus` | ✅ |
| Submitted Date Label | `status.result.submittedDate` | ✅ |
| Applicant Name Label | `status.result.applicantName` | ✅ |
| Application Type Label | `status.result.applicationType` | ✅ |
| Status Labels | `status.statuses.*` | ✅ |

#### 3.4 StatusTimeline Component
| Element | NL Key | Status |
|---------|--------|--------|
| Timeline Title | `status.timeline.title` | ✅ |
| Date Formatting | Locale-aware (nl-NL) | ✅ |
| Status Descriptions | `status.statuses.*` | ✅ |

**Status Tracker Coverage: 25+ elements (100%)**

---

### 4. Public Footer

| Element | NL Key | Status |
|---------|--------|--------|
| Copyright Text | `footer.copyright` | ✅ |
| Version Text | `footer.version` | ✅ |

**Footer Coverage: 2/2 elements (100%)**

---

## DEFAULT LANGUAGE CONFIRMATION

| Setting | Value | Status |
|---------|-------|--------|
| i18n fallbackLng | `nl` | ✅ |
| i18n lng | `nl` | ✅ |
| First Load Language | Dutch (NL) | ✅ |
| Language Switcher | Available | ✅ |
| Session Persistence | Enabled | ✅ |

---

## SUMMARY

| Page/Component | Total Elements | Localized | Coverage |
|----------------|----------------|-----------|----------|
| Landing Page | 13 | 13 | 100% |
| Housing Wizard | 100+ | 100+ | 100% |
| Status Tracker | 25+ | 25+ | 100% |
| Public Footer | 2 | 2 | 100% |
| **TOTAL** | **140+** | **140+** | **100%** |

---

**END OF COVERAGE REPORT**
