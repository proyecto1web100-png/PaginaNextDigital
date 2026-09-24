-- Client portal hardening. Safe to re-run.
--
-- 1. Explicit Data API grants, so the portal works even if the project does not
--    auto-expose new tables. RLS policies still decide which rows each user sees.
grant usage on schema public to anon, authenticated;
grant select on public.admins to authenticated;
grant select, update on public.access_requests to authenticated;
grant select, insert, update, delete on public.projects to authenticated;

-- 2. Admin RPCs: only signed-in users can call them (they also check is_admin()).
--    Functions are executable by PUBLIC by default, so revoking from anon alone is not enough.
revoke execute on function public.approve_client(uuid, text, text, text) from public, anon;
revoke execute on function public.reject_client(uuid) from public, anon;
grant execute on function public.approve_client(uuid, text, text, text) to authenticated;
grant execute on function public.reject_client(uuid) to authenticated;
grant execute on function public.is_admin() to authenticated;

-- 3. Fixed search_path (Supabase security advisor: function_search_path_mutable).
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end $$;
