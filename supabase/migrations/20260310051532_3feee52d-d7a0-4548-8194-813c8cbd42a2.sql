
CREATE TABLE public.qr_scan_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_type text NOT NULL CHECK (qr_type IN ('woningregistratie', 'bouwsubsidie')),
  scanned_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text,
  user_agent text,
  district_guess text
);

ALTER TABLE public.qr_scan_event ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_select_qr_scan_event" ON public.qr_scan_event
  FOR SELECT TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['system_admin','project_leader','minister','director','audit']::app_role[])
  );
