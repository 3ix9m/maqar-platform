
-- Landlord access requests submitted by students; admins approve to grant landlord role
CREATE TYPE public.landlord_request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.landlord_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  note TEXT,
  status public.landlord_request_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX landlord_requests_one_pending_per_user
  ON public.landlord_requests(user_id)
  WHERE status = 'pending';

GRANT SELECT, INSERT, UPDATE ON public.landlord_requests TO authenticated;
GRANT ALL ON public.landlord_requests TO service_role;

ALTER TABLE public.landlord_requests ENABLE ROW LEVEL SECURITY;

-- Users can see and create their own requests
CREATE POLICY "Users view own landlord requests" ON public.landlord_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own landlord requests" ON public.landlord_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Only admins can update (approve/reject)
CREATE POLICY "Admins update landlord requests" ON public.landlord_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER landlord_requests_updated_at
  BEFORE UPDATE ON public.landlord_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- When a request is approved, grant the landlord role and ensure a landlord row exists
CREATE OR REPLACE FUNCTION public.handle_landlord_request_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only admins can approve landlord requests';
    END IF;
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.user_id, 'landlord')
      ON CONFLICT DO NOTHING;
    INSERT INTO public.landlords (id, full_name, phone, verified)
      VALUES (NEW.user_id, NEW.full_name, NEW.phone, true)
      ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone;
    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := now();
  ELSIF NEW.status = 'rejected' AND (OLD.status IS DISTINCT FROM 'rejected') THEN
    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER landlord_requests_on_approval
  BEFORE UPDATE ON public.landlord_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_landlord_request_approval();
