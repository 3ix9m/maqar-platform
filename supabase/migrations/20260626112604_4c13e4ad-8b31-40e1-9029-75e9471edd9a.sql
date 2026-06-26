
-- Tighten properties bucket policies: landlords may only write/update/delete files
-- under folders matching their own properties. Admins keep full access.

DROP POLICY IF EXISTS "landlord write" ON storage.objects;
DROP POLICY IF EXISTS "landlord update" ON storage.objects;
DROP POLICY IF EXISTS "landlord delete" ON storage.objects;

CREATE POLICY "landlord write own property files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'properties'
  AND public.has_role(auth.uid(), 'landlord')
  AND EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.landlords l ON l.id = p.landlord_id
    WHERE l.user_id = auth.uid()
      AND p.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "landlord update own property files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'properties'
  AND public.has_role(auth.uid(), 'landlord')
  AND EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.landlords l ON l.id = p.landlord_id
    WHERE l.user_id = auth.uid()
      AND p.id::text = (storage.foldername(name))[1]
  )
)
WITH CHECK (
  bucket_id = 'properties'
  AND public.has_role(auth.uid(), 'landlord')
  AND EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.landlords l ON l.id = p.landlord_id
    WHERE l.user_id = auth.uid()
      AND p.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "landlord delete own property files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'properties'
  AND public.has_role(auth.uid(), 'landlord')
  AND EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.landlords l ON l.id = p.landlord_id
    WHERE l.user_id = auth.uid()
      AND p.id::text = (storage.foldername(name))[1]
  )
);
