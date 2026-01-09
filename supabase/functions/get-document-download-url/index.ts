import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Allowed roles for document download
const ALLOWED_ROLES = ['system_admin', 'minister', 'project_leader', 'frontdesk_bouwsubsidie', 'admin_staff', 'audit'];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "AUTH_MISSING", message: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's token to verify identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "AUTH_INVALID", message: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client for data operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // RBAC: Check user roles
    const { data: userRoles, error: rolesError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('Failed to fetch user roles');
      return new Response(
        JSON.stringify({ success: false, error: "AUTH_ERROR", message: "Failed to verify authorization" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const roles = userRoles?.map(r => r.role) || [];
    const hasAccess = roles.some(role => ALLOWED_ROLES.includes(role));

    if (!hasAccess) {
      console.error("RBAC check failed - insufficient permissions");
      return new Response(
        JSON.stringify({ success: false, error: "AUTH_FORBIDDEN", message: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { document_id } = body;

    // Validate document_id UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!document_id || !uuidRegex.test(document_id)) {
      return new Response(
        JSON.stringify({ success: false, error: "VALIDATION_UUID", message: "Invalid document_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch document record
    const { data: docRecord, error: docError } = await adminClient
      .from("generated_document")
      .select("id, case_id, file_path, file_name, document_type")
      .eq("id", document_id)
      .single();

    if (docError || !docRecord) {
      console.error("Document not found:", docError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "DOCUMENT_NOT_FOUND", message: "Document not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate signed URL (1 hour expiry)
    const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
      .from("generated-documents")
      .createSignedUrl(docRecord.file_path, 3600);

    if (signedUrlError || !signedUrlData) {
      console.error("Signed URL error:", signedUrlError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "URL_ERROR", message: "Failed to generate download URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log audit event for download
    await adminClient.from("audit_event").insert({
      entity_type: "generated_document",
      action: "document_downloaded",
      entity_id: document_id,
      actor_user_id: user.id,
      actor_role: roles[0] || 'unknown',
      metadata_json: {
        case_id: docRecord.case_id,
        file_name: docRecord.file_name,
        download_timestamp: new Date().toISOString(),
      },
    });

    console.log(`Download URL generated for document: ${docRecord.file_name}`);

    return new Response(
      JSON.stringify({
        success: true,
        download_url: signedUrlData.signedUrl,
        file_name: docRecord.file_name,
        expires_in: 3600,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "DOWNLOAD_ERROR", message: "Failed to generate download URL" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
