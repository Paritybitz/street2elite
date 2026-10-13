-- Session registration: realtime + database-level rules.
--
-- Run once in Supabase -> SQL Editor. Safe to re-run.
--
-- 1. Realtime: adds `bookings` (and `sessions`, `children`) to the supabase_realtime
--    publication. Without this, the app still works, but other people's screens only pick
--    up a registration when they refocus the tab instead of instantly.
-- 2. Rules enforced in Postgres (the browser can't be trusted):
--      - a session can't be registered beyond max_participants (race-safe: the session row
--        is locked while the headcount is checked, so two parents can't take the last spot)
--      - only a parent's own, APPROVED players can be registered
--      - inactive (deleted) sessions can't be registered

-- ---------------------------------------------------------------------------
-- 1. Realtime
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['bookings', 'sessions', 'children'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Registration rules
-- ---------------------------------------------------------------------------
create or replace function public.enforce_booking_rules()
returns trigger
language plpgsql
security definer            -- must see ALL bookings to count them, whatever RLS says
set search_path = public
as $$
declare
  s record;
  c record;
  taken integer;
begin
  -- Only check when a booking becomes (or is created as) 'confirmed'.
  -- Cancelling never needs a check.
  if new.status = 'confirmed' and (tg_op = 'INSERT' or old.status is distinct from 'confirmed') then

    -- Lock the session row so concurrent registrations queue up behind each other.
    select max_participants, is_active into s
    from sessions where id = new.session_id
    for update;

    if not found or s.is_active is not true then
      raise exception 'session_unavailable';
    end if;

    select parent_id, approval_status into c
    from children where id = new.child_id;

    if not found
       or c.parent_id is distinct from new.parent_id
       or c.approval_status is distinct from 'approved' then
      raise exception 'child_not_eligible';
    end if;

    select count(*) into taken
    from bookings
    where session_id = new.session_id
      and status = 'confirmed'
      and id <> new.id;

    if taken >= s.max_participants then
      raise exception 'session_full';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_booking_rules on public.bookings;
create trigger trg_enforce_booking_rules
  before insert or update of status on public.bookings
  for each row execute function public.enforce_booking_rules();
