
CREATE TABLE public.permission_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  request_type TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_by UUID REFERENCES public.profiles(user_id)
);

ALTER TABLE public.permission_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow students to create permission requests"
ON public.permission_requests
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'student' AND
  user_id = auth.uid()
);

CREATE POLICY "Allow users to see their own permission requests"
ON public.permission_requests
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Allow faculty_advisor and hod to see all permission requests"
ON public.permission_requests
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('faculty_advisor', 'hod')
);

CREATE POLICY "Allow faculty_advisor and hod to update permission requests"
ON public.permission_requests
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('faculty_advisor', 'hod')
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) IN ('faculty_advisor', 'hod')
);
