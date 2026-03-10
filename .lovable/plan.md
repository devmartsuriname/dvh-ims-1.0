# Phase 13 Verification + Phase 14 QR Analytics Plan

## Phase 13 Verification Results

### 1. Redirect Routes — PASS

- `/q/woningregistratie` → `Navigate to="/housing/register"` (line 69, `src/routes/index.tsx`)
- `/q/bouwsubsidie` → `Navigate to="/bouwsubsidie/apply"` (line 70)
- Uses `replace` flag — no back-button loops

### 2. QR Generator Page — PASS

- Route: `/qr-codes` (line 144, inside `governanceRoutes`)
- Role-gated to `system_admin`, `project_leader`, `minister`, `director`
- Two QR cards rendered with SoZaVo logo overlay (20% center, white circle background)
- Error correction level H, black/white high contrast
- Note: `qrcode` library does not support rounded modules natively — modules are standard square

### 3. Download Buttons — PASS

- PNG (3000px), JPG (0.95 quality), SVG — all functional via canvas `toDataURL` and Blob

### 4. QR Scan — Cannot verify in code (requires physical device scan)

- URLs embedded: `https://volkshuisvesting.sr/q/woningregistratie` and `https://volkshuisvesting.sr/q/bouwsubsidie` — correct

### 5. Documentation — PASS

- `docs/DVH-IMS/V1.8/QR_CODES_PUBLIC_SERVICES.md` exists with all required content

### 6. Partial Items — Confirmed

- Combined PDF sheet: not implemented (acceptable)

### 7. Skipped Item — Confirmed

- `/docs/assets/qr-codes/` must be populated manually from admin page exports

### 8. Sidebar Navigation — NOT INCLUDED

- QR Codes page is not in the sidebar menu. Access only via direct URL `/qr-codes`.

### Answers to Additional Questions

1. Route: `https://volkshuisvesting.sr/qr-codes`
2. Not in sidebar — direct URL only
3. Allowed roles: `system_admin`, `project_leader`, `minister`, `director`
4. Production domain confirmed: `https://volkshuisvesting.sr`

---

## Phase 14 — QR Analytics Dashboard Widget

### Step 1 — Database: `qr_scan_event` table

```sql
CREATE TABLE public.qr_scan_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_type text NOT NULL CHECK (qr_type IN ('woningregistratie', 'bouwsubsidie')),
  scanned_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text,
  user_agent text,
  district_guess text
);

ALTER TABLE public.qr_scan_event ENABLE ROW LEVEL SECURITY;

-- Anonymous insert (from Edge Function via service role — no RLS needed for insert)
-- Admin read
CREATE POLICY "staff_select_qr_scan_event" ON public.qr_scan_event
  FOR SELECT TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['system_admin','project_leader','minister','director','audit']::app_role[])
  );
```

### Step 2 — Edge Function: `track-qr-scan`

New `supabase/functions/track-qr-scan/index.ts`:

- POST endpoint accepting `{ qr_type: 'woningregistratie' | 'bouwsubsidie' }`
- No JWT required (anonymous citizen scans)
- Hash IP with SHA-256 (privacy), capture user agent
- Insert into `qr_scan_event` via service role
- Rate limit: 60 requests/IP/hour
- Register in `config.toml` with `verify_jwt = false`

### Step 3 — Update Redirect Routes

Replace `<Navigate>` components with redirect page components that:

1. Call `track-qr-scan` Edge Function on mount (fire-and-forget)
2. Immediately redirect via `window.location.replace()` or `useNavigate`

New file: `src/app/(public)/qr-redirect/page.tsx`

- Accepts `qr_type` prop
- Fires tracking request, then redirects

### Step 4 — Dashboard Widget

Add `QrUsageWidget` component to `src/app/(admin)/dashboards/components/QrUsageWidget.tsx`:

- Query `qr_scan_event` for today / 7d / 30d counts per `qr_type`
- Bar chart (ApexCharts) showing Housing vs Subsidy scans
- Total scan counter
- Integrate into `src/app/(admin)/dashboards/page.tsx` between Chart and User sections

### Step 5 — Restore Point + Documentation

Create restore point and update Phase 14 report.

---

## NOTE — Admin Navigation Improvement

The QR Code Generator page currently exists at the route:

/qr-codes

However, it is not included in the Admin Sidebar navigation and can only be accessed via direct URL.

To improve usability for ministry staff, please add a sidebar menu entry for this page.

Suggested placement in the sidebar:

Governance

   → QR Codes

Requirements:

• Only visible to the same roles already allowed to access the page:

  system_admin, project_leader, minister, director

• Menu item label: "QR Codes"

• Route target: /qr-codes

• Use the existing Darkone sidebar menu pattern and icon style.

This will ensure administrators can easily access the QR Code Generator without needing the direct URL.  
  
  
**Files Changed**


| File                                                      | Action                                           |
| --------------------------------------------------------- | ------------------------------------------------ |
| Database migration                                        | CREATE `qr_scan_event` table + RLS               |
| `supabase/functions/track-qr-scan/index.ts`               | CREATE Edge Function                             |
| `supabase/config.toml`                                    | ADD function entry                               |
| `src/routes/index.tsx`                                    | UPDATE redirect routes to use tracking component |
| `src/app/(public)/qr-redirect/page.tsx`                   | CREATE redirect + tracking page                  |
| `src/app/(admin)/dashboards/components/QrUsageWidget.tsx` | CREATE dashboard widget                          |
| `src/app/(admin)/dashboards/page.tsx`                     | ADD QrUsageWidget                                |
| `docs/DVH-IMS/V1.8/PHASE_14_QR_ANALYTICS_REPORT.md`       | CREATE                                           |
