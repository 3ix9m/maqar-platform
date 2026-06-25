
CREATE TABLE public.price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area text,
  type text,
  max_price numeric,
  verified_only boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_alerts TO authenticated;
GRANT ALL ON public.price_alerts TO service_role;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alerts select" ON public.price_alerts FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "own alerts insert" ON public.price_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "own alerts delete" ON public.price_alerts FOR DELETE TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "admin manage alerts" ON public.price_alerts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX price_alerts_student_idx ON public.price_alerts(student_id);
