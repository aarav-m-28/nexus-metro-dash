-- Fix security issues from the previous migration

-- 1. Enable RLS on the new tables
ALTER TABLE public.sample_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_departments ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for sample_documents (read-only for authenticated users)
CREATE POLICY "Authenticated users can view sample documents"
ON public.sample_documents
FOR SELECT
TO authenticated
USING (true);

-- 3. Create RLS policies for sample_departments (read-only for authenticated users)  
CREATE POLICY "Authenticated users can view sample departments"
ON public.sample_departments
FOR SELECT
TO authenticated
USING (true);

-- 4. Fix search path for the functions
CREATE OR REPLACE FUNCTION public.populate_user_documents()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert 3-5 random sample documents for the new user
  INSERT INTO public.documents (user_id, title, description, file_name, file_size, file_type, storage_path, is_public)
  SELECT 
    NEW.user_id,
    title,
    description,
    file_name,
    file_size,
    file_type,
    NEW.user_id::text || '/' || file_name,
    is_public
  FROM public.sample_documents
  ORDER BY RANDOM()
  LIMIT 4;
  
  RETURN NEW;
END;
$$;

-- 5. Fix search path for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dept_record RECORD;
  selected_job_title TEXT;
BEGIN
  -- Get a random department and job title
  SELECT department, job_titles INTO dept_record
  FROM public.sample_departments
  ORDER BY RANDOM()
  LIMIT 1;
  
  -- Pick a random job title from the selected department
  selected_job_title := dept_record.job_titles[floor(random() * array_length(dept_record.job_titles, 1) + 1)];
  
  INSERT INTO public.profiles (user_id, email, display_name, department, job_title)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    dept_record.department,
    selected_job_title
  );
  RETURN NEW;
END;
$$;