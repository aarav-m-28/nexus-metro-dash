-- Rename columns in the 'profiles' table to be more student-centric
ALTER TABLE public.profiles
RENAME COLUMN department TO course;

ALTER TABLE public.profiles
RENAME COLUMN job_title TO major;

-- Add a 'tags' column to the 'documents' table for better organization
ALTER TABLE public.documents
ADD COLUMN tags TEXT[];
