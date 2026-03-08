# Phase 8 — Observability & Monitoring: Implementation Plan

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## 1. Observability Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React SPA)                  │
│                                                         │
│  ErrorBoundary ──┐                                      │
│  Unhandled Promise Rejections ──┐                       │
│  Route Errors ──────────────────┼──→ Sentry Browser SDK │
│  Performance (Web Vitals) ──────┘         │              │
└───────────────────────────────────────────┼──────────────┘
                                            │
                                            ▼
                                    ┌──────────────┐
                                    │  Sentry Cloud │
                                    │  (sentry.io)  │
                                    │               │
                                    │  • Errors     │
                                    │  • Performance│
                                    │  • Alerts     │
                                    └──────┬───────┘
                                           │
                                     Slack / Email
                                      Alerts
                                           
┌─────────────────────────────────────────────────────────┐
│              EDGE FUNCTIONS (Deno / Supabase)           │
│                                                         │
│  Structured JSON logging ──→ Supabase Function Logs     │
│  Critical errors ──────────→ Sentry (via HTTP API)      │
│                                                         │
│  6 Functions:                                           │
│  • submit-bouwsubsidie-application                      │
│  • submit-housing-registration                          │
│  • lookup-public-status                                 │
│  • execute-allocation-run                               │
│  • generate-raadvoorstel                                │
│  • get-document-download-url                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              UPTIME MONITORING (BetterStack)             │
│                                                         │
│  • Published URL health check (every 60s)               │
│  • Edge Function endpoints (every 5 min)                │
│  • Status page (optional)                               │
└─────────────────────────────────────────────────────────┘
```

### Tool Selection


| Tool                             | Purpose                                | Why                                                                                                                                   |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Sentry**                       | Error tracking, performance monitoring | Industry standard; React SDK with ErrorBoundary integration; free tier sufficient (5K errors/month); HTTP API for Deno Edge Functions |
| **Supabase Logs**                | Edge Function log aggregation          | Already available on Pro tier; no extra setup; query via dashboard                                                                    |
| **BetterStack (or UptimeRobot)** | Uptime monitoring + alerting           | External heartbeat; independent of application stack; free tier covers needs                                                          |


---

## 2. Error Tracking Integration

### Frontend — What Gets Captured


| Source                       | Method                                      | Data Captured                         |
| ---------------------------- | ------------------------------------------- | ------------------------------------- |
| React component crashes      | ErrorBoundary → `Sentry.captureException()` | Error message, component stack, route |
| Unhandled promise rejections | `Sentry.init()` auto-capture                | Error message, stack trace            |
| Route navigation errors      | React Router error boundaries               | Route path, error                     |
| Performance                  | Sentry `BrowserTracing`                     | Page load, LCP, FID, CLS              |


### Edge Functions — What Gets Captured


| Source              | Method                            | Data Captured                                          |
| ------------------- | --------------------------------- | ------------------------------------------------------ |
| Function errors     | Structured JSON log + Sentry HTTP | Error type, correlation ID, function name, HTTP status |
| Validation failures | Structured JSON log only          | Validation field (no values), correlation ID           |
| Rate limit hits     | Structured JSON log only          | IP hash (not raw IP), correlation ID                   |


### Implementation Details

**Frontend (`src/lib/sentry.ts`):**

- Initialize Sentry with DSN from env var (`VITE_SENTRY_DSN`)
- Configure `tracesSampleRate: 0.1` (10% of transactions)
- Configure `replaysSessionSampleRate: 0` (no session replay — PII risk)
- Set environment tag (`production` / `preview`)

**ErrorBoundary update:**

- Add `Sentry.captureException(error, { extra: { componentStack } })` in `componentDidCatch`
- No other changes to ErrorBoundary UI

**Edge Functions (`_shared/logger.ts`):**

- Create shared structured logger utility
- On ERROR level: POST to Sentry HTTP API (`https://sentry.io/api/{project}/envelope/`)
- Sentry DSN stored as Supabase secret (`SENTRY_DSN`)

---

## 3. Logging Strategy

### Log Levels


| Level     | When Used                    | Example                                                                            |
| --------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| **INFO**  | Normal operations            | `[submit-bouwsubsidie] correlation=abc123 Application submitted successfully`      |
| **WARN**  | Recoverable issues           | `[lookup-public-status] correlation=abc123 Rate limit approaching threshold`       |
| **ERROR** | Failures requiring attention | `[submit-housing] correlation=abc123 Database insert failed: constraint violation` |


### Log Sources


| Source                        | Destination         | Retention                  |
| ----------------------------- | ------------------- | -------------------------- |
| Frontend errors               | Sentry              | 90 days (Sentry free tier) |
| Edge Function logs            | Supabase Logs       | 7 days (Pro tier default)  |
| Edge Function critical errors | Sentry              | 90 days                    |
| Audit events                  | `audit_event` table | Indefinite (database)      |
| Uptime checks                 | BetterStack         | 45 days (free tier)        |


### Structured Log Format (Edge Functions)

