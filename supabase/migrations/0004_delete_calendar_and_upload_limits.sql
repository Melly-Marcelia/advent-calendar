-- 1. Delete-calendar RPC (token-gated, same pattern as the other writes).
--    Storage objects are NOT auto-deleted here (Storage isn't reachable from
--    plain SQL) — the client removes the calendar's storage folder first,
--    then calls this to drop the DB rows.
create or replace function public.delete_calendar(p_edit_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from calendars where edit_token = p_edit_token;
  if not found then
    raise exception 'not found';
  end if;
end;
$$;

grant execute on function public.delete_calendar(text) to anon;

-- 2. Server-side upload limits on the bucket itself (client-side accept=""
--    hints are trivially bypassable — this is enforced by Storage regardless
--    of what the browser sends).
update storage.buckets
set file_size_limit = 8388608, -- 8 MB
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
where id = 'calendar-assets';
