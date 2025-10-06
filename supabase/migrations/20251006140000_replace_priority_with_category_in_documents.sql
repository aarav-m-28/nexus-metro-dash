ALTER TABLE public.documents
DROP COLUMN priority;

ALTER TABLE public.documents
ADD COLUMN category TEXT;
