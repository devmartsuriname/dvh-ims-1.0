# DVH-IMS Monitoring & Alerts Configuration

**Phase 8D — v1.8**
**Date:** 2026-03-08

---

## 1. Architecture Overview

```
Frontend (React)                 Edge Functions (Deno)
    │                                  │
    ├─ Sentry Browser SDK             ├─ Structured JSON logs (console)
    │   (conditional on DSN)          ├─ Conditional Sentry HTTP forwarding
    │                                  │
    └─► Sentry Dashboard ◄────────────┘
                │
                ├─ Error Spike alerts
                ├─ DB Failure alerts
                └─ New Issue alerts

External Uptime Monitor (BetterStack/UptimeRobot)
    │
    └─► health-check endpoint (60s interval)
    └─► lookup-public-status OPTIONS (5min)
    └─► submit-bouwsubsidie-application OPTIONS (5min)
```

---

## 2. External Uptime Monitors

Configure in BetterStack or UptimeRobot dashboard:

| Monitor | URL | Method | Interval | Alert After |
|---------|-----|--------|----------|-------------|
| Health Check | `https://okfqnqsvsesdpkpvltpr.supabase.co/functions/v1/health-check` | GET | 60s | 2 consecutive failures |
| Status Lookup | `https://okfqnqsvsesdpkpvltpr.supabase.co/functions/v1/lookup-public-status` | OPTIONS | 5min | 2 consecutive failures |
| Bouwsubsidie Submit | `https://okfqnqsvsesdpkpvltpr.supabase.co/functions/v1/submit-bouwsubsidie-application` | OPTIONS | 5min | 2 consecutive failures |
| Housing Submit | `https://okfqnqsvsesdpkpvltpr.supabase.co/functions/v1/submit-housing-registration` | OPTIONS | 5min | 2 consecutive failures |

**Expected responses:**
- Health Check: `200 OK` with `{ "status": "ok", "timestamp": "..." }`
- OPTIONS requests: `200 OK` with CORS headers

---

## 3. Sentry Alert Rules

Configure in Sentry dashboard when `SENTRY_DSN` is active:

### Error Alerts

| Rule | Condition | Environment | Action |
|------|-----------|-------------|--------|
| Error Spike | ≥5 `unexpected_error` events in 5 minutes | production | Email notification |
| DB Failure Cluster | ≥3 events with tag `error_code` starting with `DB_` in 5 minutes | production | Email notification |
| New Issue | First occurrence of any new error signature | production | Email notification |

### Performance Alerts

| Rule | Condition | Environment | Action |
|------|-----------|-------------|--------|
| Slow Response | Average transaction duration >2s over 5 minutes | production | Email notification |
| Rate Limit Surge | ≥10 `rate_limit_exceeded` events in 10 minutes | production | Email notification |

### Availability Alerts

| Rule | Condition | Action |
|------|-----------|--------|
| Endpoint Down | Uptime monitor reports 2+ consecutive failures | Email + Slack (if configured) |

---

## 4. Health Signal Events

| Event | Source | Trigger | PII |
|-------|--------|---------|-----|
| `system_ready` | Frontend (`src/lib/health.ts`) | App startup (once per session) | None |
| `request_started` | Edge Functions (all) | Every incoming request | None |
| `request_completed` | Edge Functions (all) | Successful request completion | None |
| `unexpected_error` | Edge Functions (all) | Unhandled exception | None — error message scrubbed |

---

## 5. PII Protection

All monitoring layers enforce strict PII exclusion:

**Frontend (Sentry Browser SDK):**
- `beforeSend` scrubber in `src/lib/sentry.ts`
- Strips: request bodies, cookies, token query params, XHR breadcrumb bodies

**Edge Functions (Structured Logger):**
- `scrubMessage()` in `supabase/functions/_shared/logger.ts`
- Strips: email addresses, phone numbers, ID numbers from error messages
- Metadata restricted to safe primitive values only
- Never logs: person names, national IDs, addresses, file contents, auth tokens

---

## 6. Configuration Checklist

### Required for full monitoring:

- [ ] Set `VITE_SENTRY_DSN` in Lovable environment for frontend error tracking
- [ ] Set `SENTRY_DSN` in Supabase Edge Function secrets for backend error forwarding
- [ ] Configure BetterStack/UptimeRobot with endpoints from Section 2
- [ ] Create Sentry alert rules from Section 3
- [ ] Verify alert delivery to team email

### Currently operational without configuration:

- [x] Structured JSON logging in all Edge Functions (Supabase logs)
- [x] Health check endpoint deployed
- [x] Frontend health signal (conditional)
- [x] PII scrubbing in all layers

---

## 7. Log Access

- **Supabase Edge Function logs:** https://supabase.com/dashboard/project/okfqnqsvsesdpkpvltpr/functions
- **Sentry dashboard:** Configure when DSN is available
- **Uptime dashboard:** Configure in BetterStack/UptimeRobot

---

*Document version: 1.0 — Phase 8D complete*
