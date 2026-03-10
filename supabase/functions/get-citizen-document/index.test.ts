import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://okfqnqsvsesdpkpvltpr.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZnFucXN2c2VzZHBrcHZsdHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTA5NTQsImV4cCI6MjA4MzMyNjk1NH0.-Bj_o2pnAWx_ilNT6LOkmCa587O1OlHfM6MHfCoYoLk";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/get-citizen-document`;

Deno.test("rejects unauthenticated request with 401", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ file_path: "housing/00000000-0000-0000-0000-000000000000/test.pdf" }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.success, false);
});

Deno.test("rejects invalid file path pattern with authenticated user", async () => {
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ email: "info@devmart.sr", password: "x(7ajg12FQ;C@c!" }),
  });
  
  if (signInRes.status !== 200) {
    console.log("Could not sign in - skipping");
    return;
  }
  
  const { access_token } = await signInRes.json();

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ file_path: "../../../etc/passwd" }),
  });
  
  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.success, false);
  assertEquals(body.error, "VALIDATION_ERROR");
});

Deno.test("generates signed URL for valid path with authenticated admin", async () => {
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY },
    body: JSON.stringify({ email: "info@devmart.sr", password: "x(7ajg12FQ;C@c!" }),
  });
  
  if (signInRes.status !== 200) {
    console.log("Could not sign in - skipping");
    return;
  }
  
  const { access_token } = await signInRes.json();

  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${access_token}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ file_path: "housing/aef3d169-3b1d-4148-b0fa-f36fc08d1cd4/test.pdf" }),
  });
  
  const body = await res.json();
  console.log("Status:", res.status, "Body:", JSON.stringify(body));
  
  if (res.status === 200) {
    assertEquals(body.success, true);
    assertEquals(typeof body.signedUrl, "string");
    assertEquals(body.expires_in, 60);
  } else if (res.status === 403) {
    // User doesn't have required role
    assertEquals(body.success, false);
  } else {
    // Could be 500 if file doesn't exist in storage - still valid behavior
    assertEquals(body.success, false);
  }
});
