---
name: s2e-business-metrics
description: Read-only, aggregate-only SQL for Street 2 Elite that answers what the database can honestly say - player approval queue and turnaround, parent funnel, session fill rates, bookings by payment status, medical form coverage and expiry. Use when someone asks for numbers, a health check, a funnel, or a status report. Produces queries for the owner to run; never touches the live database.
---

# Business metrics

Claude has no access to the live database and must not use the service-role key. This skill produces SQL for the owner to paste into the Supabase SQL Editor, and then interprets the pasted results.

The queries are in [references/queries.sql](references/queries.sql), written against `street2elite/scripts/*.sql`. They were **not executed** when written (no Postgres was available). Run them in the editor; if one errors, fix it from the error message rather than guessing.

## Steps

1. Say which question is being asked, and pick the matching query block by its number.
2. Give the owner only those blocks, with a note on what the result will and will not mean.
3. When results come back, interpret them using the cautions below, and label every conclusion with its evidence.
4. Say plainly what cannot be measured yet (list below).

## What each block is for

| # | Question | Main caution |
|---|---|---|
| 1 to 3 | Approval queue: size, age, turnaround | `approved_at` is set for rejections too, so turnaround covers all decisions |
| 4 to 5 | Parent funnel and sign-ups over time | Counts parents, not paying customers |
| 6 | Fill rate by upcoming session | Includes mock sessions unless filtered (see the optional line) |
| 7 | Bookings by payment status and list price | List price total is not revenue: nothing is collected |
| 8 | Booking statuses | Cancelled bookings stay as rows |
| 9 to 10 | Medical form coverage, expiry, and bookings with no valid form | Forms are self-approved; "valid" means the dates only |
| 11 to 12 | Players by level; photos missing | Level is `beginner` by default, so counts overstate beginners |
| 13 | Repeat booking | Needs real bookings to mean anything |

## Cannot be measured today (say so, never estimate)

Revenue, cost, margin, cash, refunds (no payment exists). Attendance and no-shows (`checked_in` is unused). Traffic and conversion (no analytics). Message delivery (no messaging). Session quality, player progress, retention by level. Anything about coaches. Whether a session was changed after families booked (no audit trail).

## Rules

- **Aggregate only.** Never add `select *`, names, emails, phones, photo paths or file paths to a query, and never ask the owner to paste rows that contain them. If someone asks for a list of families, explain the risk and offer counts instead.
- **Mock data contaminates counts.** If `scripts/seed_mock_sessions.sql` was run, its sessions (ids starting `5eed0000-0000-4000-8000-`) and any demo bookings made on them are not real activity. Ask whether it was run before reading fill rates or booking counts.
- **Small numbers are not trends.** With few real players, report counts and refuse percentages and growth rates.
- Do not combine these figures into a claim for marketing without the owner's confirmation (see `s2e-brand-copy`).
