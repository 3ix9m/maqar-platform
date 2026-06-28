CREATE OR REPLACE FUNCTION public.handle_landlord_request_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only admins can approve landlord requests';
    END IF;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'landlord')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.landlords (user_id, full_name, phone)
    VALUES (NEW.user_id, NEW.full_name, NEW.phone)
    ON CONFLICT (user_id) DO UPDATE
      SET full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          updated_at = now();

    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := now();
  ELSIF NEW.status = 'rejected' AND (OLD.status IS DISTINCT FROM 'rejected') THEN
    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_landlord_request_review ON public.landlord_requests;
CREATE TRIGGER on_landlord_request_review
BEFORE UPDATE OF status ON public.landlord_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_landlord_request_approval();