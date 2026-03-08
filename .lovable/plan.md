# Phase 8C — Edge Function Structured Logging: Implementation Plan

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Current State

All 6 Edge Functions use inconsistent `console.log`/`console.error` with ad-hoc formatting. Only `submit-housing-registration` has correlation IDs. No structured log format exists. Some functions log raw error objects which may leak internal details.

---

## Implementation

### 1. Create Shared Logger (`supabase/functions/_shared/logger.ts`)

A single utility providing:

```typescript
type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  function_name: string
  event: string
  correlation_id?: string
  metadata?: Record<string, string | number | boolean | null>
  error_code?: string
  timestamp: string
}
```

**Three methods:** `logger.info()`, `logger.warn()`, `logger.error()`

Each outputs a single-line JSON string to `console.log`/`console.warn`/`console.error` (Supabase captures these).

**Sentry forwarding stub:** When `SENTRY_DSN` is present, `logger.error()` POSTs to Sentry HTTP API. When absent, no-op. This is conditional — same pattern as frontend.

**PII protection:** The logger accepts only a typed `metadata` object with primitive values. No `Error.stack` forwarding (stack traces may contain variable values). Error messages are truncated to 200 chars and scrubbed for email/phone patterns.

### 2. Factory Pattern

```typescript
function createLogger(functionName: string, correlationId?: string): Logger
```

Each function creates a logger at request start. The correlation ID auto-attaches to all log entries for that request.

### 3. Functions to Update (all 6)


| Function                          | Priority | Changes                                               |
| --------------------------------- | -------- | ----------------------------------------------------- |
| `lookup-public-status`            | 1        | Add correlation ID, replace 5 console calls           |
| `submit-bouwsubsidie-application` | 2        | Add correlation ID, replace ~15 console calls         |
| `submit-housing-registration`     | 3        | Already has correlation ID, replace ~12 console calls |
| `execute-allocation-run`          | 4        | Add correlation ID, replace ~8 console calls          |
| `generate-raadvoorstel`           | 5        | Add correlation ID, replace ~6 console calls          |
| `get-document-download-url`       | 6        | Add correlation ID, replace ~4 console calls          |


### 4. Event Names (standardized)


| Event                    | Used In                                        |
| ------------------------ | ---------------------------------------------- |
| `request_started`        | All                                            |
| `request_completed`      | All                                            |
| `validation_failed`      | All                                            |
| `unexpected_error`       | All                                            |
| `rate_limit_exceeded`    | lookup, submit-bs, submit-housing              |
| `status_lookup_failed`   | lookup                                         |
| `status_lookup_success`  | lookup                                         |
| `submission_started`     | submit-bs, submit-housing                      |
| `submission_completed`   | submit-bs, submit-housing                      |
| `submission_blocked`     | submit-bs                                      |
| `person_created`         | submit-bs, submit-housing                      |
| `person_reused`          | submit-housing                                 |
| `db_insert_failed`       | submit-bs, submit-housing                      |
| `ref_number_retry`       | submit-housing                                 |
| `auth_failed`            | execute-alloc, generate-raad, get-doc-download |
| `rbac_denied`            | execute-alloc, generate-raad, get-doc-download |
| `allocation_started`     | execute-alloc                                  |
| `allocation_completed`   | execute-alloc                                  |
| `document_generated`     | generate-raad                                  |
| `download_url_generated` | get-doc-download                               |


### 5. PII Scrubbing Rules

The logger's metadata object will NEVER contain:

- Person names, national IDs, addresses, phone numbers, emails
- File contents or document data
- Auth tokens, access tokens, JWT values
- Raw IP addresses (only hashed IPs as already done)

Safe metadata fields: `reference_number`, `district_code`, `correlation_id`, `error_code`, `count` values, `entity_type`, `http_status`, `person_reused` (boolean).

### 6. No-Noise Principle

Each function gets exactly:

- 1 `info` at request start (with HTTP method)
- 1 `info` at successful completion (with safe summary)
- `warn` only for rate limits, retries, non-critical failures
- `error` only for DB failures, unexpected exceptions

Internal steps (household insert, contact insert, address insert) only log on failure (`error`), not on success.

### 7. Example Structured Log Output

```json
{"level":"info","function_name":"lookup-public-status","event":"request_started","correlation_id":"abc-123","timestamp":"2026-03-08T10:00:00.000Z"}
{"level":"error","function_name":"submit-bouwsubsidie-application","event":"db_insert_failed","correlation_id":"def-456","error_code":"DB_CONSTRAINT","metadata":{"step":"person_insert","district_code":"PAR"},"timestamp":"2026-03-08T10:00:01.000Z"}
```

---

## Files


| Action | File                                                          |
| ------ | ------------------------------------------------------------- |
| CREATE | `supabase/functions/_shared/logger.ts`                        |
| MODIFY | `supabase/functions/lookup-public-status/index.ts`            |
| MODIFY | `supabase/functions/submit-bouwsubsidie-application/index.ts` |
| MODIFY | `supabase/functions/submit-housing-registration/index.ts`     |
| MODIFY | `supabase/functions/execute-allocation-run/index.ts`          |
| MODIFY | `supabase/functions/generate-raadvoorstel/index.ts`           |
| MODIFY | `supabase/functions/get-document-download-url/index.ts`       |


**Total: 1 new file, 6 modified files.**

---

## NOTE — Logging discipline

Correlation IDs must be generated at the start of every request if none is provided.

All structured logs must remain single-line JSON entries so they remain searchable

inside Supabase logs and future observability systems.

Do not log request bodies or raw database error objects.

Only safe metadata fields are allowed.  
  
**Constraints Confirmed**

- No SENTRY_DSN required (conditional stub)
- No PII in logs
- No database schema changes
- No new features introduced
- No functional behavior changes — only logging internals replaced
- Build/deploy verification after implementation