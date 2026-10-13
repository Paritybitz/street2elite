-- Street 2 Elite: read-only metrics. Run in Supabase -> SQL Editor.
-- Written against street2elite/scripts/*.sql. NOT executed when written: fix any error from its message.
-- Every query is a single SELECT. Aggregates only: no names, emails, phones or file paths.
-- Mock sessions use ids starting 5eed0000-0000-4000-8000-. Filter them out if you want real activity only (see block 6).

-- 1. Players by approval status
select approval_status, count(*) as players
from public.children
group by approval_status
order by approval_status;

-- 2. Pending queue: size and age of the oldest request
select
  count(*)                                                          as pending_players,
  min(created_at)                                                   as oldest_pending_since,
  round((extract(epoch from (now() - min(created_at))) / 3600)::numeric, 1) as oldest_pending_hours
from public.children
where approval_status = 'pending';

-- 3. Decision turnaround (approvals AND rejections: approved_at is set for both)
select
  count(*)                                                                                    as decided_players,
  round(avg(extract(epoch from (approved_at - created_at)) / 3600)::numeric, 1)               as avg_hours_to_decision,
  round((percentile_cont(0.5) within group (order by extract(epoch from (approved_at - created_at)) / 3600))::numeric, 1)
                                                                                              as median_hours_to_decision
from public.children
where approved_at is not null;

-- 4. Parent funnel (counts, not people)
select
  (select count(*) from public.profiles where role = 'parent')                            as parents,
  (select count(distinct parent_id) from public.children)                                 as parents_with_a_player,
  (select count(*) from public.children where approval_status = 'approved')               as approved_players,
  (select count(distinct child_id) from public.bookings
     where status in ('confirmed', 'completed'))                                          as players_ever_booked,
  (select count(*) from public.children c
     where c.approval_status = 'approved'
       and not exists (select 1 from public.bookings b
                       where b.child_id = c.id and b.status in ('confirmed', 'completed'))) as approved_players_never_booked;

-- 5. New parent accounts per week
select date_trunc('week', created_at)::date as week_starting, count(*) as new_parents
from public.profiles
where role = 'parent'
group by 1
order by 1;

-- 6. Upcoming sessions: confirmed registrations against capacity
-- To exclude mock sessions add:  and s.id::text not like '5eed0000-0000-4000-8000-%'
select
  s.date,
  s.start_time,
  s.title,
  s.skill_level,
  s.price,
  s.max_participants,
  count(b.id) filter (where b.status = 'confirmed')                                        as confirmed,
  round(100.0 * count(b.id) filter (where b.status = 'confirmed') / nullif(s.max_participants, 0), 0) as fill_pct
from public.sessions s
left join public.bookings b on b.session_id = s.id
where s.is_active
  and s.date >= current_date
group by s.id
order by s.date, s.start_time;

-- 7. Confirmed bookings by payment status, with list price (an upper bound on value, NOT revenue)
select
  b.payment_status,
  count(*)     as confirmed_bookings,
  sum(s.price) as list_price_total
from public.bookings b
join public.sessions s on s.id = b.session_id
where b.status = 'confirmed'
group by b.payment_status
order by b.payment_status;

-- 8. All bookings by status (cancelled rows are kept)
select status, count(*) as bookings
from public.bookings
group by status
order by status;

-- 9. Medical form coverage and expiry (self-approved forms: dates only, nobody has reviewed content)
select
  (select count(*) from public.children c
     where not exists (select 1 from public.medical_forms m where m.child_id = c.id))     as players_without_a_form,
  (select count(*) from (select child_id, max(valid_to) as latest
                         from public.medical_forms group by child_id) x
     where latest < now())                                                               as players_whose_latest_form_expired,
  (select count(*) from (select child_id, max(valid_to) as latest
                         from public.medical_forms group by child_id) x
     where latest >= now() and latest < now() + interval '30 days')                      as forms_expiring_within_30_days,
  (select count(*) - count(distinct child_id) from public.medical_forms)                 as duplicate_form_rows;

-- 10. Future confirmed bookings where the player has no form valid on the session date
select count(*) as upcoming_bookings_without_a_valid_form
from public.bookings b
join public.sessions s on s.id = b.session_id
where b.status = 'confirmed'
  and s.date >= current_date
  and not exists (select 1 from public.medical_forms m
                  where m.child_id = b.child_id
                    and m.valid_from <= s.date::timestamptz
                    and m.valid_to   >= s.date::timestamptz);

-- 11. Players by skill level and approval status (level defaults to 'beginner'; admins change it)
select skill_level, approval_status, count(*) as players
from public.children
group by skill_level, approval_status
order by skill_level, approval_status;

-- 12. Players without a photo recorded
select count(*) as players_without_photo_url
from public.children
where photo_url is null or photo_url = '';

-- 13. Repeat booking: parents with two or more confirmed or completed bookings
select
  count(*) filter (where n >= 2) as parents_with_2_plus_bookings,
  count(*)                       as parents_with_any_booking
from (
  select parent_id, count(*) as n
  from public.bookings
  where status in ('confirmed', 'completed')
  group by parent_id
) x;
