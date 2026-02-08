# DVH-IMS — Bug Reporting and Incident Handling

**Version:** V1.5 (Test & Stabilization)
**Audience:** All roles
**Status:** AS-IS operational reference — no new features

---

## 1. How to Report a Bug

When you encounter unexpected behavior, report it with the following information:

### Required Information

| Field | Description | Example |
|-------|-------------|---------|
| **Your Role** | The role you were logged in as | frontdesk_bouwsubsidie |
| **Page/Route** | The URL or page name | /control-queue |
| **Steps to Reproduce** | Exact sequence of actions | 1. Opened Control Queue 2. Clicked on case BS-2026-001 3. Clicked "Verify Document" |
| **Expected Result** | What should have happened | Document marked as verified |
| **Actual Result** | What actually happened | Error message: "Permission denied" |
| **Screenshot** | If applicable | Attach screenshot |
| **Date/Time** | When it occurred | 2026-02-08 14:30 |

---

## 2. Severity Classification

| Severity | Definition | Examples |
|----------|-----------|----------|
| **Critical** | System unusable, data integrity at risk | Login fails for all users; audit log not recording; data loss |
| **Major** | Core functionality broken for a role | Cannot verify documents; assignment creation fails; decision chain blocked |
| **Minor** | Non-blocking issue, cosmetic, or workaround exists | Misaligned text; filter not clearing; slow page load |

---

## 3. Authorized Fix Scope During Stabilization

The following fixes ARE authorized during the Test & Stabilization window:

✅ Functional defects (features not working as designed)
✅ UX defects (confusing or misleading interface behavior)
✅ Error handling improvements (better error messages, graceful failures)
✅ Performance issues (slow queries, unresponsive pages)
✅ RLS edge-case fixes (access control not working correctly)

The following are NOT authorized:

❌ New features or modules
❌ Workflow changes or new dossier states
❌ New roles or permissions
❌ Schema or structural changes
❌ Automation, notifications, or KPI tracking
❌ UI redesign or layout changes

---

## 4. Escalation Path

All bugs are reported to **Delroy** (project authority).

1. Report the bug with all required information
2. Delroy classifies severity and authorizes the fix
3. Fix is implemented and verified
4. Fix is documented separately from operational documentation

**Do NOT attempt to fix bugs yourself** by modifying data or workarounds outside the application.

---

## 5. What is NOT a Bug

The following are NOT bugs and should NOT be reported as such:

| Item | Why It's Not a Bug |
|------|-------------------|
| "I want a notification when X happens" | Feature request — not in scope |
| "Can we add a new role for Y?" | Scope expansion — not authorized |
| "The system should automatically do Z" | Automation request — not in scope |
| "I can't access another district's data" | Working as designed (district scoping) |
| "I can't delete an audit record" | Working as designed (immutable audit log) |
| "I can't change a finalized report" | Working as designed (report immutability) |
| "Assignments don't change the dossier status" | Working as designed (decoupled by design) |
