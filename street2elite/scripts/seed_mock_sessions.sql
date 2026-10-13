-- Mock sessions for the Street 2 Elite demo: Oct 13 - Nov 30, 2026.
--
-- Run in Supabase -> SQL Editor. Safe to re-run: every seeded row has an id starting
-- with 5eed0000-0000-4000-8000-, and the first statement deletes those rows (bookings
-- cascade) before re-inserting. Rows created through the app are never touched.
--
-- Remove the mock data entirely:
--   delete from public.sessions where id::text like '5eed0000-0000-4000-8000-%';
--
-- Note: AcademyCalendar only loads sessions with date >= today, so nothing before
-- 2026-10-12 would be visible anyway.

begin;

delete from public.sessions where id::text like '5eed0000-0000-4000-8000-%';

-- ---------------------------------------------------------------------------
-- 1. Sessions: weekly programme + one-off events
-- ---------------------------------------------------------------------------
with days as (
  select d::date as day
  from generate_series('2026-10-13'::date, '2026-11-30'::date, interval '1 day') d
),
weekly(dow, title, description, start_time, end_time, max_participants, skill_level, price, location, coach_name) as (
  values
    (2, 'Technical Foundations',  'Ball mastery, first touch and passing patterns. Ideal for newer players.',        '17:30'::time, '18:30'::time, 16, 'beginner',     15.00, 'Hackney Marshes - Pitch 7',               'Aisha Khan'),
    (3, 'Tactical Training',      'Shape, pressing triggers and playing out from the back in small groups.',         '17:30'::time, '19:00'::time, 18, 'intermediate', 20.00, 'Mile End Stadium - Astro 2',              'Marcus Reid'),
    (4, 'Elite Performance Squad','High-intensity technical and decision-making work for our top players.',           '18:00'::time, '19:30'::time, 14, 'advanced',     25.00, 'Queen Elizabeth Olympic Park - Pitch A',  'Daniel Osei'),
    (6, 'Saturday Academy',       'Our flagship weekend session: skills circuit, drills and a closing game.',        '09:30'::time, '11:00'::time, 24, 'all',          20.00, 'Hackney Marshes - Pitch 3',               'Marcus Reid'),
    (6, 'Small-Sided Games',      'Fast 5v5 and 6v6 games focused on decision making under pressure.',               '11:30'::time, '13:00'::time, 20, 'intermediate', 15.00, 'Hackney Marshes - Pitch 3',               'Aisha Khan'),
    (7, 'Goalkeeper Clinic',      'Handling, positioning, distribution and shot-stopping with a specialist coach.',  '10:00'::time, '11:30'::time,  8, 'all',          22.00, 'Mile End Stadium - Astro 1',              'Sofia Romero')
),
-- Half-term week (Oct 26-30) is covered by the camp below, so skip regular weekday sessions.
recurring as (
  select d.day, w.*
  from days d
  join weekly w on w.dow = extract(isodow from d.day)
  where d.day not between '2026-10-26' and '2026-10-30'
),
one_offs(day, title, description, start_time, end_time, max_participants, skill_level, price, location, coach_name) as (
  values
    ('2026-10-16'::date, 'Free Trial Evening',          'Open to new players: try the academy with no commitment. Parents welcome to watch.',     '17:30'::time, '19:00'::time, 30, 'all',          0.00,  'Hackney Marshes - Pitch 7',               'Aisha Khan'),
    ('2026-10-23'::date, 'Futsal Skills Night',         'Indoor futsal: tight spaces, quick feet and one-touch combinations.',                    '18:00'::time, '19:30'::time, 20, 'intermediate', 18.00, 'Copper Box Arena - Training Hall',        'Daniel Osei'),
    ('2026-10-26'::date, 'Half-Term Camp: Day 1',       'Full-day camp: technical stations, games and a daily skills challenge. Lunch break included.', '09:30'::time, '15:30'::time, 40, 'all',     45.00, 'Queen Elizabeth Olympic Park - Pitch A',  'Marcus Reid'),
    ('2026-10-27'::date, 'Half-Term Camp: Day 2',       'Full-day camp: passing and movement themes, mini-tournament in the afternoon.',          '09:30'::time, '15:30'::time, 40, 'all',          45.00, 'Queen Elizabeth Olympic Park - Pitch A',  'Marcus Reid'),
    ('2026-10-28'::date, 'Half-Term Camp: Day 3',       'Full-day camp: finishing and 1v1 attacking day.',                                        '09:30'::time, '15:30'::time, 40, 'all',          45.00, 'Queen Elizabeth Olympic Park - Pitch A',  'Daniel Osei'),
    ('2026-10-29'::date, 'Half-Term Camp: Day 4',       'Full-day camp: defending principles, pressing and recovery runs.',                       '09:30'::time, '15:30'::time, 40, 'all',          45.00, 'Queen Elizabeth Olympic Park - Pitch A',  'Aisha Khan'),
    ('2026-10-30'::date, 'Half-Term Camp: Day 5',       'Final day: camp tournament, medals and a parent showcase at 15:00.',                     '09:30'::time, '15:30'::time, 40, 'all',          45.00, 'Queen Elizabeth Olympic Park - Pitch A',  'Marcus Reid'),
    ('2026-10-31'::date, 'Halloween Penalty Shootout',  'Fancy-dress penalty competition with prizes for best costume and best finish.',          '14:00'::time, '15:30'::time, 30, 'all',          10.00, 'Hackney Marshes - Pitch 3',               'Aisha Khan'),
    ('2026-11-07'::date, 'Academy Trial Day',           'Squad selection trials for the Spring intake. Players are assessed in small-sided games.','13:30'::time, '15:30'::time, 32, 'all',          0.00,  'Hackney Marshes - Pitch 1',               'Marcus Reid'),
    ('2026-11-13'::date, 'Finishing Masterclass',       'Technique, composure and shot selection in the final third.',                            '18:00'::time, '19:30'::time, 12, 'advanced',     28.00, 'Mile End Stadium - Astro 2',              'Daniel Osei'),
    ('2026-11-14'::date, 'Match Day: U12 vs Hackney Juniors', 'Friendly fixture for our U12 squad. Selected players only.',                       '14:00'::time, '15:30'::time, 16, 'advanced',     0.00,  'Hackney Marshes - Pitch 1',               'Marcus Reid'),
    ('2026-11-20'::date, 'Parent & Player Info Evening','Spring programme, fees, kit and how to use the booking platform. Q&A with the coaches.', '18:30'::time, '19:30'::time, 40, 'all',          0.00,  'Academy Clubhouse - Hackney',             'Marcus Reid'),
    ('2026-11-27'::date, 'Winter Fitness & Agility',    'Speed, agility and conditioning circuits built around the ball.',                        '18:00'::time, '19:30'::time, 20, 'intermediate', 18.00, 'Mile End Stadium - Astro 1',              'Daniel Osei'),
    ('2026-11-28'::date, 'Winter Showcase Tournament',  'Mixed-ability tournament to close the autumn term, with team photos and certificates.',  '10:00'::time, '14:00'::time, 48, 'all',          12.00, 'Queen Elizabeth Olympic Park - Pitch A',  'Marcus Reid')
),
all_rows as (
  select day, title, description, start_time, end_time, max_participants, skill_level, price, location, coach_name from recurring
  union all
  select day, title, description, start_time, end_time, max_participants, skill_level, price, location, coach_name from one_offs
)
insert into public.sessions
  (id, title, description, date, start_time, end_time, max_participants, skill_level, price, location, coach_name, is_active)
