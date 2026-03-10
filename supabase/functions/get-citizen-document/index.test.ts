import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";

const SUPABASE_URL = "https://okfqnqsvsesdpkpvltpr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZnFucXN2c2VzZHBrcHZsdHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTA5NTQsImV4cCI6MjA4MzMyNjk1NH0.-Bj_o2pnAWx_ilNT6LOkmCa587O1OlHfM6MHfCoYoLk";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/get-citizen-document`;

async function getAdminToken(): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ email: "info@devmart.sr", password: "x(7ajg12FQ;C@c!" }),
  });
  if (res.status !== 200) throw new Error("Could not sign in");
  const { access_token } = await res.json();
  return access_token;
}

Deno.test("rejects request without Authorization header", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ file_path: "housing/00000000-0000-0000-0000-000000000000/test.pdf" }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.success, false);
  assertEquals(body.error, "AUTH_MISSING");
});

Deno.test("rejects path traversal attempt", async () => {
  const token = await getAdminToken();
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ file_path: "../../../etc/passwd" }),
  });
  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.error, "VALIDATION_ERROR");
});

Deno.test("rejects invalid path format", async () => {
  const token = await getAdminToken();
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ file_path: "other-bucket/somefile.pdf" }),
  });
  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.error, "VALIDATION_ERROR");
});

Deno.test("authenticated admin passes auth+rbac+validation for housing path", async () => {
  const token = await getAdminToken();
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ file_path: "housing/aef3d169-3b1d-4148-b0fa-f36fc08d1cd4/test.pdf" }),
  });
  const body = await res.json();
  console.log("Status:", res.status, "Body:", JSON.stringify(body));
  
  // 200 = signed URL generated, 500 = file not in storage (no uploads exist yet)
  assert([200, 500].includes(res.status), `Expected 200 or 500, got ${res.status}`);
  if (res.status === 200) {
    assertEquals(body.success, true);
    assert(body.signedUrl.includes("token="));
  } else {
    assertEquals(body.error, "URL_ERROR");
  }
});

Deno.test("authenticated admin passes auth+rbac+validation for bouwsubsidie path", async () => {
  const token = await getAdminToken();
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ file_path: "bouwsubsidie/aef3d169-3b1d-4148-b0fa-f36fc08d1cd4/doc.pdf" }),
  });
  const body = await res.json();
  console.log("Status:", res.status, "Body:", JSON.stringify(body));
  assert([200, 500].includes(res.status), `Expected 200 or 500, got ${res.status}`);
});
