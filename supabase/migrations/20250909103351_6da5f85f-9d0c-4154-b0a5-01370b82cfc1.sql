
-- 1) Extend profiles with department and job_title (current post)
alter table public.profiles
  add column if not exists department text,
  add column if not exists job_title text;

-- 2) Auto-update updated_at on profiles/documents using existing function public.update_updated_at_column()
-- Profiles
drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Documents
drop trigger if exists set_updated_at_documents on public.documents;
create trigger set_updated_at_documents
before update on public.documents
for each row execute function public.update_updated_at_column();

-- 3) Storage RLS for private "documents" bucket
-- Ensure authenticated users can only manage files in their own folder: "<user_id>/...".
-- SELECT
drop policy if exists "Users can read own files" on storage.objects;
create policy "Users can read own files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'documents'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- INSERT
drop policy if exists "Users can upload to own folder" on storage.objects;
create policy "Users can upload to own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'documents'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- UPDATE
drop policy if exists "Users can update own files" on storage.objects;
create policy "Users can update own files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'documents'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- DELETE
drop policy if exists "Users can delete own files" on storage.objects;
create policy "Users can delete own files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'documents'
  and split_part(name, '/', 1) = auth.uid()::text
);
