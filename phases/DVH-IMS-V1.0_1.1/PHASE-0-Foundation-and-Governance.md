# Phase 0 — Foundation and Governance

**Project:** VolksHuisvesting IMS (DVH-IMS-1.0)  
**Status:** Documentation Only  
**Authority:** Delroy (Final)

---

## A. Phase Objective

Establish the foundational governance layer for the VolksHuisvesting IMS:
- Verify Darkone Admin baseline integrity
- Connect to external Supabase project
- Replace fake-backend authentication with Supabase Auth
- Verify governance tables and RLS baseline
- Confirm deny-all default security posture

---

## B. Explicit Scope (ALLOWED)

| Category | Allowed Actions |
|----------|-----------------|
| Authentication | Replace fake-backend with Supabase Auth (email/password) |
| Auth Context | Update `useAuthContext.tsx` to use Supabase session management |
| Sign-In | Update sign-in hook to use `supabase.auth.signInWithPassword` |
| Sign-Up | Update sign-up component to use `supabase.auth.signUp` |
| App Entry | Remove `configureFakeBackend()` invocation from `App.tsx` |
| Verification | Verify Darkone Admin baseline files are unchanged |
| Verification | Verify RLS enabled and FORCE RLS applied on governance tables |
| Verification | Verify `on_auth_user_created` trigger functionality |

---

## C. Explicit Out of Scope (FORBIDDEN)

| Category | Forbidden Actions |
|----------|-------------------|
| Database | Creating new tables |
| Database | Creating role enums or authorization helpers |
| Database | Modifying existing table structures |
| UI | Any layout changes |
| UI | Any SCSS modifications |
| UI | Any component styling changes |
| UI | Public-facing pages |
| Modules | Bouwsubsidie schema or logic |
| Modules | Housing Registration schema or logic |
| Integration | Edge Functions |
| Integration | Storage buckets |
| Integration | Social authentication providers |

---

## D. Database Impact (DOCUMENTATION ONLY)

### Existing Tables (Verify Only)

| Table | Status | RLS | FORCE RLS |
|-------|--------|-----|-----------|
| `app_user_profile` | EXISTS | ENABLED | APPLIED |
| `audit_event` | EXISTS | ENABLED | APPLIED |

### Existing Trigger (Verify Only)

| Trigger | Function | Action |
|---------|----------|--------|
| `on_auth_user_created` | `handle_new_user()` | Creates profile on signup |

### RLS Policy Matrix

| Table | Policy Name | Operation | Expression |
|-------|-------------|-----------|------------|
| `app_user_profile` | Users can read own profile | SELECT | `user_id = auth.uid()` |
| `app_user_profile` | Users can update own profile | UPDATE | `user_id = auth.uid()` |
| `audit_event` | Authenticated can insert | INSERT | `actor_user_id = auth.uid()` |
| `audit_event` | (none) | SELECT | DENY (no policy = deny) |

### No Database Changes in Phase 0

---

## E. UI Impact (DOCUMENTATION ONLY)

### Admin UI (Darkone 1:1 Enforcement)

| Component | Change Type | Description |
|-----------|-------------|-------------|
| `src/context/useAuthContext.tsx` | Logic Only | Replace cookie/localStorage with Supabase session |
| `src/app/(other)/auth/sign-in/useSignIn.ts` | Logic Only | Replace axios mock with Supabase Auth |
| `src/app/(other)/auth/sign-up/components/SignUp.tsx` | Logic Only | Implement Supabase signup |
| `src/App.tsx` | Logic Only | Remove fake backend invocation |

### Public UI

**NO PUBLIC UI IN PHASE 0**

### Darkone 1:1 Compliance Statement

All UI components, layouts, styles, and assets MUST remain unchanged. Only authentication logic within existing components is modified.

---

## F. Security & RLS Considerations

### Authentication Security

- Email/password authentication only
- Social providers disabled
- JWT-based session management via Supabase
- Session tokens handled by Supabase SDK (not stored manually)

### RLS Baseline

- **Deny-All Default:** Tables without explicit SELECT policies deny all reads
- **FORCE RLS Applied:** Superuser bypass disabled
- **Least Privilege:** Users can only access their own profile

### Secrets Management

- Supabase URL: Provided by Lovable platform integration
- Supabase Anon Key: Publishable (client-safe), provided by platform
- Service Role Key: NEVER exposed in client code
- No secrets committed to repository

### Audit Readiness

- `audit_event` table ready for append-only logging
- Actor identification via `auth.uid()`
- Timestamp automatically set via `now()`

---

## G. Verification Criteria

### Pre-Execution Verification

- [ ] Darkone Admin SCSS folder structure intact
- [ ] Darkone Admin layout components unchanged
- [ ] No custom UI systems introduced
- [ ] No Bootstrap extensions present

### Post-Execution Verification

- [ ] User can sign up with email/password
- [ ] `app_user_profile` record created on signup (trigger verification)
- [ ] User can sign in with credentials
- [ ] Session persists on browser refresh
- [ ] User can sign out
- [ ] Session cleared on sign out
- [ ] Protected routes redirect to sign-in when not authenticated
- [ ] RLS prevents users from reading other users' profiles
- [ ] No build errors
- [ ] No runtime errors
- [ ] No console errors related to authentication

### RLS Verification

```sql
-- Verify RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('app_user_profile', 'audit_event');

-- Verify policies exist
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## H. Restore Point (Documentation Snapshot — no execution)

**IMPORTANT:** This phase does not authorize execution. This document is for planning and governance purposes only. Execution requires explicit written authorization from Delroy.

### Restore Point Name
`phase-0-complete`

### Restore Point Contents
- All Phase 0 code changes committed
- Verification checklist completed
- No pending migrations
- Clean build state

### Rollback Procedure
If Phase 0 fails verification:
1. Revert to pre-Phase 0 commit
2. Report failure details
3. Await remediation instructions

---

## I. Hard Stop Statement

**MANDATORY HARD STOP AFTER PHASE 0 COMPLETION**

Upon completing Phase 0:
1. Execute all verification criteria
2. Submit completion report in standard format
3. **STOP** — Do not proceed to Phase 1
4. Await explicit written authorization from Delroy

**Completion Report Format:**
```
IMPLEMENTED:
- [completed items]

PARTIAL:
- [partial items with reason]

SKIPPED:
- [skipped items with reason]

VERIFICATION:
- [verification results]

RESTORE POINT:
- phase-0-complete

BLOCKERS / ERRORS:
- NONE (or explicit description)
```

**NO AUTO-PROCEED TO PHASE 1**

---

**End of Phase 0 Documentation**