select
  ('5eed0000-0000-4000-8000-' || lpad(row_number() over (order by day, start_time, title)::text, 12, '0'))::uuid,
  title, description, day, start_time, end_time, max_participants, skill_level, price, location, coach_name, true
from all_rows;

-- ---------------------------------------------------------------------------
-- 2. Demo bookings, so the calendar shows green / amber / red and the admin
--    "View Participants" panel has names in it.
--
--    Uses your EXISTING approved players (order by created_at, max 8 per session).
--    If there are no approved players yet, this block does nothing and every
--    session simply shows green. For amber/red, approve a player first
--    (Admin -> Players -> Pending -> Approve) and re-run this file.
--
--    spare = null  -> leave capacity alone (session stays green)
--    spare = 0     -> capacity is set to the number booked, so the session is FULL (red)
--    spare = 1..3  -> capacity is set to booked + spare, so it shows AMBER
-- ---------------------------------------------------------------------------
do $$
declare
  tgt record;
  kid record;
  booked int;
begin
  for tgt in
    select * from (values
      ('Elite Performance Squad'::text, '2026-10-22'::date, 0),
      ('Goalkeeper Clinic',             '2026-10-25'::date, 0),
      ('Tactical Training',             '2026-10-21'::date, 2),
      ('Halloween Penalty Shootout',    '2026-10-31'::date, 2),
      ('Saturday Academy',              '2026-10-17'::date, null),
      ('Technical Foundations',         '2026-10-20'::date, null),
      ('Half-Term Camp: Day 1',         '2026-10-26'::date, null)
    ) as t(title, day, spare)
  loop
    booked := 0;

    for kid in
      select id, parent_id
      from public.children
      where approval_status = 'approved'
      order by created_at
      limit 8
    loop
      insert into public.bookings (session_id, child_id, parent_id, status, payment_status)
      select s.id, kid.id, kid.parent_id, 'confirmed', 'paid'
      from public.sessions s
      where s.title = tgt.title
        and s.date = tgt.day
        and s.id::text like '5eed0000-0000-4000-8000-%'
      on conflict (session_id, child_id) do nothing;

      booked := booked + 1;
    end loop;

    if booked > 0 and tgt.spare is not null then
      update public.sessions
      set max_participants = booked + tgt.spare
      where title = tgt.title
        and date = tgt.day
        and id::text like '5eed0000-0000-4000-8000-%';
    end if;
  end loop;
end $$;

commit;

-- Sanity check: counts per month and how many sessions carry bookings.
select to_char(date, 'YYYY-MM') as month,
       count(*)                 as sessions,
       count(*) filter (where exists (select 1 from public.bookings b where b.session_id = s.id)) as with_bookings
from public.sessions s
where id::text like '5eed0000-0000-4000-8000-%'
group by 1
order by 1;
