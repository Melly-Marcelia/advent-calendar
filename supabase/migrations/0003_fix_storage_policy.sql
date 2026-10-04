-- Fix: the storage policies' EXISTS subquery against `calendars` was being
-- blocked by RLS on that table (RLS applies even to subqueries run from
-- inside another policy). A SECURITY DEFINER helper bypasses that for just
-- this one lookup, the same way the RPC functions already do.

create or replace function public.calendar_edit_token_matches(p_calendar_id text, p_edit_token text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from calendars c
    where c.id::text = p_calendar_id and c.edit_token = p_edit_token
  );
$$;

grant execute on function public.calendar_edit_token_matches(text, text) to anon, authenticated;

drop policy if exists "edit token holder can upload" on storage.objects;
drop policy if exists "edit token holder can update own assets" on storage.objects;
drop policy if exists "edit token holder can delete own assets" on storage.objects;

create policy "edit token holder can upload"
on storage.objects for insert
with check (
  bucket_id = 'calendar-assets'
  and public.calendar_edit_token_matches((storage.foldername(name))[1], (storage.foldername(name))[2])
);

create policy "edit token holder can update own assets"
on storage.objects for update
using (
  bucket_id = 'calendar-assets'
  and public.calendar_edit_token_matches((storage.foldername(name))[1], (storage.foldername(name))[2])
);

create policy "edit token holder can delete own assets"
on storage.objects for delete
using (
  bucket_id = 'calendar-assets'
  and public.calendar_edit_token_matches((storage.foldername(name))[1], (storage.foldername(name))[2])
);
