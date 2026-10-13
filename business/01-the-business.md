# 01. The business

Tags are defined in `README.md`.

## What it is

- Street 2 Elite (short form "S2E") is a youth football academy. `[CODE]` `app/layout.tsx` metadata: "Professional football academy training sessions". `CLAUDE.md`: "MVP web platform for a youth football academy".
- The repo is the platform only: player registration with document uploads, an admin approval workflow, and a session calendar with booking. `[CODE]` `CLAUDE.md`
- The root README says one word: "MVP". `[CODE]` `README.md`
- Players are under 18. `[CODE]` `components/add-player-modal.tsx` rejects a date of birth that is not under 18.
- Parents hold the accounts and register their children as "players". The admin UI calls the parent the "Manager". `[CODE]` `components/player-details-modal.tsx`
- The word "soccer" appears in merch copy and image names, "football" in metadata and docs. `[CODE]` `app/merch/page.tsx`, `app/layout.tsx`. The sport is the one called football in the UK and soccer in the US. Which market this serves is `[UNKNOWN]`.

- The logo crest carries "2020" under the name. `[CODE]` (image `public/s2e-white.png`). It is most plausibly the founding year `[INFERRED]`, which would make the academy older than this platform. It is not confirmed. Do not write "established 2020" anywhere until Q-03 is answered.

## Timeline `[CODE]` git history

- 2025-08-19: initial commit (Ali Mohsin).
- 2025-08-20 to 2025-08-22: project structure, auth, calendar, parent and admin dashboards (Paritybitz).
- 2026-06-27: `CLAUDE.md` added.
- 2026-10-12: player edit refactor, mock session seed, and a booking flow under construction `[WIP]`.

The two git authors are "Ali Mohsin" and "Paritybitz". Who each is, and who owns the business, is `[UNKNOWN]`.

## Stage

- A working MVP with real sign-up, player approval and a session calendar. `[CODE]`
- Booking was a stub in committed code (mock "paid", unreachable page). A real booking flow is being built in the working tree. `[WIP]` See `04-operating-processes.md`.
- No payment processor, no email or SMS sending, no attendance tracking, no coach login, and no working reports (an unlinked legacy `/admin` stats page exists, and its links lead nowhere). `[CODE]` (absence confirmed by search)

## What is `[UNKNOWN]`

All of the following are absent from the repo. Do not state or imply them:

- Legal entity, country, and regulatory regime. The `£` sign and London venues in seed data suggest the UK `[INFERRED]`, but this is not confirmed.
- Number of real players, parents or coaches. The landing page says "over 500" `[CLAIM]`.
- Real venues, real coaches, real prices, real fees.
- Revenue, costs, margins, coach pay, venue cost, insurance.
- Age groups, teams, squads, term dates, membership model.
- Who works in the business and in what role.
- Targets, goals, time horizon, competitors, local market.

All of these appear in `07-open-questions.md` with the leader who needs each answer.
