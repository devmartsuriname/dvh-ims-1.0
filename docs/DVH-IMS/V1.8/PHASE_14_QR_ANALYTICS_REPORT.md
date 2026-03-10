# DVH-IMS — Phase 14: QR Analytics Dashboard Widget

## Implementation Report

### Date: 2026-03-10

---

## Overview

Phase 14 adds anonymous scan tracking for the ministry's public service QR codes and a dashboard widget for staff to monitor adoption.

---

## Database

### Table: `qr_scan_event`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| qr_type | text | `woningregistratie` or `bouwsubsidie` |
| scanned_at | timestamptz | Timestamp of scan |
| ip_hash | text | SHA-256 hash of client IP (privacy) |
| user_agent | text | Browser/device user agent string |
| district_guess | text | Reserved for future geo-inference |

### RLS

- **SELECT**: Restricted to `system_admin`, `project_leader`, `minister`, `director`, `audit`
- **INSERT**: Via Edge Function using service role (bypasses RLS)
- No UPDATE or DELETE permitted

---

## Edge Function: `track-qr-scan`

- **Endpoint**: `POST /functions/v1/track-qr-scan`
- **Auth**: None required (anonymous citizen scans)
- **Rate Limit**: 60 requests per IP per hour
- **Privacy**: IP addresses are SHA-256 hashed before storage
- **Payload**: `{ "qr_type": "woningregistratie" | "bouwsubsidie" }`

---

## Redirect Tracking

QR redirect routes (`/q/woningregistratie`, `/q/bouwsubsidie`) now fire a tracking request before redirecting. The tracking call is fire-and-forget — it never blocks the redirect.

---

## Dashboard Widget: QR Code Usage

Located on the main admin dashboard, displays:

- **KPI counters**: Today / 7 Days / 30 Days total scans
- **Bar chart**: Housing Registration vs Construction Subsidy scans
- **Badge**: Total 30-day scan count

### Access

Visible to all dashboard-authorized roles. Data query restricted by RLS to oversight roles.

---

## Sidebar Navigation

QR Codes page added to sidebar under **GOVERNANCE** section:
- Label: "QR Codes"
- Icon: `mingcute:qrcode-2-line`
- Route: `/qr-codes`
- Visible to: `system_admin`, `project_leader`, `minister`, `director`

---

## Files Changed

| File | Action |
|------|--------|
| Database migration | CREATE `qr_scan_event` table + RLS |
| `supabase/functions/track-qr-scan/index.ts` | CREATE |
| `supabase/config.toml` | ADD function entry |
| `src/routes/index.tsx` | UPDATE redirect routes |
| `src/app/(public)/qr-redirect/page.tsx` | CREATE |
| `src/app/(admin)/dashboards/components/QrUsageWidget.tsx` | CREATE |
| `src/app/(admin)/dashboards/page.tsx` | ADD widget |
| `src/assets/data/menu-items.ts` | ADD sidebar entry |
| `docs/DVH-IMS/V1.8/PHASE_14_QR_ANALYTICS_REPORT.md` | CREATE |
