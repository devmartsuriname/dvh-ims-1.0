

# DVH-IMS V1.7.x — TRUE Global Logo Description Update

## Change

**Single value update** in `src/i18n/locales/nl.json` (line 30):

| Key | Before | After |
|-----|--------|-------|
| `header.ministry` | Ministerie van Sociale Zaken en Volkshuisvesting | Min-Sozavo-IMS |

## What This Affects

- **PublicHeader.tsx** — renders `t('header.ministry')` under the logo (public pages + auth pages)
- No other component uses this key

## What Does NOT Change

- **Footer.tsx** — keeps full legal name (hardcoded copyright)
- **index.html** — keeps full legal name in meta author tag
- **nl.json informational text** — `housing.step0.aboutText` and `wizard.help.text` reference the ministry name in context (not branding descriptors) — unchanged
- **nl.json `footer.copyright`** — keeps full legal name
- **Admin sidebar (LogoBox.tsx)** — logo image only, no descriptor text exists
- **Auth pages (SignIn, SignUp, ResetPassword)** — logo image only, no descriptor text
- **Error pages (404)** — logo image only, no descriptor text
- Logo images, routing, styling, layout structure

## Admin Panel Confirmation

The admin panel header/sidebar (`LogoBox.tsx`, `TopNavigationBar`, `VerticalNavigationBar`) renders only the logo image with no ministry descriptor text. No admin-side changes needed.

## Deliverables

1. Update `src/i18n/locales/nl.json` line 30
2. Create `docs/restore-points/v1.7/RESTORE_POINT_V1.7_TRUE_GLOBAL_LOGO_UPDATE.md`
3. Update `docs/DVH-IMS-V1.0_1.1/architecture.md`
4. Update `docs/DVH-IMS-V1.0_1.1/backend.md`
5. Browser verification (public desktop + mobile, admin desktop)

