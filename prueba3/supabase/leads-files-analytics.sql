-- Quote requests (leads), client file uploads and privacy-friendly site analytics.
-- Safe to re-run.

-- ── Helpers ─────────────────────────────────────────────────
create or replace function public.is_approved_client() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.access_requests
    where user_id = (select auth.uid()) and status = 'approved'
  );
$$;
grant execute on function public.is_approved_client() to authenticated;

-- ── Leads (quote form, public) ──────────────────────────────
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(btrim(name)) between 2 and 120),
  phone         text not null check (char_length(phone) between 7 and 30 and phone ~ '^[0-9+() .-]+$'),
  business_name text check (char_length(business_name) <= 120),
  business_type text check (char_length(business_type) <= 60),
  plan          text check (plan in ('Básico', 'Intermedio', 'Avanzado', 'No sé')),
  message       text check (char_length(message) <= 1000),
  status        text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'cerrado', 'descartado')),
  created_at    timestamptz not null default now()
);
create index if not exists leads_created_at_idx on public.leads (created_at desc);
alter table public.leads enable row level security;

drop policy if exists "Anyone can send a quote" on public.leads;
create policy "Anyone can send a quote" on public.leads
  for insert to anon, authenticated with check (status = 'nuevo');

drop policy if exists "Admins manage leads" on public.leads;
create policy "Admins manage leads" on public.leads
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

grant insert on public.leads to anon, authenticated;
grant select, update, delete on public.leads to authenticated;

-- Simple flood protection for the public form.
create or replace function public.leads_rate_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.leads where created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'too many requests, try again later';
  end if;
  return new;
end $$;

drop trigger if exists leads_rate_limit on public.leads;
create trigger leads_rate_limit before insert on public.leads
  for each row execute function public.leads_rate_limit();

-- ── Site analytics (only recorded after cookie consent; no IP, no identifiers) ──
create table if not exists public.site_events (
  id         bigint generated always as identity primary key,
  kind       text not null check (kind in ('view', 'whatsapp', 'quote')),
  path       text not null check (char_length(path) <= 200),
  referrer   text check (char_length(referrer) <= 200),
  device     text check (device in ('mobile', 'desktop')),
  created_at timestamptz not null default now()
);
create index if not exists site_events_created_at_idx on public.site_events (created_at desc);
alter table public.site_events enable row level security;

drop policy if exists "Anyone can record an event" on public.site_events;
create policy "Anyone can record an event" on public.site_events
  for insert to anon, authenticated with check (true);

drop policy if exists "Admins read events" on public.site_events;
create policy "Admins read events" on public.site_events
  for select to authenticated using ((select public.is_admin()));

grant insert on public.site_events to anon, authenticated;
grant select on public.site_events to authenticated;

create or replace function public.site_events_rate_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.site_events where created_at > now() - interval '1 minute') >= 600 then
    raise exception 'too many events';
  end if;
  return new;
end $$;

drop trigger if exists site_events_rate_limit on public.site_events;
create trigger site_events_rate_limit before insert on public.site_events
  for each row execute function public.site_events_rate_limit();

-- Aggregated numbers for the admin panel.
create or replace function public.analytics_summary(p_days int default 30) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  since timestamptz := now() - make_interval(days => greatest(1, least(p_days, 365)));
  result jsonb;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  with ev as (select * from public.site_events where created_at >= since)
  select jsonb_build_object(
    'views',    (select count(*) from ev where kind = 'view'),
    'whatsapp', (select count(*) from ev where kind = 'whatsapp'),
    'quotes',   (select count(*) from ev where kind = 'quote'),
    'mobile',   (select count(*) from ev where kind = 'view' and device = 'mobile'),
    'desktop',  (select count(*) from ev where kind = 'view' and device = 'desktop'),
    'by_day',   coalesce((select jsonb_agg(jsonb_build_object('day', d, 'views', n) order by d)
                  from (select (created_at at time zone 'America/Tegucigalpa')::date d, count(*) n
                        from ev where kind = 'view' group by 1) x), '[]'::jsonb),
    'top_pages', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'views', n) order by n desc)
                  from (select path, count(*) n from ev where kind = 'view' group by 1 order by 2 desc limit 8) x), '[]'::jsonb),
    'top_referrers', coalesce((select jsonb_agg(jsonb_build_object('referrer', referrer, 'views', n) order by n desc)
                  from (select coalesce(nullif(referrer, ''), 'Directo') referrer, count(*) n from ev where kind = 'view' group by 1 order by 2 desc limit 8) x), '[]'::jsonb)
  ) into result;
  return result;
end $$;

revoke execute on function public.analytics_summary(int) from public, anon;
grant execute on function public.analytics_summary(int) to authenticated;

-- ── Client files (private storage bucket) ───────────────────
-- Files live at client-files/<user id>/<file>. Approved clients manage their own folder;
-- admins can read and delete everything.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-files', 'client-files', false, 20971520,
  array[
    'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/heic',
    'application/pdf', 'application/zip', 'application/x-zip-compressed', 'text/plain',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do nothing;

drop policy if exists "Clients upload to own folder" on storage.objects;
create policy "Clients upload to own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'client-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.is_approved_client())
  );

drop policy if exists "Clients read own files, admins all" on storage.objects;
create policy "Clients read own files, admins all" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'client-files'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin()))
  );

drop policy if exists "Clients delete own files, admins all" on storage.objects;
create policy "Clients delete own files, admins all" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'client-files'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin()))
  );
