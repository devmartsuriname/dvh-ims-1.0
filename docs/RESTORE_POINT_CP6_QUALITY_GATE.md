# Restore Point: Phase 5 CP6 Quality Gate

**Created**: 2026-01-07  
**Phase**: 5 - Public Experience  
**Checkpoint**: CP6 Quality Gate Fix  
**Restore ID**: `PHASE-5-CP6-QUALITY-GATE-START`

## Purpose

Pre-fix snapshot before implementing Darkone 1:1 parity fixes for public pages.

## Current State

- Status Tracker page implemented at `/status`
- Landing page at `/`
- Bouwsubsidie wizard at `/bouwsubsidie/apply`
- Housing wizard at `/housing/register`

## Issues to Address

1. Logo path incorrect (referencing non-existent `/public/assets/images/logo-dark.png`)
2. Status page has inline header/footer instead of shared components
3. Button icon alignment needs Darkone 1:1 parity
4. Landing hero needs premium government visual depth

## Files to Modify

- `src/components/public/PublicHeader.tsx` - Fix logo import path
- `src/app/(public)/status/page.tsx` - Use shared components
- `src/app/(public)/status/components/StatusForm.tsx` - Button alignment
- `src/app/(public)/landing/page.tsx` - Hero polish

## Rollback

If issues occur, revert to commit before these changes.
