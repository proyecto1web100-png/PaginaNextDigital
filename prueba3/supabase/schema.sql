-- NextDigital client portal: run once in Supabase → SQL Editor.
-- Each client only sees the projects linked to their own user (Row Level Security).

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

-- Clients can read their own projects. Only you (from the dashboard / service role) can write.
drop policy if exists "Clients read own projects" on public.projects;
create policy "Clients read own projects"
  on public.projects for select
  to authenticated
  using ((select auth.uid()) = client_id);

-- Keep updated_at current when you edit a project.
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- Example (replace the email): link a project to a client after creating their user
-- in Authentication → Users → Add user.
-- insert into public.projects (client_id, name, plan, status, progress, next_step, site_url)
-- select id, 'Kenias Studio', 'Intermedio', 'desarrollo', 60, 'Revisar la galería de trabajos', 'https://keniastudio.netlify.app/'
-- from auth.users where email = 'cliente@correo.com';
