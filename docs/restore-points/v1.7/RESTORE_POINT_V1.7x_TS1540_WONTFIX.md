# Restore Point — V1.7.x apexcharts TS1540 — Won't Fix (Editor-Only Artifact)

**ID:** V1.7x-TS1540-WontFix
**Date:** 2026-02-27
**Author:** Lovable (authorized by Delroy)

## Decision

**Status:** Won't Fix — Editor-only TS diagnostic artifact (skipLibCheck already enabled).

## Root Cause

TS1540 originates from `node_modules/apexcharts/types/apexcharts.d.ts` — a third-party type declaration file. This is NOT triggered by any local project code.

## Why No Fix Is Needed

`skipLibCheck: true` is already enabled in all three TypeScript config files:

- `tsconfig.json` (line 9)
- `tsconfig.app.json` (line 6)
- `tsconfig.node.json` (line 5)

The Vite build pipeline respects `skipLibCheck` and completes without TS1540 errors. The diagnostic appears only in the Lovable IDE's inline TypeScript language server, which may not fully respect this flag.

## Verification Evidence

- **Build pipeline:** Lovable Vite build completes successfully — no TS errors in build output.
- **Runtime:** Live Preview loads without errors (no console errors related to apexcharts or TS1540).
- **Conclusion:** Editor-only diagnostic; not reproducible in build pipeline.

## What Was NOT Changed

- No TypeScript config files modified
- No source code modified
- No `node_modules` edited
- No strictness flags loosened
- No runtime behavior affected

## Re-open Criteria

Only if TS1540 causes an actual build failure or runtime error in the Vite pipeline.
