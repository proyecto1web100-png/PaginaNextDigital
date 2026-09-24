-- NextDigital client portal (Google sign-in + manual approval).
-- Applied automatically by the Supabase GitHub integration (or run in SQL Editor). Safe to re-run.
--
-- Flow:
--   1. Anyone who signs in with Google gets an auth user and a *pending* access request (trigger below).
--   2. An admin approves the request from /portal/ and links a project (approve_client).
--   3. The client then sees only their own project(s) (Row Level Security).

-- ── Admins ──────────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;

drop policy if exists "Admins see themselves" on public.admins;
create policy "Admins see themselves" on public.admins
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

-- ── Access requests ─────────────────────────────────────────
create table if not exists public.access_requests (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now(),
  decided_at  timestamptz
);
alter table public.access_requests enable row level security;

drop policy if exists "Users read own request" on public.access_requests;
create policy "Users read own request" on public.access_requests
  for select to authenticated using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists "Admins update requests" on public.access_requests;
create policy "Admins update requests" on public.access_requests
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Every new Google user starts as a pending request.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.access_requests (user_id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Projects ────────────────────────────────────────────────
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  plan        text check (plan in ('Básico', 'Intermedio', 'Avanzado')),
  status      text not null default 'diseño'
              check (status in ('diseño', 'desarrollo', 'revisión', 'publicado')),
  progress    int  not null default 0 check (progress between 0 and 100),
  next_step   text,
  site_url    text,
  updated_at  timestamptz not null default now()
);
create index if not exists projects_client_id_idx on public.projects (client_id);
alter table public.projects enable row level security;

drop policy if exists "Clients read own projects" on public.projects;
drop policy if exists "Read own projects or admin" on public.projects;
create policy "Read own projects or admin" on public.projects
  for select to authenticated
  using (
    (select public.is_admin())
    or (
      (select auth.uid()) = client_id
      and exists (select 1 from public.access_requests r where r.user_id = client_id and r.status = 'approved')
    )
  );

drop policy if exists "Admins write projects" on public.projects;
create policy "Admins write projects" on public.projects
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- ── Admin actions ───────────────────────────────────────────
create or replace function public.approve_client(
  p_user uuid, p_name text, p_plan text default null, p_site_url text default null
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  update public.access_requests set status = 'approved', decided_at = now() where user_id = p_user;
  insert into public.projects (client_id, name, plan, site_url)
  values (p_user, p_name, nullif(p_plan, ''), nullif(p_site_url, ''))
  returning id into new_id;
  return new_id;
end $$;

create or replace function public.reject_client(p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  update public.access_requests set status = 'rejected', decided_at = now() where user_id = p_user;
end $$;

revoke execute on function public.approve_client(uuid, text, text, text) from anon;
revoke execute on function public.reject_client(uuid) from anon;

-- ── Make yourself admin ─────────────────────────────────────
-- 1) Sign in once on /portal/ with your Google account (you will appear as "pending").
-- 2) Run (with your email):
-- insert into public.admins (user_id) select id from auth.users where email = 'tu-correo@gmail.com';
-- update public.access_requests set status = 'approved', decided_at = now() where email = 'tu-correo@gmail.com';