```json
{
  "level": "ERROR",
  "function": "submit-bouwsubsidie-application",
  "correlation_id": "uuid",
  "action": "person_insert",
  "error_code": "DB_CONSTRAINT",
  "message": "Failed to create person record",
  "timestamp": "ISO-8601"
}
```

No PII in logs. No citizen names, addresses, ID numbers, tokens, or file contents.

---

## 4. Alerting Strategy


| Alert                    | Trigger                                     | Channel                   | Priority |
| ------------------------ | ------------------------------------------- | ------------------------- | -------- |
| Application crash spike  | >10 unhandled errors in 5 minutes           | Sentry → Email            | P1       |
| Edge Function failure    | >5 function errors in 10 minutes            | Sentry → Email            | P1       |
| Site down                | 2 consecutive uptime check failures (2 min) | BetterStack → Email/Slack | P0       |
| High error rate          | Error rate >5% of requests over 15 min      | Sentry → Email            | P2       |
| New unhandled error type | First occurrence of new error signature     | Sentry → Email            | P2       |


---

## 5. Privacy & Security

### Explicitly Excluded from All Monitoring


| Data Type                            | Protection Method                                                  |
| ------------------------------------ | ------------------------------------------------------------------ |
| Citizen names, addresses, ID numbers | Sentry `beforeSend` scrubber strips form data and request bodies   |
| Uploaded documents                   | Never attached to error reports                                    |
| Auth tokens / JWT                    | Sentry default header scrubbing + custom deny list                 |
| Status lookup tokens                 | Edge Function logger strips token values; logs correlation ID only |
| IP addresses                         | Edge Functions log hashed IP only; Sentry IP scrubbing enabled     |


### Enforcement

- **Frontend:** `Sentry.init({ beforeSend })` callback strips `request.data`, form values, and URL query params containing `token`
- **Edge Functions:** Shared logger utility never accepts raw PII fields; only accepts predefined safe fields
- **Sentry project settings:** Enable "Prevent Storing of IP Addresses" in Sentry dashboard

---

## 6. Implementation Phases

### Phase 8A — Sentry Account & Secret Setup

- Create Sentry project (React platform)
- Store `SENTRY_DSN` as Supabase secret
- Store `VITE_SENTRY_DSN` in Lovable env
- **Complexity:** Low
- **Estimate:** 1 task

### Phase 8B — Frontend Error Tracking

- Create `src/lib/sentry.ts` (init + config + beforeSend scrubber)
- Import in `main.tsx` before app render
- Update `ErrorBoundary.componentDidCatch` to call `Sentry.captureException()`
- Add global unhandled rejection handler
- **Complexity:** Low
- **Files changed:** 3 (`sentry.ts` new, `main.tsx`, `ErrorBoundary.tsx`)

### Phase 8C — Edge Function Structured Logging

- Create `supabase/functions/_shared/logger.ts` (structured JSON logger)
- Add Sentry HTTP forwarding for ERROR level
- Update all 6 Edge Functions to use shared logger instead of raw `console.error`
- **Complexity:** Medium (6 functions to update)
- **Files changed:** 7 (`logger.ts` new + 6 function index files)

### Phase 8D — Uptime Monitoring & Alerts

- Configure BetterStack (or UptimeRobot) monitors
- Set up Sentry alert rules (thresholds from Section 4)
- Configure notification channels (email)
- **Complexity:** Low (external configuration only)
- **Files changed:** 0

---

## 7. Success Criteria


| Test                   | Method                                          | Expected Result                                                   |
| ---------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| Frontend error capture | Trigger intentional `throw` in a test component | Error appears in Sentry dashboard with stack trace, route, no PII |
| Unhandled rejection    | Call rejected promise without catch             | Captured automatically by Sentry                                  |
| Edge Function error    | Invoke Edge Function with invalid payload       | Structured log in Supabase Logs + error in Sentry                 |
| PII scrubbing          | Submit wizard with citizen data, trigger error  | Sentry event contains NO citizen names, addresses, or tokens      |
| Uptime alert           | Temporarily return 500 from health endpoint     | BetterStack triggers email alert within 2 minutes                 |
| Alert threshold        | Generate >10 errors in 5 minutes                | Sentry alert fires                                                |


---

## NOTE — Environment discipline

Approved.

When implementing Phase 8, make sure Sentry and uptime monitoring are configured with clear environment separation:

- production events must be tagged as production

- preview / test environments must not pollute production alerts

- alert rules should apply to production only unless explicitly needed otherwise

Also keep PII scrubbing mandatory in both frontend and Edge Function logging.  
  
Dependencies

- Sentry account (free tier sufficient)
- `SENTRY_DSN` secret must be added before Phase 8B
- `@sentry/react` npm package (~30KB gzipped)
- No database changes required
- No RLS changes required

---

## What Is NOT Included

- Session replay (excluded — PII risk)
- APM / distributed tracing (not needed at current scale)
- Custom Sentry on-premise (cloud SaaS sufficient)
- Log aggregation beyond Supabase Logs (not needed yet)

Awaiting approval before implementation.