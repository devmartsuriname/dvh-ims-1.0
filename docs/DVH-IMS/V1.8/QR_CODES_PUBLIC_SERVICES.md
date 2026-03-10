# DVH-IMS — Phase 13: QR Codes Public Services

**Status:** Implemented  
**Version:** 1.8  
**Date:** 2026-03-10

---

## Overview

Two official QR codes have been created for citizen-facing services operated by the Ministerie van Sociale Zaken en Volkshuisvesting (SoZaVo):

| Service | Canonical QR URL | Redirects To |
|---------|-----------------|--------------|
| Woning Registratie | `https://volkshuisvesting.sr/q/woningregistratie` | `/housing/register` |
| Bouwsubsidie Aanvraag | `https://volkshuisvesting.sr/q/bouwsubsidie` | `/bouwsubsidie/apply` |

---

## Redirect Architecture

The `/q/` prefix routes are **stable canonical redirect endpoints**. If the underlying form routes change in a future release, only the redirect target needs updating — all printed QR codes remain valid.

- `/q/woningregistratie` → `<Navigate to="/housing/register" replace />`
- `/q/bouwsubsidie` → `<Navigate to="/bouwsubsidie/apply" replace />`

**CRITICAL:** These paths must NEVER be renamed or removed.

---

## QR Code Specifications

| Property | Value |
|----------|-------|
| Error Correction | Level H (30%) |
| Logo Overlay | `logo-sozavo.png` (center, 20% of QR area) |
| Color | Black (#000000) on White (#FFFFFF) |
| Quiet Zone | 4 modules minimum |
| Print Resolution | 3000 × 3000 px |
| Formats | PNG, JPG, SVG |

---

## Downloading QR Assets

1. Log in to the admin panel
2. Navigate to **QR Codes** (under Governance routes)
3. Each QR code card provides download buttons for:
   - **PNG** (3000px — print quality)
   - **JPG** (web version)
   - **SVG** (vector — scalable for any size)

---

## Print Usage Guidelines

### Minimum Size
- **3 cm × 3 cm** for printed materials
- Below this size, scanning reliability decreases

### Recommended Poster Sizes
- **A4** (21 × 29.7 cm) — counter displays, office windows
- **A3** (29.7 × 42 cm) — waiting rooms, bulletin boards

### Placement Instructions (Government Offices)
1. **Reception / Loket** — eye-level near service windows
2. **Waiting Areas** — on walls or standing displays
3. **Entrance Doors** — visible from outside during office hours
4. **Information Boards** — alongside service announcements
5. **Publications** — flyers, brochures, official letters

### Contrast Rules
- Always print black QR on white background
- Do NOT use colored backgrounds behind the QR code
- Do NOT add decorative borders that encroach on the quiet zone
- Ensure the SoZaVo logo in the center is clearly visible

---

## File Storage

Official exported QR assets should be stored at:

```
/docs/assets/qr-codes/
  qr_woningregistratie.png
  qr_woningregistratie.jpg
  qr_woningregistratie.svg
  qr_bouwsubsidie.png
  qr_bouwsubsidie.jpg
  qr_bouwsubsidie.svg
```

These files are generated via the admin QR Codes page and should be committed after initial export to provide a single official asset set for ministry use.

---

## Access Control

The QR Codes admin page is restricted to:
- `system_admin`
- `project_leader`
- `minister`
- `director`

All other roles are redirected to `/dashboards`.
