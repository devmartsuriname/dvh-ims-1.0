/**
 * Edge Function: get-citizen-document
 * Phase 12 — Secure Document Storage
 *
 * Generates a short-lived signed URL for citizen-uploaded documents.
 *
 * Security:
 * - JWT required (verify_jwt = true)
 * - RBAC: all staff roles
 * - Path validation: housing/<uuid>/<filename> or bouwsubsidie/<uuid>/<filename>
 * - Rate limit: 30/IP/hour
 * - Audit logged
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { createLogger } from '../_shared/logger.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createRateLimiter } from '../_shared/rate-limit.ts'

const ALLOWED_ROLES = [
  'system_admin', 'minister', 'project_leader',
  'frontdesk_housing', 'frontdesk_bouwsubsidie',
  'admin_staff', 'audit', 'director',
  'ministerial_advisor', 'social_field_worker', 'technical_inspector',
];

// Path must be: housing/<uuid>/<filename> or bouwsubsidie/<uuid>/<filename>
const PATH_PATTERN = /^(housing|bouwsubsidie)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[^/]+$/i;

const rateLimiter = createRateLimiter(30, 60 * 60 * 1000);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const log = createLogger('get-citizen-document');

  try {
    log.info('request_started', { http_method: req.method });

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!rateLimiter.check(clientIP)) {
      log.warn('rate_limit_exceeded', { ip_hash: clientIP.substring(0, 8) });
      return new Response(
        JSON.stringify({ success: false, error: "RATE_LIMIT", message: "Too many requests" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      log.warn('auth_failed', { reason: 'missing_header' });
      return new Response(
        JSON.stringify({ success: false, error: "AUTH_MISSING", message: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use service role client for auth verification and data operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user token explicitly (required in serverless Deno context)
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await adminClient.auth.getUser(token);
    if (userError || !user) {
      log.warn('auth_failed', { reason: 'invalid_token' });
      return new Response(
        JSON.stringify({ success: false, error: "AUTH_INVALID", message: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // RBAC
    const { data: userRoles, error: rolesError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      log.error('unexpected_error', { step: 'role_fetch' }, 'AUTH_ERROR');
      return new Response(
        JSON.stringify({ success: false, error: "AUTH_ERROR", message: "Failed to verify authorization" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const roles = userRoles?.map(r => r.role) || [];
    const hasAccess = roles.some(role => ALLOWED_ROLES.includes(role));

    if (!hasAccess) {
      log.warn('rbac_denied', { user_id: user.id });
      return new Response(
        JSON.stringify({ success: false, error: "AUTH_FORBIDDEN", message: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse & validate
    const body = await req.json();
    const { file_path } = body;

    if (!file_path || typeof file_path !== 'string') {
      log.warn('validation_failed', { reason: 'missing_file_path' });
      return new Response(
        JSON.stringify({ success: false, error: "VALIDATION_ERROR", message: "file_path is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!PATH_PATTERN.test(file_path)) {
      log.warn('validation_failed', { reason: 'invalid_path_pattern' });
      return new Response(
        JSON.stringify({ success: false, error: "VALIDATION_ERROR", message: "Invalid file path format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate signed URL (60 seconds)
    const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
      .from("citizen-uploads")
      .createSignedUrl(file_path, 60);

    if (signedUrlError || !signedUrlData) {
      log.error('unexpected_error', { step: 'signed_url_generation' }, 'URL_ERROR');
      return new Response(
        JSON.stringify({ success: false, error: "URL_ERROR", message: "Failed to generate document URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Audit log
    await adminClient.from("audit_event").insert({
      entity_type: "citizen_document",
      action: "CITIZEN_DOCUMENT_ACCESSED",
      entity_id: file_path.split('/')[1] || null,
      actor_user_id: user.id,
      actor_role: roles[0] || 'unknown',
      metadata_json: {
        file_path,
        access_timestamp: new Date().toISOString(),
      },
    });

    log.info('signed_url_generated', { path_prefix: file_path.split('/')[0] });

    return new Response(
      JSON.stringify({
        success: true,
        signedUrl: signedUrlData.signedUrl,
        expires_in: 60,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    log.error('unexpected_error', { message: error instanceof Error ? error.message : 'Unknown error' }, 'UNHANDLED');
    return new Response(
      JSON.stringify({ success: false, error: "INTERNAL_ERROR", message: "Failed to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
