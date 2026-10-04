-- Fix: Postgres encode() doesn't support 'base64url', only 'hex'/'base64'/'escape'.
alter table public.calendars
  alter column edit_token set default encode(gen_random_bytes(18), 'hex');

alter table public.calendars
  alter column share_token set default encode(gen_random_bytes(18), 'hex');
