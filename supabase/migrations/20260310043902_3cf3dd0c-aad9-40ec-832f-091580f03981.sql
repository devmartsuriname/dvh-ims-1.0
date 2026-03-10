-- Phase 12: Harden citizen-uploads bucket
-- 1. Set bucket to private, add file size limit and MIME type restrictions
UPDATE storage.buckets
SET public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png']
WHERE id = 'citizen-uploads';

-- 2. Remove anonymous SELECT policy (no longer needed — signed URLs via service role)
DROP POLICY IF EXISTS "anon_can_read_citizen_documents" ON storage.objects;

-- 3. Add no-deletion policy for citizen-uploads
CREATE POLICY "no_citizen_document_deletion"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'citizen-uploads' AND false
);