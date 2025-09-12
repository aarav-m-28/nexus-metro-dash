-- Drop the existing restrictive read policy on documents
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;

-- Create a new, more permissive read policy that allows users to see their own documents,
-- public documents, or documents shared with their department.
CREATE POLICY "Users can view their own, public, and department-shared documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
  -- User is the owner of the document
  (auth.uid() = user_id)
  
  -- OR the document is public
  OR (is_public = true)
  
  -- OR the document is shared with the user's department
  -- This requires a subquery to get the current user's department from their profile.
  OR (
    (SELECT department FROM public.profiles WHERE user_id = auth.uid()) = ANY(shared_with)
  )
);