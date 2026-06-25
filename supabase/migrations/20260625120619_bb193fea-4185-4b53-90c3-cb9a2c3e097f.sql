
-- 1) Fix INSERT policies missing WITH CHECK (impersonation risk)
DROP POLICY IF EXISTS "student write own property rating" ON public.property_ratings;
CREATE POLICY "student write own property rating" ON public.property_ratings
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "student write own landlord rating" ON public.landlord_ratings;
CREATE POLICY "student write own landlord rating" ON public.landlord_ratings
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

-- 2) Tighten students INSERT (handle_new_user runs as definer, so RLS bypassed there)
DROP POLICY IF EXISTS "student insert own" ON public.students;
CREATE POLICY "student insert own" ON public.students
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 3) Promote Mouaz Essam to admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('5309c6fb-b7be-4f5e-ba46-c6cbb5f18bb0', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 4) Seed a sample landlord + properties for the empty database
INSERT INTO public.landlords (id, full_name, phone, email, notes)
VALUES ('11111111-1111-1111-1111-111111111111', 'الأستاذ أحمد سيد', '01000000000', 'ahmed@example.com', 'مالك تجريبي')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id, landlord_id, title, description, type, status, area, distance, price, rooms, baths, verified, previously_rented, badge, cover_image)
VALUES
  ('22222222-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'شقة فاخرة بجوار جامعة ميريت', 'شقة مفروشة بالكامل، إنترنت سريع، تكييف، قريبة جداً من الجامعة.',
   'شقة كاملة', 'متاحة', 'الحي السابع', '5 دقائق من الجامعة', 4500, 3, 2, true, true, 'الأكثر طلباً', null),
  ('22222222-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'أوضة مفروشة هادئة للطلاب', 'غرفة مستقلة في شقة طلابية، مناسبة للدراسة.',
   'أوضة مفروشة', 'متاحة', 'الحي الثاني', '10 دقائق من الجامعة', 1800, 1, 1, true, false, 'أفضل قيمة', null),
  ('22222222-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'سرير في غرفة مشتركة', 'سرير في غرفة لطالبين، تشمل المرافق.',
   'سرير', 'متاحة', 'الحي الأول', '7 دقائق من الجامعة', 900, 1, 1, false, false, null, null),
  ('22222222-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'شقة عائلية واسعة قرب الجامعة', 'شقة 3 غرف، مناسبة لمجموعة طلاب.',
   'شقة كاملة', 'محجوزة', 'الحي الثالث', '12 دقيقة من الجامعة', 5500, 3, 2, true, true, null, null)
ON CONFLICT (id) DO NOTHING;
