---
name: s2e-session-programme
description: Plan or generate Street 2 Elite training sessions - weekly programmes, camps, trials, matches - and write the SQL to load them into the sessions table, using only details the owner supplies. Use when designing a term or half-term schedule, bulk-creating sessions, or checking a programme for clashes, level coverage and capacity.
---

# Session programme

The seed file `street2elite/scripts/seed_mock_sessions.sql` is **mock data** `[SEED]`. Use its structure as a pattern, never its content as the academy's programme.

## Required inputs (ask for any that are missing; do not fill gaps)

| Input | Notes |
|---|---|
| Date range, and dates to exclude (holidays, closures) | Sessions on the calendar must be `date >= today` to show |
| For each session type: title, description | Plain, factual; no claims (see `s2e-brand-copy`) |
| Weekday and start/end time | `time without time zone`; end after start |
| Skill level | one of `beginner`, `intermediate`, `advanced`, `all` |
| Capacity | integer of at least 1. The admin form limits input to 30, the database does not |
| Price | `numeric(10,2)`, 0 for free |
| Venue | free text; must be a real place the owner has named |
| Coach | free text, must be a real person the owner has named. Not linked to a profile |

The database does not store age group, squad or session type. If the owner wants those, they go in the title or description today, and a schema change is a CTO task (`s2e-supabase-change`).

## Steps

1. Collect the inputs in a table and ask for what is missing.
2. **Check the programme before writing SQL:**
   - No two sessions for the same coach or the same pitch overlap.
   - Every level the owner wants to offer has at least one slot; note levels with none.
   - Capacity is realistic against the venue and coach numbers the owner gives. Do not suggest ratios as rules.
   - Prices in the set are consistent with the owner's stated model (Q-06). Flag any session priced at 0 as free.
   - Dates avoid the exclusions.
3. **Show the proposed programme as a table** and let the owner correct it.
4. **Write the SQL** from [references/insert-template.sql](references/insert-template.sql). Save it under `street2elite/scripts/` with a descriptive name. Do not run it.
5. **Hand it over** with how to run it (Supabase SQL Editor), how to see the result (the count query at the end of the template), and how to undo it.

## Rules

- Real sessions must **not** use the mock id prefix `5eed0000-0000-4000-8000-`. That prefix is wiped by the seed file's first statement.
- Deleting mock sessions cascades to their bookings. If real families have booked mock sessions, tell the owner before they run the cleanup.
- Never invent a venue, coach, price or capacity. Never reuse seed names.
- Changing or deleting sessions that already have bookings affects families and nothing notifies them (G-10). When editing a live programme, list the affected bookings by count and tell the owner who needs to be contacted.
- Moving sessions in the calendar edits date and time only; it does not move bookings.
