
CREATE TABLE public.alert_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_id uuid NOT NULL REFERENCES public.price_alerts(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (alert_id, property_id)
);

GRANT SELECT, UPDATE, DELETE ON public.alert_matches TO authenticated;
GRANT ALL ON public.alert_matches TO service_role;

ALTER TABLE public.alert_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students read own matches"
  ON public.alert_matches FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students update own matches"
  ON public.alert_matches FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students delete own matches"
  ON public.alert_matches FOR DELETE TO authenticated
  USING (student_id = auth.uid());

CREATE INDEX alert_matches_student_idx ON public.alert_matches(student_id, read, created_at DESC);

-- Function: match new/updated property against existing alerts
CREATE OR REPLACE FUNCTION public.match_property_to_alerts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM 'متاحة' THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.alert_matches (student_id, alert_id, property_id)
  SELECT a.student_id, a.id, NEW.id
  FROM public.price_alerts a
  WHERE (a.area IS NULL OR a.area = '' OR NEW.area ILIKE '%' || a.area || '%')
    AND (a.type IS NULL OR a.type = '' OR NEW.type = a.type)
    AND (a.max_price IS NULL OR NEW.price <= a.max_price)
    AND (a.verified_only = false OR NEW.verified = true)
  ON CONFLICT (alert_id, property_id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_match_property_alerts_ins ON public.properties;
CREATE TRIGGER trg_match_property_alerts_ins
  AFTER INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.match_property_to_alerts();

DROP TRIGGER IF EXISTS trg_match_property_alerts_upd ON public.properties;
CREATE TRIGGER trg_match_property_alerts_upd
  AFTER UPDATE OF status, price, verified, area, type ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.match_property_to_alerts();
