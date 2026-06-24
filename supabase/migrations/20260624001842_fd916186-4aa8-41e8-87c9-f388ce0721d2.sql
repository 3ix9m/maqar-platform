
CREATE POLICY "public read properties bucket" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'properties');
CREATE POLICY "admin write properties bucket" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'properties' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update properties bucket" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'properties' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete properties bucket" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'properties' AND public.has_role(auth.uid(),'admin'));
