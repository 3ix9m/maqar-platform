
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','student','landlord');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Students
CREATE TABLE public.students (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  university text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student read own" ON public.students FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "student insert own" ON public.students FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "student update own" ON public.students FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete student" ON public.students FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- Landlords (private — admins only)
CREATE TABLE public.landlords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.landlords TO authenticated;
GRANT ALL ON public.landlords TO service_role;
ALTER TABLE public.landlords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all landlords" ON public.landlords FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "landlord read self" ON public.landlords FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Properties (publicly browsable)
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid REFERENCES public.landlords(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'متاحة',
  area text,
  distance text,
  price numeric NOT NULL,
  rooms int NOT NULL DEFAULT 1,
  baths int NOT NULL DEFAULT 1,
  verified boolean NOT NULL DEFAULT false,
  previously_rented boolean NOT NULL DEFAULT false,
  badge text,
  cover_image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read properties" ON public.properties FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage properties" ON public.properties FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "landlord update own properties" ON public.properties FOR UPDATE TO authenticated
  USING (landlord_id IN (SELECT id FROM public.landlords WHERE user_id = auth.uid()));

CREATE TABLE public.property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.property_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_images TO authenticated;
GRANT ALL ON public.property_images TO service_role;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read images" ON public.property_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manage images" ON public.property_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Viewing requests
CREATE TABLE public.viewing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  preferred_date date,
  preferred_time time,
  notes text,
  status text NOT NULL DEFAULT 'قيد المراجعة',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.viewing_requests TO authenticated;
GRANT ALL ON public.viewing_requests TO service_role;
ALTER TABLE public.viewing_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student own viewing" ON public.viewing_requests FOR ALL TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Favorites
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, property_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student own favorites" ON public.favorites FOR ALL TO authenticated
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

-- Property ratings
CREATE TABLE public.property_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  cleanliness numeric,
  internet numeric,
  furniture numeric,
  quietness numeric,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, property_id)
);
GRANT SELECT ON public.property_ratings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_ratings TO authenticated;
GRANT ALL ON public.property_ratings TO service_role;
ALTER TABLE public.property_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read property ratings" ON public.property_ratings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "student write own property rating" ON public.property_ratings FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "student update own property rating" ON public.property_ratings FOR UPDATE TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY "student delete own property rating" ON public.property_ratings FOR DELETE TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Landlord ratings
CREATE TABLE public.landlord_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  landlord_id uuid REFERENCES public.landlords(id) ON DELETE CASCADE NOT NULL,
  rating numeric NOT NULL,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, landlord_id)
);
GRANT SELECT ON public.landlord_ratings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.landlord_ratings TO authenticated;
GRANT ALL ON public.landlord_ratings TO service_role;
ALTER TABLE public.landlord_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read landlord ratings" ON public.landlord_ratings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "student write own landlord rating" ON public.landlord_ratings FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "student update own landlord rating" ON public.landlord_ratings FOR UPDATE TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY "student delete own landlord rating" ON public.landlord_ratings FOR DELETE TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Housing requests
CREATE TABLE public.housing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  budget numeric,
  area text,
  notes text,
  status text NOT NULL DEFAULT 'نشط',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.housing_requests TO authenticated;
GRANT ALL ON public.housing_requests TO service_role;
ALTER TABLE public.housing_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student own housing" ON public.housing_requests FOR ALL TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (student_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_landlords_updated BEFORE UPDATE ON public.landlords FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_properties_updated BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_viewing_updated BEFORE UPDATE ON public.viewing_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_housing_updated BEFORE UPDATE ON public.housing_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create student profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.students (id, full_name, phone, university)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'university'
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
