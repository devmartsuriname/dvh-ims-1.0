# Incident RCA: Housing Registration Submit Failure

## Incident ID
`INC-V1.7-HOUSING-SUBMIT-REGEX`

## Date Detected
2026-03-01

## Severity
P0 — All housing registration submissions blocked (100% failure rate)

## Symptoms
- Woningregistratie wizard final submit always returns: "Aanvraag kon niet worden ingediend. Probeer opnieuw."
- Edge function logs show: `Validation failed: [{"field":"email","message":"Invalid email format"},{"field":"date_of_birth","message":"Date must be in YYYY-MM-DD format"}]`
- Reproducible across all browsers (Chrome, Firefox)
- Bouwsubsidie submissions work correctly

## Root Cause
Double-escaped backslashes in JavaScript regex literals in `submit-housing-registration/index.ts`:

```
// BROKEN (line 119)
const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
// BROKEN (line 127)
const dateRegex = /^\\d{4}-\\d{2}-\\d{2}$/
```

In a JS regex literal, `\\s` means literal backslash + 's', not the `\s` whitespace class. All valid emails and dates are rejected.

## Regression Window
Introduced during the v1.7.x person upsert + reference number retry refactor. The file was regenerated with double-escaped regex, masking the original constraint fix behind a new validation bug.

## Fix Applied
Corrected to single-escaped regex (matching the working bouwsubsidie function):
```
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const dateRegex = /^\d{4}-\d{2}-\d{2}$/
```

## Impact
- 2 lines changed in 1 file
- No DB, RLS, or frontend changes
- No bouwsubsidie regression risk

## Prevention
Document recommendation: extract shared validation helpers to a common module to prevent duplication drift between housing and bouwsubsidie edge functions.
