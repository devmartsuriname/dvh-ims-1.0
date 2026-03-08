# Phase 8D — Monitoring & Alerts Configuration: Implementation Plan

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Assessment

Phase 8A-8C infrastructure is complete:

- Frontend: `src/lib/sentry.ts` with conditional init + PII scrubber
- Backend: `supabase/functions/_shared/logger.ts` with structured JSON + conditional Sentry forwarding
- ErrorBoundary: captures exceptions via `captureException()`

Phase 8D scope is primarily **configuration and documentation** — most monitoring infrastructure already exists in code. The remaining work is:

1. A lightweight health-check Edge Function for uptime monitors
2. A health signal utility for the frontend
3. Restore point + completion documentation

---

## Implementation

### 1. Health Check Edge Function (`supabase/functions/health-check/index.ts`)

Minimal endpoint returning `{ status: "ok", timestamp }` for external uptime monitors (BetterStack/UptimeRobot).

- CORS headers included
- No auth required (`verify_jwt = false`)
- No database queries — pure availability signal
- Response includes environment tag
- ~20 lines of code

Add to `supabase/config.toml`:

```toml
[functions.health-check]
verify_jwt = false
```

### 2. Frontend Health Signal (`src/lib/health.ts`)

Small utility emitting `system_ready` event via `captureMessage()` on app startup. Conditional — only fires when Sentry is active.

- Called once from `main.tsx` after `initSentry()`
- Emits `system_ready` with environment tag
- No PII, no user data

### 3. Monitoring Configuration Document

Create `docs/DVH-IMS/V1.8/MONITORING_CONFIGURATION.md` documenting:

**External Uptime Monitors** (to be configured manually in BetterStack/UptimeRobot):


| Monitor             | URL                                                                                               | Interval | Alert After |
| ------------------- | ------------------------------------------------------------------------------------------------- | -------- | ----------- |
| Health Check        | `https://okfqnqsvsesdpkpvltpr.supabase.co/functions/v1/health-check`                              | 60s      | 2 failures  |
| Status Lookup       | `https://okfqnqsvsesdpkpvltpr.supabase.co/functions/v1/lookup-public-status` (OPTIONS)            | 5min     | 2 failures  |
| Bouwsubsidie Submit | `https://okfqnqsvsesdpkpvltpr.supabase.co/functions/v1/submit-bouwsubsidie-application` (OPTIONS) | 5min     | 2 failures  |


**Sentry Alert Rules** (to be configured in Sentry dashboard):


| Rule               | Condition                                   | Action |
| ------------------ | ------------------------------------------- | ------ |
| Error Spike        | ≥5 errors in 5 min, environment=production  | Email  |
| DB Failure Cluster | ≥3 events tagged `error_code:DB_*` in 5 min | Email  |
| New Issue          | First occurrence of new error signature     | Email  |


**Thresholds documented but require Sentry dashboard access to activate.**

### 4. Restore Point

Create `docs/restore-points/v1.8/RESTORE_POINT_V1.8_PHASE_8_OBSERVABILITY_COMPLETE.md` summarizing all Phase 8 deliverables.

---

## Files


| Action | File                                                                            |
| ------ | ------------------------------------------------------------------------------- |
| CREATE | `supabase/functions/health-check/index.ts`                                      |
| MODIFY | `supabase/config.toml` (add health-check entry)                                 |
| CREATE | `src/lib/health.ts`                                                             |
| MODIFY | `src/main.tsx` (import health signal)                                           |
| CREATE | `docs/DVH-IMS/V1.8/MONITORING_CONFIGURATION.md`                                 |
| CREATE | `docs/restore-points/v1.8/RESTORE_POINT_V1.8_PHASE_8_OBSERVABILITY_COMPLETE.md` |


**Total: 4 new files, 2 modified files. No database changes. No functional behavior changes.**

---

## NOTE — Health Endpoint Security

The health-check endpoint must remain stateless and must not expose

any system configuration details.

The response should only include:

status and timestamp.

No version numbers, database status, or internal infrastructure

details should be returned.  
  
**Constraints Confirmed**

- No PII in any monitoring output
- Alerts scoped to production environment only
- No database schema changes
- All conditional on DSN presence — safe when unconfigured
- Health check is stateless — no sensitive data exposed