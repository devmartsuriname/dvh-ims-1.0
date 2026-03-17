

## Problem

The URL hash contains `#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`. The `NewPassword` component never parses this error from the hash, so it stays stuck on the spinner forever.

## Fix

Update `NewPassword.tsx` to:

1. Parse the URL hash fragment for `error` and `error_description` parameters on mount
2. If an error is found (e.g. expired link), show a clear error message with a button to request a new reset link
3. Stop the spinner when an error is detected

### Changes

**File: `src/app/(other)/auth/new-password/components/NewPassword.tsx`**

- Add state for `error` message
- In the `useEffect`, parse `window.location.hash` for error parameters
- If `error` exists in hash, set the error state and stop showing spinner
- Render an error UI with the description and a link back to `/auth/reset-password` to request a new link
- Also handle the case where neither session nor error appears after a timeout (e.g. 5 seconds) — show a "link may be invalid" fallback

