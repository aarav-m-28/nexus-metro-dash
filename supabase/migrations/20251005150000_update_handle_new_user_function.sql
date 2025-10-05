CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, role, course, section, year, department, subjects, classes)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'course',
    NEW.raw_user_meta_data->>'section',
    (NEW.raw_user_meta_data->>'year')::integer,
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'subjects',
    NEW.raw_user_meta_data->>'classes'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;