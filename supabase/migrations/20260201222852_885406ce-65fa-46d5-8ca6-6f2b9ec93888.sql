-- V1.3 Phase 5A: Storage bucket for citizen document uploads
-- Create public storage bucket for citizen uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('citizen-uploads', 'citizen-uploads', true);

-- Allow anonymous users to upload documents
CREATE POLICY "anon_can_upload_citizen_documents"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'citizen-uploads');

-- Allow anonymous users to read their own uploads (for preview)
CREATE POLICY "anon_can_read_citizen_documents"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'citizen-uploads');

-- Allow authenticated staff to read all citizen uploads
CREATE POLICY "staff_can_read_citizen_documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'citizen-uploads');

-- Allow anonymous insert for public submissions on subsidy_document_upload
CREATE POLICY "anon_can_insert_document_upload"
ON public.subsidy_document_upload FOR INSERT TO anon
WITH CHECK (true);