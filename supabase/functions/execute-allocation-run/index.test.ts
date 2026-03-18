/**
 * Integration tests for edge function: execute-allocation-run
 *
 * Phase 5 — Test Foundation.
 * Tests the authentication and input validation gates hardened in Phase 1.
 *
 * Test strategy (mirrors existing get-citizen-document/index.test.ts pattern):
 *   - Live HTTP calls against the deployed Supabase function
 *   - Auth rejection tests require NO valid token and produce NO database writes
 *   - Input validation test uses a real admin token but sends an invalid body,
 *     which causes the function to return 400 BEFORE any allocation DB operations
 *
 * Run with:
 *   deno test --allow-net supabase/functions/execute-allocation-run/index.test.ts
 *
 * Requires:
 *   - Deployed Supabase project (same instance as development)
 *   - Network access to SUPABASE_URL
 */

import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

const SUPABASE_URL = "https://okfqnqsvsesdpkpvltpr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZnFucXN2c2VzZHBrcHZsdHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTA5NTQsImV4cCI6MjA4MzMyNjk1NH0.-Bj_o2pnAWx_ilNT6LOkmCa587O1OlHfM6MHfCoYoLk";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/execute-allocation-run`;

/**
 * Obtain a short-lived admin access token for validation tests.
 * Uses the same admin account as get-citizen-document tests.
 */
async function getAdminToken(): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ email: "info@devmart.sr", password: "x(7ajg12FQ;C@c!" }),
  });
  if (res.status !== 200) throw new Error(`Could not sign in: status ${res.status}`);
  const { access_token } = await res.json();
  return access_token;
}

// ---------------------------------------------------------------------------
// AUTH GATE TESTS (Phase 1 hardening guard)
// These tests do NOT require a valid token — the function rejects before any DB op.
// ---------------------------------------------------------------------------

Deno.test("rejects request with no Authorization header → 401 AUTH_MISSING", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ run_id: "00000000-0000-0000-0000-000000000001", district_code: "PAR" }),
  });

  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.success, false);
  assertEquals(body.code, "AUTH_MISSING");
});

Deno.test("rejects request with malformed/expired token → 401 AUTH_INVALID", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer this-is-not-a-valid-jwt-token",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ run_id: "00000000-0000-0000-0000-000000000001", district_code: "PAR" }),
  });

  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.success, false);
  assertEquals(body.code, "AUTH_INVALID");
});

// ---------------------------------------------------------------------------
// INPUT VALIDATION TESTS
// These tests use a real token but send invalid payloads.
// The function rejects during validation — BEFORE any allocation DB writes.
// ---------------------------------------------------------------------------

Deno.test("rejects missing required fields with valid auth → 400 VALIDATION_MISSING", async () => {
  const token = await getAdminToken();

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    // Intentionally omit both required fields
    body: JSON.stringify({}),
  });

  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.success, false);
  assertEquals(body.code, "VALIDATION_MISSING");
});

Deno.test("rejects invalid UUID format for run_id → 400 VALIDATION_UUID", async () => {
  const token = await getAdminToken();

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ run_id: "not-a-uuid", district_code: "PAR" }),
  });

  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.success, false);
  assertEquals(body.code, "VALIDATION_UUID");
});

Deno.test("rejects invalid district_code format → 400 VALIDATION_DISTRICT", async () => {
  const token = await getAdminToken();

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      run_id: "00000000-0000-0000-0000-000000000001",
      district_code: "INVALID DISTRICT WITH SPACES AND $PECIAL CHARS!!",
    }),
  });

  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.success, false);
  assertEquals(body.code, "VALIDATION_DISTRICT");
});
