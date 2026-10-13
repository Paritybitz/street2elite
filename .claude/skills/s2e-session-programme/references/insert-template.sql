-- Street 2 Elite: load a session programme.
-- Run in Supabase -> SQL Editor. Replace every <PLACEHOLDER> with a value the OWNER gave you.
-- Do NOT use ids beginning 5eed0000-0000-4000-8000- (reserved for the mock seed, which deletes them).
-- Matches street2elite/scripts/sessions.sql: skill_level in (beginner, intermediate, advanced, all),
-- price numeric(10,2), max_participants integer, is_active boolean.
--
-- Undo: delete from public.sessions where title = '<TITLE>' and date between '<FIRST>' and '<LAST>';
-- (cascades to bookings on those sessions: check the count first.)

begin;

with days as (
  select d::date as day
  from generate_series('<FIRST_DATE>'::date, '<LAST_DATE>'::date, interval '1 day') d
),
-- One row per recurring session type. dow uses ISO weekdays: 1 = Monday ... 7 = Sunday.
weekly(dow, title, description, start_time, end_time, max_participants, skill_level, price, location, coach_name) as (
  values
    (<DOW>, '<TITLE>', '<DESCRIPTION>', '<HH:MM>'::time, '<HH:MM>'::time, <CAPACITY>, '<LEVEL>', <PRICE>, '<VENUE>', '<COACH>')
    -- , (<DOW>, ...)
),
-- Dates the owner said to skip.
skip_days(day) as (
  values ('<YYYY-MM-DD>'::date)
),
rows_to_insert as (
  select d.day, w.*
  from days d
  join weekly w on w.dow = extract(isodow from d.day)
  where d.day not in (select day from skip_days)
    and w.end_time > w.start_time
)
insert into public.sessions
  (title, description, date, start_time, end_time, max_participants, skill_level, price, location, coach_name, is_active)
select title, description, day, start_time, end_time, max_participants, skill_level, price, location, coach_name, true
from rows_to_insert;

commit;

-- Check the result: sessions per weekday and level, and any overlap for the same coach on the same day.
select to_char(date, 'Dy') as weekday, skill_level, count(*) as sessions
from public.sessions
where date between '<FIRST_DATE>' and '<LAST_DATE>' and is_active
group by 1, 2
order by 1, 2;

select a.date, a.coach_name, a.title as first_session, b.title as overlapping_session
from public.sessions a
join public.sessions b
  on a.coach_name = b.coach_name and a.date = b.date and a.id < b.id
 and a.start_time < b.end_time and b.start_time < a.end_time
where a.is_active and b.is_active
  and a.date between '<FIRST_DATE>' and '<LAST_DATE>';
