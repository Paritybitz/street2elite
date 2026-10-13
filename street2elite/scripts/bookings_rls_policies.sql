-- OPTIONAL: Row Level Security for `bookings`.
--
-- Only run this if registering / cancelling / the admin roster fails with a permission
-- error ("new row violates row-level security policy", or empty rosters for admins).
-- If your bookings policies already work, skip this file: policies are additive, so
-- running it will not remove anything, but you'd end up with overlapping rules.
--
-- Access model:
--   read    : any signed-in user (the calendar needs the headcount of every session;
--             bookings only contain ids, no names or contact details)
--   create  : a parent can only create bookings for themselves (parent_id = their id)
--   update  : a parent can update (cancel) their own bookings; an admin can update any
--   delete  : nobody (the app soft-cancels with status = 'cancelled')
-- Capacity / approval rules are enforced by the trigger in bookings_realtime_and_rules.sql.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.bookings enable row level security;

drop policy if exists "bookings_select_authenticated" on public.bookings;
create policy "bookings_select_authenticated"
  on public.bookings for select
  to authenticated
  using (true);

drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own"
  on public.bookings for insert
  to authenticated
  with check (parent_id = auth.uid());

drop policy if exists "bookings_update_own_or_admin" on public.bookings;
create policy "bookings_update_own_or_admin"
  on public.bookings for update
  to authenticated
  using (parent_id = auth.uid() or public.is_admin())
  with check (parent_id = auth.uid() or public.is_admin());
