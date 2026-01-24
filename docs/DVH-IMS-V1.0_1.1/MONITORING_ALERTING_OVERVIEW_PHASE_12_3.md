# Monitoring and Alerting Overview — Phase 12.3

**Created:** 2026-01-09  
**Phase:** 12.3 — Operational Readiness  
**Classification:** Government Grade — Operational Baseline

---

## 1. Current Monitoring Signals

### 1.1 Database Logs (postgres_logs)

| Signal | Description | Severity Levels |
|--------|-------------|-----------------|
| Connection events | User/service connections | LOG, INFO |
| Authentication failures | Failed DB auth attempts | WARNING, ERROR |
| Query errors | SQL syntax/execution errors | ERROR |
| RLS violations | Permission denied (implicit) | ERROR |
| Slow queries | Queries exceeding threshold | WARNING |
| Deadlocks | Transaction conflicts | ERROR |

**Access:** Supabase Dashboard → Logs → Postgres

### 1.2 Auth Logs (auth_logs)

| Signal | Description | Severity Levels |
|--------|-------------|-----------------|
| Login success | Successful authentication | INFO |
| Login failure | Failed authentication attempts | WARNING |
| Logout events | User session termination | INFO |
| Token validation | JWT validation results | INFO, ERROR |
| Password reset | Reset flow events | INFO |
| Session management | Session create/refresh/expire | INFO |

**Access:** Supabase Dashboard → Logs → Auth

### 1.3 Edge Function Logs (function_edge_logs)

| Signal | Description | Metrics |
|--------|-------------|---------|
| HTTP status codes | Response status | 2xx, 4xx, 5xx |
| Execution time | Function duration | Milliseconds |
| Error messages | Runtime errors | Error text |
| Request method | HTTP method | GET, POST, etc. |
| Deployment ID | Version tracking | UUID |

**Access:** Supabase Dashboard → Edge Functions → [Function] → Logs

### 1.4 Application Logs (Client-Side)

| Signal | Description | Location |
|--------|-------------|----------|
| React errors | Component render failures | Browser console |
| Network failures | API call errors | Browser DevTools |
| Error boundaries | Caught React errors | Application UI |
| Console errors | Runtime JavaScript errors | Browser console |

**Access:** Lovable Preview → Browser DevTools → Console

### 1.5 Audit Trail (audit_event table)

| Signal | Description | Access |
|--------|-------------|--------|
| Status changes | Case/registration state transitions | DB query (authorized roles) |
| Document generation | Raadvoorstel creation events | DB query (authorized roles) |
| Public submissions | Wizard completion events | DB query (authorized roles) |
| User actions | Administrative operations | DB query (audit role) |

**Access:** Direct DB query with appropriate role

---

## 2. Alert Thresholds (Baseline)

### 2.1 Critical Alerts (P1)

| Signal | Threshold | Action |
|--------|-----------|--------|
| Database ERROR (unexpected) | Any occurrence | Immediate investigation |
| RLS policy denial (unexpected) | Any for valid user | Security review |
| Edge Function 5xx rate | > 10% of requests | Service review |
| Authentication system failure | Any | Immediate escalation |
| Storage access failure | Any | Service review |

### 2.2 High Alerts (P2)

| Signal | Threshold | Action |
|--------|-----------|--------|
| Edge Function 5xx | > 5 per hour | Investigation within 1 hour |
| Database connection failures | > 3 per hour | Connection pool review |
| Auth failure spike | > 20 per hour | Security review |
| Slow query warnings | > 10 per hour | Query optimization review |

### 2.3 Medium Alerts (P3)

| Signal | Threshold | Action |
|--------|-----------|--------|
| Edge Function timeout | > 10 seconds | Performance review |
| Auth failure rate | > 10 per minute | Rate limiting check |
| Client-side errors | > 5 unique per hour | Bug investigation |
| API 4xx responses | > 20% of requests | Input validation review |

### 2.4 Low Alerts (P4)

| Signal | Threshold | Action |
|--------|-----------|--------|
| Deprecation warnings | Any | Scheduled review |
| Non-critical console errors | Accumulation | Next maintenance window |
| Minor UI errors | User reports | Backlog addition |

---

## 3. Log Locations and Access

### 3.1 Log Location Matrix

| Log Type | Location | Access Method | Retention |
|----------|----------|---------------|-----------|
| Postgres logs | Supabase Dashboard | Web UI / API | 7 days (Free), 30 days (Pro) |
| Auth logs | Supabase Dashboard | Web UI / API | 7 days (Free), 30 days (Pro) |
| Edge Function logs | Supabase Dashboard | Web UI / API | 7 days (Free), 30 days (Pro) |
| Application logs | Browser DevTools | Client-side | Session only |
| Audit events | audit_event table | SQL query | Permanent |
| Deployment logs | Lovable Dashboard | Web UI | Per deployment |

### 3.2 Log Query Examples

**Postgres Errors (Last 24h):**
```sql
SELECT 
  postgres_logs.timestamp,
  event_message,
  parsed.error_severity
FROM postgres_logs
  CROSS JOIN UNNEST(metadata) AS m
  CROSS JOIN UNNEST(m.parsed) AS parsed
WHERE parsed.error_severity IN ('ERROR', 'FATAL', 'PANIC')
ORDER BY timestamp DESC
LIMIT 100
```

