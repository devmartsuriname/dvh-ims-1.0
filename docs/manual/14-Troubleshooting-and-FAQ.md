# DVH-IMS — Troubleshooting and FAQ

**Document:** 14 — Troubleshooting and FAQ
**Version:** V1.7
**Classification:** Official — For Ministerial Review
**Date:** March 2026

---

## 1. Public User (Citizen) Issues

### Q: I lost my reference number or security token. How do I retrieve it?

**A:** The security token is shown **only once** at submission. It cannot be retrieved. If lost, the citizen must contact the Directoraat Volkshuisvesting directly for assistance. Staff with appropriate access can look up the case by national ID in the admin interface.

---

### Q: I get an error when trying to submit my application.

**A:** Common causes:
| Cause | Solution |
|-------|----------|
| Missing mandatory field | Complete all required fields (marked with *) |
| Missing mandatory document | Upload all required documents before submitting |
| Rate limit exceeded | Wait at least 1 hour before retrying (max 5 submissions/hour) |
| Network error | Check internet connection and retry |
| Invalid file format | Upload documents as PDF, JPEG, or PNG only |

---

### Q: I submitted my application twice by accident. What happens?

**A:** The system handles duplicate submissions gracefully:
- If the same national ID is used, the existing **person** record is reused (no duplicate person created)
- A **new** case/registration is created for each submission
- Staff will see both submissions and can identify duplicates during review
- Contact the Directoraat if you need assistance with duplicate submissions

---

### Q: The status tracker says "Not Found" when I enter my reference number.

**A:** Possible causes:
- Reference number entered incorrectly (check for typos)
- Security token entered incorrectly
- Case numbers use format `BS-YYYYMMDD-XXXX` (Subsidy) or `WR-YYYYMMDD-XXXX` (Housing)
- Ensure you are entering the token exactly as shown at submission (case-sensitive)

---

### Q: Can I edit my application after submission?

**A:** No. Once submitted, the application cannot be modified by the citizen. If corrections are needed, contact the Directoraat Volkshuisvesting.

---

## 2. Staff (Admin) Issues

### Q: I cannot see any cases/registrations in my list.

**A:** Possible causes:
| Cause | Solution |
|-------|----------|
| No role assigned | Contact system_admin to verify your role assignment |
| Wrong district | Your `district_code` in the profile may not match the data |
| Filter active | Check if an active filter is hiding records |
| No submissions yet | No applications have been submitted for your district |

---

### Q: I get "Permission Denied" when trying to perform an action.

**A:** Your role does not have authority for that action. Refer to **Document 06 — Roles & Permission Matrix** to verify which roles can perform which actions. If you believe your access is incorrect, contact the system administrator.

---

### Q: I cannot change the status of a case.

**A:** Possible causes:
- The case is not at the correct workflow step for your role
- The Bouwsubsidie decision chain enforces sequential steps — you cannot skip ahead
- A mandatory reason field may be empty
- Another step may need to be completed first (e.g., reports must be finalized before advancing)

---

### Q: A document is marked as "not verified" but I already verified it.

**A:** The verification may not have been saved successfully. Try verifying again. If the issue persists, check the audit log for the verification event to confirm whether it was recorded. Contact the system administrator if the problem continues.

---

### Q: I cannot assign a worker to a case.

**A:** Only `system_admin` and `project_leader` roles can create or modify case assignments. If you have one of these roles and still cannot assign, ensure:
- The target worker has an active profile (`is_active = true`)
- The target worker has the appropriate role
- You have provided a mandatory reason for the assignment

---

### Q: The system seems slow or unresponsive.

**A:** 
- Try refreshing the page (Ctrl+F5 for hard refresh)
- Clear browser cache
- Check internet connection
- If the issue persists across multiple users, it may be a system-level issue — contact the system administrator

---

### Q: I accidentally changed a status. Can I undo it?

**A:** Status changes are permanent and audit-logged. They cannot be undone through the interface. The decision chain may allow a "return" action at certain steps, which sends the case back to a previous step. Contact the system administrator or project leader for guidance.

---

## 3. Session and Authentication Issues

### Q: My session expired and I was logged out.

**A:** Sessions have a limited duration for security. Log in again at https://volkshuisvesting.sr/auth/sign-in. Any unsaved work in open forms may be lost.

---

### Q: I forgot my password.

**A:** Use the password reset functionality on the login page, or contact the system administrator to reset your password.

---

### Q: I can log in but cannot access any modules.

**A:** Your account exists but may not have any roles assigned. Contact the system administrator to verify and assign appropriate roles.

---

## 4. System Limitations

### Q: Does the system send email notifications?

**A:** No. Email, SMS, and push notifications are not implemented in the current version. All actions require manual initiation.

---

### Q: Is there a mobile app?

**A:** No. DVH-IMS is a web application accessible via modern browsers on desktop and mobile devices. There is no dedicated mobile application.

---

### Q: Can the system generate reports or export data?

**A:** The system generates the Raadvoorstel (council document) for approved subsidy cases. General data export or report generation functionality is not available in the current version.

---

### Q: Can citizens create accounts?

**A:** No. The public interface operates anonymously. Citizens do not create accounts or log in. They track their application status using the reference number and security token provided at submission.

---

*End of Troubleshooting and FAQ*
