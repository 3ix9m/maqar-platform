
CREATE TABLE public.rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  landlord_id uuid REFERENCES public.landlords(id) ON DELETE SET NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, property_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rentals TO authenticated;
GRANT ALL ON public.rentals TO service_role;

ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student read own rentals" ON public.rentals
  FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR has_role(auth.uid(),'admin'));

CREATE POLICY "admin manage rentals" ON public.rentals
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_rentals_updated_at
  BEFORE UPDATE ON public.rentals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_rentals_student ON public.rentals(student_id);
CREATE INDEX idx_rentals_property ON public.rentals(property_id);

-- Helper: did this student rent this property?
CREATE OR REPLACE FUNCTION public.student_rented_property(_student_id uuid, _property_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rentals
    WHERE student_id = _student_id AND property_id = _property_id
  )
$$;

-- Tighten rating INSERT policies: only verified renters (or admin) may submit
DROP POLICY IF EXISTS "student write own property rating" ON public.property_ratings;
CREATE POLICY "verified renter writes property rating" ON public.property_ratings
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND (
      has_role(auth.uid(),'admin')
      OR public.student_rented_property(auth.uid(), property_id)
    )
  );

DROP POLICY IF EXISTS "student update own property rating" ON public.property_ratings;
CREATE POLICY "verified renter updates property rating" ON public.property_ratings
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (
    student_id = auth.uid()
    AND (
      has_role(auth.uid(),'admin')
      OR public.student_rented_property(auth.uid(), property_id)
    )
  );

DROP POLICY IF EXISTS "student write own landlord rating" ON public.landlord_ratings;
CREATE POLICY "verified renter writes landlord rating" ON public.landlord_ratings
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND (
      has_role(auth.uid(),'admin')
      OR EXISTS (
        SELECT 1 FROM public.rentals r
        WHERE r.student_id = auth.uid() AND r.landlord_id = landlord_ratings.landlord_id
      )
    )
  );

DROP POLICY IF EXISTS "student update own landlord rating" ON public.landlord_ratings;
CREATE POLICY "verified renter updates landlord rating" ON public.landlord_ratings
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (
    student_id = auth.uid()
    AND (
      has_role(auth.uid(),'admin')
      OR EXISTS (
        SELECT 1 FROM public.rentals r
        WHERE r.student_id = auth.uid() AND r.landlord_id = landlord_ratings.landlord_id
      )
    )
  );
