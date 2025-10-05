-- Add role, section, and year to the profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS section TEXT,
ADD COLUMN IF NOT EXISTS "year" INTEGER;

-- Drop the major column as it might be redundant with course
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS major;
