# Restore Point — V1.7.x TRUE Global Logo Description Update

**ID:** V1.7x-TrueGlobalLogoUpdate
**Date:** 2026-02-27
**Author:** Lovable (authorized by Delroy)

## Change Summary

Updated `header.ministry` i18n key in `src/i18n/locales/nl.json` from "Ministerie van Sociale Zaken en Volkshuisvesting" to "Min-Sozavo-IMS".

## Scope

- **PublicHeader.tsx** — renders `t('header.ministry')` under the logo on all public and auth pages
- **Admin panel** — verified: no ministry descriptor text exists in admin header/sidebar (`LogoBox.tsx`, `TopNavigationBar`, `VerticalNavigationBar`). No changes needed.

## What Was NOT Changed

- Footer copyright text — keeps full legal ministry name
- `index.html` meta author — keeps full legal ministry name
- Informational text blocks in `nl.json` (`aboutText`, `help.text`) — unchanged
- Logo images, routing, styling, layout structure
- Auth page headers (use logo image only, no descriptor text)
- Error pages (logo image only)

## Files Changed

- `src/i18n/locales/nl.json` — `header.ministry` value updated (line 30)

## Rollback

Revert `header.ministry` in `src/i18n/locales/nl.json` to:
```
"ministry": "Ministerie van Sociale Zaken en Volkshuisvesting"
```
