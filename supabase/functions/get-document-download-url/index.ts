/**
 * Edge Function: get-document-download-url
 * Phase 8C - Structured Logging
 * 
 * Generates a signed download URL for a generated document.
 * 
 * Security:
 * - JWT required
 * - RBAC: system_admin, minister, project_leader, frontdesk_bouwsubsidie, admin_staff, audit
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { createLogger } from '../_shared/logger.ts'
import { corsHeaders } from '../_shared/cors.ts'

// Allowed roles for document download
const ALLOWED_ROLES = ['system_admin', 'minister', 'project_leader', 'frontdesk_bouwsubsidie', 'admin_staff', 'audit'];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const log = createLogger('get-document-download-url')

  try {
    log.info('request_started', { http_method: req.method })

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
      log.warn('auth_failed', { reason: 'missing_header' })
      return new Response(
        JSON.stringify({ success: false, error: "AUTH_MISSING", message: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use service role client for auth verification and data operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user token explicitly (required in serverless Deno context)
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !user) {
      log.warn('auth_failed', { reason: 'invalid_token' })
      return new Response(
        JSON.stringify({ success: false, error: "AUTH_INVALID", message: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // RBAC: Check user roles
    const { data: userRoles, error: rolesError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      log.error('unexpected_error', { step: 'role_fetch' }, 'AUTH_ERROR')
      return new Response(
        JSON.stringify({ success: false, error: "AUTH_ERROR", message: "Failed to verify authorization" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const roles = userRoles?.map(r => r.role) || [];
    const hasAccess = roles.some(role => ALLOWED_ROLES.includes(role));

    if (!hasAccess) {
      log.warn('rbac_denied')
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
      log.warn('validation_failed', { reason: 'invalid_uuid' })
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
      log.error('unexpected_error', { step: 'document_fetch' }, 'DOCUMENT_NOT_FOUND')
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
      log.error('unexpected_error', { step: 'signed_url_generation' }, 'URL_ERROR')
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

    log.info('download_url_generated', { document_type: docRecord.document_type })

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
    log.error('unexpected_error', { message: error instanceof Error ? error.message : 'Unknown error' }, 'UNHANDLED')
    return new Response(
      JSON.stringify({ success: false, error: "DOWNLOAD_ERROR", message: "Failed to generate download URL" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
