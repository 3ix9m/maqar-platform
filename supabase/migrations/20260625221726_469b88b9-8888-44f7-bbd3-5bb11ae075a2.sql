
CREATE OR REPLACE FUNCTION public.guard_property_trust_columns()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
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

REVOKE EXECUTE ON FUNCTION public.guard_property_trust_columns() FROM PUBLIC, anon, authenticated;
