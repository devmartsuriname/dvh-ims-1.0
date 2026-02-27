# Restore Point — V1.7.x Hide "Personeelsportaal" Button on Mobile

**ID:** V1.7x-HideStaffPortalMobile
**Date:** 2026-02-27
**Author:** Lovable (authorized by Delroy)

## Change Summary

Added Bootstrap responsive display utility classes `d-none d-md-inline-block` to the "Personeelsportaal" (`Link to="/auth/sign-in"`) button in `PublicHeader.tsx`.

## Behavior

| Viewport | Visible? |
|----------|----------|
| Desktop (>=768px) | Yes |
| Tablet (>=768px) | Yes |
| Mobile (<768px) | No (hidden via CSS) |

## Files Changed

- `src/components/public/PublicHeader.tsx` — Added `d-none d-md-inline-block` to Link className (line 34)

## What Was NOT Changed

- No routing logic modified
- No authentication logic modified
- No component removed from DOM tree (CSS visibility only)
- No other components affected
- No backend, DB, or RLS changes

## Rollback

Remove `d-none d-md-inline-block` from the Link className in `PublicHeader.tsx` line 34.