**Auth Failures (Last 24h):**
```sql
SELECT 
  auth_logs.timestamp,
  event_message,
  metadata.status,
  metadata.path
FROM auth_logs
  CROSS JOIN UNNEST(metadata) AS metadata
WHERE metadata.status >= 400
ORDER BY timestamp DESC
LIMIT 100
```

**Edge Function Errors (Last 24h):**
```sql
SELECT 
  function_edge_logs.timestamp,
  event_message,
  response.status_code,
  m.execution_time_ms
FROM function_edge_logs
  CROSS JOIN UNNEST(metadata) AS m
  CROSS JOIN UNNEST(m.response) AS response
WHERE response.status_code >= 500
ORDER BY timestamp DESC
LIMIT 100
```

---

## 4. Review Cadence

### 4.1 Review Schedule

| Log Type | Cadence | Reviewer | Focus |
|----------|---------|----------|-------|
| Postgres logs | Daily | Technical Lead | Errors, slow queries |
| Auth logs | Daily | Technical Lead | Failed logins, anomalies |
| Edge Function logs | Per incident | Developer | Errors, timeouts |
| Audit events | Weekly | Admin/Audit role | Compliance, unusual patterns |
| Application errors | Per incident | Developer | User-reported issues |

### 4.2 Weekly Review Checklist

- [ ] Review Postgres error logs for patterns
- [ ] Check auth failure rates for anomalies
- [ ] Verify Edge Function success rates
- [ ] Review audit_event for compliance
- [ ] Check storage access patterns
- [ ] Document any findings

### 4.3 Monthly Review Checklist

- [ ] Trend analysis of error rates
- [ ] Performance baseline comparison
- [ ] Security incident review
- [ ] Backup verification
- [ ] Capacity planning check

---

## 5. Current Monitoring Status

### 5.1 Database Health (As of 2026-01-09)

| Metric | Status | Notes |
|--------|--------|-------|
| Connection | ✅ Healthy | Active connection verified |
| Recent Errors | ✅ None | No ERROR/FATAL/PANIC in recent logs |
| Table Accessibility | ✅ All 24 tables | Verified via restore test |
| RLS Policies | ✅ 65 active | Linter confirmed |

### 5.2 Auth Health (As of 2026-01-09)

| Metric | Status | Notes |
|--------|--------|-------|
| Recent Logins | ✅ Normal | info@devmart.sr active |
| Failed Attempts | ✅ None unusual | No suspicious activity |
| Active Sessions | ✅ Normal | 1 authenticated user |

### 5.3 Edge Functions Health (As of 2026-01-09)

| Function | Status | Recent Activity |
|----------|--------|-----------------|
| execute-allocation-run | ✅ Deployed | No recent calls |
| generate-raadvoorstel | ✅ Deployed | No recent calls |
| get-document-download-url | ✅ Deployed | No recent calls |
| public-housing-registration | ✅ Deployed | No recent calls |
| public-status-lookup | ✅ Deployed | No recent calls |
| public-subsidy-submission | ✅ Deployed | No recent calls |

### 5.4 Storage Health (As of 2026-01-09)

| Bucket | Status | Objects |
|--------|--------|---------|
| generated-documents | ✅ Accessible | 0 (no documents generated yet) |

---

## 6. Future Monitoring Enhancements (Post-Go-Live)

### 6.1 Recommended Additions

| Enhancement | Priority | Prerequisite |
|-------------|----------|--------------|
| External uptime monitoring | High | Third-party service |
| Alert notification (email/SMS) | High | Supabase Pro + integration |
| Dashboard visualization | Medium | Grafana/similar |
| Log aggregation | Medium | External service |
| Performance APM | Low | Third-party service |

### 6.2 Supabase Pro Benefits for Monitoring

| Feature | Benefit |
|---------|---------|
| Extended log retention | 30 days vs 7 days |
| Log exports | External storage/analysis |
| Priority support | Faster incident response |
| Advanced metrics | Detailed performance data |

---

## 7. Incident Response Integration

### 7.1 Alert to Incident Flow

```
ALERT TRIGGERED
      ↓
ASSESS SEVERITY (P1-P4)
      ↓
LOG INCIDENT
      ↓
INVESTIGATE (check relevant logs)
      ↓
ESCALATE (if required per Operations Runbook)
      ↓
RESOLVE
      ↓
POST-INCIDENT REVIEW
      ↓
UPDATE MONITORING (if gaps found)
```

### 7.2 Log Investigation Priority

| Incident Type | Primary Log | Secondary Logs |
|---------------|-------------|----------------|
| Login issues | Auth logs | Postgres logs |
| Data access denied | Postgres logs | Auth logs, audit_event |
| Edge Function failure | Edge Function logs | Postgres logs |
| Document generation | Edge Function logs | audit_event |
| Public submission | Edge Function logs | Postgres logs, audit_event |

---

## Cross-References

- Operations Runbook: `docs/OPERATIONS_RUNBOOK_PHASE_12_3.md`
- Backup & Restore Evidence: `docs/BACKUP_RESTORE_EVIDENCE_PHASE_12_3.md`
- Security Hygiene: `docs/SECURITY_HYGIENE_SUMMARY_PHASE_12_1.md`
- Backend Documentation: `docs/Backend.md`

---

**Document Status:** FINAL  
**Baseline Date:** 2026-01-09  
**Review Required:** Before Go-Live
