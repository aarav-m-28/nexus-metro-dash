
CREATE TABLE public.faculty_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES public.profiles(user_id),
  course TEXT NOT NULL,
  year INT NOT NULL,
  section TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (faculty_id, course, year, section)
);

ALTER TABLE public.faculty_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow faculty to see their own assignments"
ON public.faculty_assignments
FOR SELECT
TO authenticated
USING (
  faculty_id = auth.uid()
);

CREATE POLICY "Allow HOD to see all assignments"
ON public.faculty_assignments
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'hod'
);

CREATE POLICY "Allow HOD to create assignments"
ON public.faculty_assignments
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'hod'
);

CREATE POLICY "Allow HOD to update assignments"
ON public.faculty_assignments
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'hod'
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'hod'
);

CREATE POLICY "Allow HOD to delete assignments"
ON public.faculty_assignments
FOR DELETE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'hod'
);
