
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS verified_renter boolean NOT NULL DEFAULT false;

-- Allow admins to update any student row (for toggling verified_renter)
DROP POLICY IF EXISTS "Admins manage students" ON public.students;
CREATE POLICY "Admins manage students"
ON public.students
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
