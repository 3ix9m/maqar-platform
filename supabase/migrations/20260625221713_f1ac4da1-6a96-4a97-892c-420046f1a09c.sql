
-- Fix: landlord_self_verify — prevent landlords from editing trust/ownership columns
CREATE OR REPLACE FUNCTION public.guard_property_trust_columns()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.verified IS DISTINCT FROM OLD.verified
     OR NEW.badge IS DISTINCT FROM OLD.badge
     OR NEW.previously_rented IS DISTINCT FROM OLD.previously_rented
     OR NEW.landlord_id IS DISTINCT FROM OLD.landlord_id THEN
    RAISE EXCEPTION 'Only admins can change verified, badge, previously_rented, or landlord_id';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_guard_property_trust ON public.properties;
CREATE TRIGGER trg_guard_property_trust
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.guard_property_trust_columns();

-- Fix: rating_no_constraints — clamp 1..5
ALTER TABLE public.property_ratings
  ADD CONSTRAINT chk_property_rating_range
  CHECK (cleanliness BETWEEN 1 AND 5
    AND internet BETWEEN 1 AND 5
    AND furniture BETWEEN 1 AND 5
    AND quietness BETWEEN 1 AND 5);

ALTER TABLE public.landlord_ratings
  ADD CONSTRAINT chk_landlord_rating_range
  CHECK (rating BETWEEN 1 AND 5);

-- Fix: student_status_override — split FOR ALL into verb-specific policies
DROP POLICY IF EXISTS "student own viewing" ON public.viewing_requests;
CREATE POLICY "student select viewing" ON public.viewing_requests
  FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "student insert viewing" ON public.viewing_requests
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "student delete viewing" ON public.viewing_requests
  FOR DELETE TO authenticated
  USING (student_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "admin update viewing" ON public.viewing_requests
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "student own housing" ON public.housing_requests;
CREATE POLICY "student select housing" ON public.housing_requests
  FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "student insert housing" ON public.housing_requests
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "student delete housing" ON public.housing_requests
  FOR DELETE TO authenticated
  USING (student_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "admin update housing" ON public.housing_requests
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

-- Fix: SUPA_authenticated_security_definer_function_executable
-- Convert has_role to SECURITY INVOKER. user_roles already has "users read own roles"
-- policy that allows the calling user to see their own rows, so has_role(auth.uid(), ...)
-- still works correctly for the existing call sites.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Fix: user_roles_self_assignment — add restrictive policy so even if a permissive
-- policy is ever added by mistake, only admins can write to user_roles.
CREATE POLICY "restrict role writes to admins"
  ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin'));

CREATE POLICY "restrict role updates to admins"
  ON public.user_roles
  AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

CREATE POLICY "restrict role deletes to admins"
  ON public.user_roles
  AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'));
