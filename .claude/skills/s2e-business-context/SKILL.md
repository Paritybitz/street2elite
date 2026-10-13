---
name: s2e-business-context
description: Ground truth and evidence rules for Street 2 Elite, a youth football academy platform. Load before answering any question about the business, its players, parents, sessions, pricing, brand, operations, safeguarding or roadmap, so facts are separated from assumptions.
---

# Street 2 Elite: business context and evidence rules

The knowledge base is `business/` at the repo root. It was built from the code, SQL, git history and the logo on 2026-10-12. Read `business/README.md` first, then only the files the question needs.

## The rule

**Do not assume.** Every statement about the business is one of these, and you say which:

| Tag | Meaning | Treat as fact? |
|---|---|---|
| `[CODE]` | Committed source or SQL | Yes |
| `[WIP]` | Uncommitted working tree | Only as "in progress" |
| `[SEED]` | Mock data in `scripts/seed_mock_sessions.sql` | No |
| `[CLAIM]` | Marketing text nobody has verified | No |
| `[INFERRED]` | Reasonable reading, never stated | Only labelled "inferred" |
| `[UNKNOWN]` | Not in the repo | Never. Ask the owner. |
| `[OWNER yyyy-mm-dd]` | Confirmed by the owner | Yes |

If a sentence you are about to write has no tag, it is unknown. Say so and list it under "Needs from the owner" with the question ID from `business/07-open-questions.md`.

## What is known in one paragraph

Street 2 Elite is a youth football academy (players under 18). Parents sign up, register their children as "players" with a photo and a medical form, an admin approves them, and approved players can be booked into sessions that have a date, venue, coach, level, capacity and a per-session price. Roles in the database are parent, admin and coach, but coach has no features. The logo reads "STREET 2 ELITE 2020", and the brand is teal and navy. Payments, messaging, attendance and reporting do not exist. A booking flow is being built in the uncommitted working tree.

## What is not known (never state these)

Legal entity and country. Number of real players. Real venues, coaches and prices. Costs and revenue. Age groups. Who is on the team. Policies (terms, privacy, cancellation, safeguarding). Whether the 2020 on the logo is a founding year. Whether "over 500 young athletes" is true.

## Traps already found

- The mock programme names venues in East London, four coaches and prices. All demo data. Never use them as real.
- `CLAUDE.md` is out of date against the SQL. The SQL wins. See `business/05-platform-and-data.md`.
- The `£` sign suggests the UK, but jurisdiction is unconfirmed. Do not cite a country's law as applying.
- A booking marked "paid" in committed code is not paid: no money moves.
- Medical forms are marked "approved" automatically on upload. Nobody has reviewed them.
- Skill level is `beginner` for everyone unless an admin changed it.
- The `coach` role exists in the schema and does nothing in the app.

## Handling children's data

Work from schema, code, counts and anonymised examples. Never ask for, copy or reproduce a real player's name, photo, medical file or parent's contact.

## Where things are

- Leadership roles and operating rules: `leadership/README.md`
- Gap register: `business/06-gaps-and-risks.md` (IDs G-01 to G-23)
- Open questions: `business/07-open-questions.md` (IDs Q-01 to Q-28)
- App code: `street2elite/` (commands run from there)
- SQL: `street2elite/scripts/`
