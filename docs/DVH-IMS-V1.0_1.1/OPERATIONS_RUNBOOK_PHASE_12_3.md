# Operations Runbook — Phase 12.3

**Created:** 2026-01-09  
**Phase:** 12.3 — Operational Readiness  
**Classification:** Government Grade — Internal Operations

---

## 1. Incident Response

### 1.1 Severity Levels

| Severity | Definition | Examples | Response Time |
|----------|------------|----------|---------------|
| **P1 - Critical** | System down, all users affected, data at risk | Database unreachable, auth failure for all, security breach | Immediate |
| **P2 - High** | Major feature broken, workaround may exist | Edge Function failures, RLS blocking valid users, storage inaccessible | 1 hour |
| **P3 - Medium** | Minor feature issue, limited user impact | Single wizard step error, UI rendering issues, slow queries | 4 hours |
| **P4 - Low** | Cosmetic, non-blocking, enhancement requests | Typos, minor alignment issues, non-critical warnings | Next business day |

### 1.2 Escalation Path

```
Level 1: Technical Lead
    ↓ (if unresolved in 30 min for P1, 2 hours for P2)
Level 2: Delroy (DEVMART) — Final Authority
    ↓ (if infrastructure/Supabase issue)
Level 3: Supabase Support (Pro tier required)
```

### 1.3 Contact Information

| Role | Contact | Availability |
|------|---------|--------------|
| Final Authority | Delroy (DEVMART) | 24/7 for P1 |
| Technical Support | info@devmart.sr | Business hours |
| Supabase Support | support@supabase.com | Pro tier required |

---

## 2. Rollback Procedure

### 2.1 Rollback Decision Criteria

Rollback is authorized when ANY of the following occur:
- P1 incident lasting > 30 minutes without resolution
- Confirmed data integrity compromise
- Confirmed security breach
- Failed deployment causing system instability
- **Authorization Required:** Delroy only

### 2.2 Rollback Steps

```
1. HALT     → Immediately stop all user operations
2. ASSESS   → Identify incident scope and last known good state
3. SELECT   → Choose appropriate restore point
4. BACKUP   → Export current state for forensics (if safe)
5. RESTORE  → Execute database restore from backup
6. REDEPLOY → Deploy previous Edge Function versions from Git
7. VERIFY   → Confirm RLS policies active, test critical paths
8. AUDIT    → Log rollback event with full details
9. RESUME   → Restore user access after verification
10. REPORT  → Document incident and resolution
```

### 2.3 Available Restore Points

| Restore Point | Date | Phase | Contents |
|---------------|------|-------|----------|
| PHASE-12-2-COMPLETE | 2026-01-09 | 12.2 | Access Control Evidence |
| PHASE-12-1-COMPLETE | 2026-01-09 | 12.1 | Security Hygiene |
| PHASE-11-COMPLETE | 2026-01-08 | 11 | RBAC & District Access |
| PHASE-10-COMPLETE | 2026-01-08 | 10 | Raadvoorstel Generation |
| PHASE-9-COMPLETE | 2026-01-07 | 9 | Public Wizard Integration |
| Earlier phases | Various | 0-8 | Archived |

---

## 3. Key and Secret Rotation

### 3.1 Secrets Inventory

| Secret Name | Purpose | Location | Sensitivity |
|-------------|---------|----------|-------------|
| SUPABASE_URL | API endpoint | Supabase Dashboard | Low (public) |
| SUPABASE_ANON_KEY | Public client access | Supabase Dashboard | Medium |
| SUPABASE_SERVICE_ROLE_KEY | Admin operations | Supabase Dashboard | **Critical** |
| SUPABASE_DB_URL | Direct DB connection | Supabase Dashboard | **Critical** |
| SUPABASE_PUBLISHABLE_KEY | Client-side access | Supabase Dashboard | Low (public) |

### 3.2 Rotation Procedure

**When to Rotate:**
- Scheduled: Annually (minimum)
- Immediate: On suspected or confirmed compromise
- Immediate: Personnel change with access

