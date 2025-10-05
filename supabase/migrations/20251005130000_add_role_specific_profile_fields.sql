ALTER TABLE profiles
ADD COLUMN subjects text[],
ADD COLUMN classes text[],
ADD COLUMN class_subjects jsonb,
ADD COLUMN department text;