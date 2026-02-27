# Restore Point — V1.7.x Hero Image & Overlay Update

**ID:** V1.7x-HeroImageOverlayUpdate
**Date:** 2026-02-27
**Author:** Lovable (authorized by Delroy)

## Change Summary

Replaced hero background image from `bg-pattern-1.png` to AI-generated `hero-community.png` (1920x1080, community/family scene). Updated overlay from `rgba(30, 41, 59, 0.85)` to `rgba(0, 0, 0, 0.60)`.

## Image Specification

- Resolution: 1920x1080 (16:9)
- Subjects centered in middle 60% of frame
- Safe for `background-size: cover` at all viewports
- Generated via flux2.dev model

## Files Changed

- `src/assets/images/hero-community.png` — New AI-generated hero image
- `src/app/(public)/landing/page.tsx` — Import changed, overlay opacity updated

## What Was NOT Changed

- Hero height, padding, typography
- Button styling, layout structure
- Services section, footer, header
- Routing, i18n keys
- Any other pages or components

## Rollback

1. Restore import in `page.tsx` to `import bgPattern from '@/assets/images/bg-pattern-1.png'`
2. Restore `backgroundImage` to use `bgPattern`
3. Restore overlay to `rgba(30, 41, 59, 0.85)`
4. Delete `src/assets/images/hero-community.png`