**Rotation Steps:**
```
1. Generate new keys via Supabase Dashboard → Settings → API
2. Update environment variables in Lovable Cloud deployment
3. Redeploy all Edge Functions
4. Test critical functionality:
   - User authentication
   - Database read/write
   - Edge Function calls
   - Storage access
5. Revoke old keys (only after confirming new keys work)
6. Log rotation event to audit_event table
7. Update documentation if key format changed
```

### 3.3 Supabase Pro Upgrade Note

**IMPORTANT:** Before Go-Live, upgrade to Supabase Pro tier to enable:
- Leaked Password Protection
- Point-in-time Recovery (PITR)
- Enhanced support SLA
- Daily automated backups with 7-day retention

---

## 4. Storage Access and Retention

### 4.1 Storage Bucket: generated-documents

| Property | Value |
|----------|-------|
| **Bucket Name** | generated-documents |
| **Visibility** | Private |
| **Purpose** | Store generated Raadvoorstel DOCX files |
| **Access Method** | Signed URLs (time-limited) |

### 4.2 Access Control

| Operation | Allowed Roles | Mechanism |
|-----------|---------------|-----------|
| Upload | Edge Function (service role) | System-only via generate-raadvoorstel |
| Download | system_admin, minister, project_leader, frontdesk_bouwsubsidie, admin_staff, audit | Signed URL via get-document-download-url |
| Delete | **PROHIBITED** | RLS policy blocks deletion |
| List | Authorized roles only | RLS policy |

### 4.3 Retention Rules

| Rule | Policy | Rationale |
|------|--------|-----------|
| Retention Period | **Permanent** | Council proposals are legal documents |
| Deletion | **Prohibited** | Audit requirement — immutable record |
| Modification | **Prohibited** | Document integrity requirement |
| Backup | Included in Supabase storage | Automatic |

---

## 5. Maintenance and Change Control

### 5.1 Change Control Process

**ALL changes must follow this process:**

```
1. AUTHORIZATION  → Explicit approval from Delroy required
2. ALIGNMENT      → Verify change aligns with phase documentation
3. BASELINE       → Confirm current restore point
4. EXECUTE        → Implement change per approved scope
5. VERIFY         → Test affected functionality
6. DOCUMENT       → Create new restore point
7. REPORT         → Submit execution report
8. STOP           → Await next authorization
```

**Prohibited Actions (without explicit authorization):**
- Phase skipping
- Scope expansion
- Self-initiated fixes
- Speculative features
- Architecture changes

### 5.2 Maintenance Windows

| Type | Window | Notice Required |
|------|--------|-----------------|
| Scheduled | Weekends 02:00-06:00 UTC | 48 hours |
| Emergency | Any time | None (P1/P2 only) |
| Supabase Platform | Supabase-controlled | Supabase notification |

### 5.3 Pre-Maintenance Checklist

- [ ] Explicit authorization obtained
- [ ] Restore point created
- [ ] Affected users notified (if applicable)
- [ ] Rollback procedure reviewed
- [ ] Verification tests prepared

### 5.4 Post-Maintenance Checklist

- [ ] All critical paths verified
- [ ] RLS policies confirmed active
- [ ] Edge Functions responding
- [ ] Storage accessible
- [ ] New restore point created
- [ ] Execution report submitted

---

## 6. Emergency Contacts Quick Reference

```
┌─────────────────────────────────────────────────┐
│  P1 CRITICAL INCIDENT                           │
│  1. Delroy (DEVMART) — Final Authority          │
│  2. Supabase Support (Pro tier)                 │
│                                                 │
│  P2-P4 INCIDENTS                                │
│  1. Technical Lead                              │
│  2. info@devmart.sr                             │
└─────────────────────────────────────────────────┘
```

---

## Cross-References

- Phase 12 Specification: `phases/PHASE-12-Final-Hardening-and-Go-Live.md`
- Architecture & Security: `docs/Architecture_Security.md`
- Backend Documentation: `docs/Backend.md`
- Security Hygiene: `docs/SECURITY_HYGIENE_SUMMARY_PHASE_12_1.md`
- RBAC Evidence: `docs/RBAC_EVIDENCE_MATRIX_PHASE_12_2.md`

---

**Document Status:** FINAL  
**Review Required:** Before Go-Live
