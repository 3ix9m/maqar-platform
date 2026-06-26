
-- Properties: landlord insert/delete own
CREATE POLICY "landlord insert own properties" ON public.properties
  FOR INSERT TO authenticated
  WITH CHECK (landlord_id IN (SELECT id FROM public.landlords WHERE user_id = auth.uid()));

CREATE POLICY "landlord delete own properties" ON public.properties
  FOR DELETE TO authenticated
  USING (landlord_id IN (SELECT id FROM public.landlords WHERE user_id = auth.uid()));

-- Property images: landlord manage own
CREATE POLICY "landlord insert own images" ON public.property_images
  FOR INSERT TO authenticated
  WITH CHECK (property_id IN (
    SELECT p.id FROM public.properties p
    JOIN public.landlords l ON l.id = p.landlord_id
    WHERE l.user_id = auth.uid()
  ));

CREATE POLICY "landlord delete own images" ON public.property_images
  FOR DELETE TO authenticated
  USING (property_id IN (
    SELECT p.id FROM public.properties p
    JOIN public.landlords l ON l.id = p.landlord_id
    WHERE l.user_id = auth.uid()
  ));

-- Storage: landlords can write to properties bucket
CREATE POLICY "landlord write properties bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'properties' AND public.has_role(auth.uid(), 'landlord'));

CREATE POLICY "landlord update properties bucket" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'properties' AND public.has_role(auth.uid(), 'landlord'));

CREATE POLICY "landlord delete properties bucket" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'properties' AND public.has_role(auth.uid(), 'landlord'));
