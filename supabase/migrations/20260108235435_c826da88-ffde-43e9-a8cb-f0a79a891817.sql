-- Phase 10: Create generated-documents storage bucket with RLS policies
-- This migration creates a private bucket for storing generated DOCX files

-- Create the generated-documents bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('generated-documents', 'generated-documents', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Admin can upload documents (allowlist pattern)
CREATE POLICY "admin_can_upload_documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'generated-documents' AND
  ((current_setting('request.jwt.claims'::text, true)::json->>'email') = 'info@devmart.sr')
);

-- RLS Policy: Admin can download documents (allowlist pattern)
CREATE POLICY "admin_can_download_documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'generated-documents' AND
  ((current_setting('request.jwt.claims'::text, true)::json->>'email') = 'info@devmart.sr')
);

-- RLS Policy: No deletion allowed (documents are immutable)
CREATE POLICY "no_document_deletion"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'generated-documents' AND
  false
);