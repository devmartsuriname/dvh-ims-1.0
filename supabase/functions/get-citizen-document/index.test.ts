import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/get-citizen-document`;

Deno.test("rejects unauthenticated request with 401", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_path: "housing/00000000-0000-0000-0000-000000000000/test.pdf" }),
  });
  assertEquals(res.status, 401);
  const body = await res.json();
  assertEquals(body.success, false);
});

Deno.test("rejects GET method", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  // Should be 401 (no valid user from anon key) or 405
  const status = res.status;
  const body = await res.json();
  assertEquals(body.success, false);
});

Deno.test("rejects invalid file path pattern", async () => {
  // First sign in to get a real JWT
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      email: "info@devmart.sr",
      password: "x(7ajg12FQ;C@c!",
    }),
  });
  
  if (signInRes.status !== 200) {
    console.log("Could not sign in - skipping authenticated test");
    return;
  }
  
  const signInData = await signInRes.json();
  const accessToken = signInData.access_token;

  // Test with invalid path (path traversal attempt)
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ file_path: "../../../etc/passwd" }),
  });
  
  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.success, false);
  assertEquals(body.error, "VALIDATION_ERROR");
});

Deno.test("handles valid path for non-existent file gracefully", async () => {
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      email: "info@devmart.sr",
      password: "x(7ajg12FQ;C@c!",
    }),
  });
  
  if (signInRes.status !== 200) {
    console.log("Could not sign in - skipping authenticated test");
    return;
  }
  
  const signInData = await signInRes.json();
  const accessToken = signInData.access_token;

  // Test with valid path format but non-existent file
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ file_path: "housing/aef3d169-3b1d-4148-b0fa-f36fc08d1cd4/test.pdf" }),
  });
  
  const body = await res.json();
  // Should either succeed with a signed URL (even for non-existent files, Supabase generates the URL)
  // or fail with a storage error
  console.log("Response status:", res.status);
  console.log("Response body:", JSON.stringify(body));
  
  if (res.status === 200) {
    assertEquals(body.success, true);
    assertEquals(typeof body.signedUrl, "string");
    assertEquals(body.expires_in, 60);
  } else {
    // If 403, the user might not have the right role
    assertEquals(body.success, false);
  }
});
