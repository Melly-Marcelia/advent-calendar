-- Advent Calendar: no-login, token-gated multi-tenant schema.
--
-- Access model:
--   - Nobody logs in. Each calendar has an `edit_token` (secret, holder can edit)
--     and a `share_token` (given out freely, holder can only view).
--   - Tables have RLS enabled with NO permissive policies, so anon/authenticated
--     roles cannot SELECT/INSERT/UPDATE the tables directly via PostgREST.
--   - All access goes through the RPC functions below (SECURITY DEFINER), which
--     validate the caller's token server-side before touching data. This keeps
--     edit_token out of any response the share-link holder could see.
--
-- Run this whole file once in the Supabase SQL editor on a fresh project.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.calendars (
  id uuid primary key default gen_random_uuid(),
  edit_token text not null unique default encode(gen_random_bytes(18), 'hex'),
  share_token text not null unique default encode(gen_random_bytes(18), 'hex'),
  title text not null default 'Advent Calendar',
  subtitle text not null default 'Open one door each day of December to reveal a little surprise',
  year int not null default extract(year from now())::int,
  unlock_mode text not null default 'date' check (unlock_mode in ('date', 'always')),
  created_at timestamptz not null default now()
);

create table public.frames (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid not null references public.calendars(id) on delete cascade,
  day int not null check (day between 1 and 24),
  message text not null default '',
  gift_image_path text,
  gift_code_path text,
  default_image_path text,  -- custom theme override; null = fall back to bundled built-in art
  hover_image_path text,
  unique (calendar_id, day)
);

alter table public.calendars enable row level security;
alter table public.frames enable row level security;
-- Intentionally no policies: direct table access via PostgREST is fully closed.
-- Everything below goes through SECURITY DEFINER functions instead.

-- ---------------------------------------------------------------------------
-- Create a new calendar (called once, from the "make your own calendar" flow)
-- ---------------------------------------------------------------------------

create or replace function public.create_calendar()
returns table (calendar_id uuid, edit_token text, share_token text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_edit_token text;
  v_share_token text;
begin
  insert into calendars default values
  returning id, calendars.edit_token, calendars.share_token
  into v_id, v_edit_token, v_share_token;

  insert into frames (calendar_id, day)
  select v_id, d from generate_series(1, 24) as d;

  return query select v_id, v_edit_token, v_share_token;
end;
$$;

-- ---------------------------------------------------------------------------
-- Read: share link (public, view-only — never returns edit_token)
-- ---------------------------------------------------------------------------

create or replace function public.get_calendar_by_share_token(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_calendar calendars%rowtype;
  v_result json;
begin
  select * into v_calendar from calendars where share_token = p_token;
  if not found then
    raise exception 'not found';
  end if;

  select json_build_object(
    'id', v_calendar.id,
    'title', v_calendar.title,
    'subtitle', v_calendar.subtitle,
    'year', v_calendar.year,
    'unlock_mode', v_calendar.unlock_mode,
    'frames', (
      select json_agg(json_build_object(
        'day', f.day,
        'message', f.message,
        'gift_image_path', f.gift_image_path,
        'gift_code_path', f.gift_code_path,
        'default_image_path', f.default_image_path,
        'hover_image_path', f.hover_image_path
      ) order by f.day)
      from frames f where f.calendar_id = v_calendar.id
    )
  ) into v_result;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Read: edit link (owner dashboard — includes both tokens for display)
-- ---------------------------------------------------------------------------

create or replace function public.get_calendar_by_edit_token(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_calendar calendars%rowtype;
  v_result json;
begin
  select * into v_calendar from calendars where edit_token = p_token;
  if not found then
    raise exception 'not found';
  end if;

  select json_build_object(
    'id', v_calendar.id,
    'title', v_calendar.title,
    'subtitle', v_calendar.subtitle,
    'year', v_calendar.year,
    'unlock_mode', v_calendar.unlock_mode,
    'edit_token', v_calendar.edit_token,
    'share_token', v_calendar.share_token,
    'frames', (
      select json_agg(json_build_object(
        'day', f.day,
        'message', f.message,
        'gift_image_path', f.gift_image_path,
        'gift_code_path', f.gift_code_path,
        'default_image_path', f.default_image_path,
        'hover_image_path', f.hover_image_path
      ) order by f.day)
      from frames f where f.calendar_id = v_calendar.id
    )
  ) into v_result;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Write: update calendar-level settings (title/subtitle/unlock mode)
-- ---------------------------------------------------------------------------

create or replace function public.update_calendar_settings(
  p_edit_token text,
  p_title text,
  p_subtitle text,
  p_unlock_mode text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update calendars
  set title = coalesce(p_title, title),
      subtitle = coalesce(p_subtitle, subtitle),
      unlock_mode = coalesce(p_unlock_mode, unlock_mode)
  where edit_token = p_edit_token;

  if not found then
    raise exception 'not found';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Write: update one frame's content (message + image paths)
-- ---------------------------------------------------------------------------

create or replace function public.update_frame(
  p_edit_token text,
  p_day int,
  p_message text,
  p_gift_image_path text,
  p_gift_code_path text,
  p_default_image_path text,
  p_hover_image_path text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_calendar_id uuid;
begin
  select id into v_calendar_id from calendars where edit_token = p_edit_token;
  if not found then
    raise exception 'not found';
  end if;

  update frames
  set message = coalesce(p_message, message),
      gift_image_path = coalesce(p_gift_image_path, gift_image_path),
      gift_code_path = coalesce(p_gift_code_path, gift_code_path),
      default_image_path = coalesce(p_default_image_path, default_image_path),
      hover_image_path = coalesce(p_hover_image_path, hover_image_path)
  where calendar_id = v_calendar_id and day = p_day;
end;
$$;

-- Only the anon role calls these (no Supabase Auth / logged-in users involved).
grant execute on function
  public.create_calendar(),
  public.get_calendar_by_share_token(text),
  public.get_calendar_by_edit_token(text),
  public.update_calendar_settings(text, text, text, text),
  public.update_frame(text, int, text, text, text, text, text)
to anon;

-- ---------------------------------------------------------------------------
-- Storage: bucket + path-gated policies
--   Upload path shape: {calendar_id}/{edit_token}/<filename>
--   Only someone who already knows a calendar's real edit_token can write
--   into its folder. Reads are public (share-page images must be viewable).
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('calendar-assets', 'calendar-assets', true)
on conflict (id) do nothing;

create policy "public read of calendar assets"
on storage.objects for select
using (bucket_id = 'calendar-assets');

-- RLS on `calendars` blocks reads from anywhere, including subqueries run
-- from inside another table's policy — so the folder-ownership check below
-- goes through a SECURITY DEFINER helper that can see the row anyway.
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
