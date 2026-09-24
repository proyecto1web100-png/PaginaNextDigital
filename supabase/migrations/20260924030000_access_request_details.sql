-- Clients complete their access request with their name (and optionally their business)
-- before it reaches the admin. Safe to re-run.

alter table public.access_requests add column if not exists business_name text;
alter table public.access_requests add column if not exists submitted_at timestamptz;

-- Clients cannot update access_requests directly (they could change their own status),
-- so they submit through this function, which only touches the descriptive fields.
create or replace function public.submit_access_request(p_full_name text, p_business_name text default null)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_name text := nullif(btrim(p_full_name), '');
  v_business text := nullif(btrim(p_business_name), '');
begin
  if (select auth.uid()) is null then raise exception 'not signed in'; end if;
  if v_name is null or char_length(v_name) > 120 then raise exception 'invalid name'; end if;
  if char_length(v_business) > 120 then raise exception 'invalid business name'; end if;

  update public.access_requests
     set full_name = v_name,
         business_name = v_business,
         submitted_at = coalesce(submitted_at, now())
   where user_id = (select auth.uid()) and status = 'pending';
end $$;

revoke execute on function public.submit_access_request(text, text) from public, anon;
grant execute on function public.submit_access_request(text, text) to authenticated;
