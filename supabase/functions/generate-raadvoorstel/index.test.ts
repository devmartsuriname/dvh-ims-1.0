/**
 * Integration tests for edge function: generate-raadvoorstel
 *
 * Phase 8 — JWT Relay Fix.
 * Tests authentication gates (function-level) and input validation.
 *
 * Test strategy:
 *   - Live HTTP calls against the deployed Supabase function
 *   - verify_jwt = false — function handles auth internally via getUser(token)
 *   - Input validation tests use a real admin token but send invalid payloads
 *
 * Safety note:
 *   The happy path (valid case_id → DOCX generation) is NOT tested here.
 *
 * Run with:
 *   deno test --allow-net supabase/functions/generate-raadvoorstel/index.test.ts
 */

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";

const SUPABASE_URL = "https://okfqnqsvsesdpkpvltpr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZnFucXN2c2VzZHBrcHZsdHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTA5NTQsImV4cCI6MjA4MzMyNjk1NH0.-Bj_o2pnAWx_ilNT6LOkmCa587O1OlHfM6MHfCoYoLk";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/generate-raadvoorstel`;

async function getAdminToken(): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ email: "info@devmart.sr", password: "x(7ajg12FQ;C@c!" }),
  });
  if (res.status !== 200) {
    const errBody = await res.text();
    throw new Error(`Could not sign in: status ${res.status} — ${errBody}`);
  }
  const { access_token } = await res.json();
  return access_token;
}

// ---------------------------------------------------------------------------
// AUTH GATE TESTS — function-level auth (verify_jwt = false)
// ---------------------------------------------------------------------------

Deno.test("rejects request with no Authorization header → 401", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ case_id: "00000000-0000-0000-0000-000000000001" }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.success, false);
  assertEquals(body.error, "AUTH_MISSING");
});

Deno.test("rejects request with malformed token → 401", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer this-is-not-a-valid-jwt-token",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ case_id: "00000000-0000-0000-0000-000000000001" }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.success, false);
  assertEquals(body.error, "AUTH_INVALID");
});

// ---------------------------------------------------------------------------
// INPUT VALIDATION TESTS — valid token, invalid payload
// ---------------------------------------------------------------------------

Deno.test("rejects missing case_id with valid auth → 400 VALIDATION_UUID", async () => {
  const token = await getAdminToken();
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({}),
  });
  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.success, false);
  assertEquals(body.error, "VALIDATION_UUID");
});

Deno.test("rejects invalid UUID format for case_id → 400 VALIDATION_UUID", async () => {
  const token = await getAdminToken();
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ case_id: "not-a-valid-uuid" }),
  });
  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.success, false);
  assertEquals(body.error, "VALIDATION_UUID");
});
