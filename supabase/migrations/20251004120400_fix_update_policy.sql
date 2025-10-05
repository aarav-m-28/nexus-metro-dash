-- Drop both the old and new policies to avoid conflicts
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile if not a student" ON public.profiles;

-- Create a new policy that allows users to update their own profile only if they are not a student
CREATE POLICY "Users can update their own profile if not a student"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = user_id AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) <> 'student'
);