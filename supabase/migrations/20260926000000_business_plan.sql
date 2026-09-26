-- New "Negocios" plan for larger companies: allow it on projects and quote requests.
alter table public.projects drop constraint if exists projects_plan_check;
alter table public.projects
  add constraint projects_plan_check check (plan in ('Básico', 'Intermedio', 'Avanzado', 'Negocios'));

alter table public.leads drop constraint if exists leads_plan_check;
alter table public.leads
  add constraint leads_plan_check check (plan in ('Básico', 'Intermedio', 'Avanzado', 'Negocios', 'No sé'));
