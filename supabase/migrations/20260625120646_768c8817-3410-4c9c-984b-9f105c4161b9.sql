
CREATE POLICY "landlord read own property requests" ON public.viewing_requests
  FOR SELECT TO authenticated
  USING (property_id IN (SELECT p.id FROM public.properties p JOIN public.landlords l ON l.id = p.landlord_id WHERE l.user_id = auth.uid()));
