/**
 * Integration tests for edge function: generate-raadvoorstel
 *
 * Phase 7 — Remaining Critical Coverage & Safe Quality Hardening.
 * Tests the authentication and input validation gates only.
 *
 * Test strategy (mirrors get-document-download-url/index.test.ts pattern):
 *   - Live HTTP calls against the deployed Supabase function
 *   - Auth rejection tests require NO valid token and produce NO database writes
 *   - Input validation tests use a real admin token but send invalid payloads,
 *     which cause the function to return 400 BEFORE any DOCX generation, storage
 *     upload, document record insert, or audit log write occurs
 *
 * Safety note:
 *   The happy path (valid case_id → DOCX generation → storage upload → DB record)
 *   is explicitly NOT tested here. Generating DOCX documents, uploading to storage,
 *   and inserting generated_document records for non-existent test cases would
 *   create real storage objects and DB rows. The 4 boundary tests below cover all
 *   security-critical rejection paths without any side effects.
 *
 * Run with:
 *   deno test --allow-net supabase/functions/generate-raadvoorstel/index.test.ts
 *
 * Requires:
 *   - Deployed Supabase project (same instance as development)
 *   - Network access to SUPABASE_URL
 */

import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

const SUPABASE_URL = "https://okfqnqsvsesdpkpvltpr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZnFucXN2c2VzZHBrcHZsdHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTA5NTQsImV4cCI6MjA4MzMyNjk1NH0.-Bj_o2pnAWx_ilNT6LOkmCa587O1OlHfM6MHfCoYoLk";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/generate-raadvoorstel`;

/**
 * Obtain a short-lived admin access token for validation tests.
 * Uses the same admin account as the other edge function tests.
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
// These tests do NOT require a valid token — function rejects before any DB op.
// ---------------------------------------------------------------------------

Deno.test("rejects request with no Authorization header → 401 AUTH_MISSING", async () => {
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

Deno.test("rejects request with malformed/expired token → 401 AUTH_INVALID", async () => {
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
// INPUT VALIDATION TESTS
// These tests use a real token but send invalid payloads.
// The function rejects during UUID validation — BEFORE any DB fetch, DOCX
// generation, storage upload, document record insert, or audit log write.
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
    // Intentionally omit case_id
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
