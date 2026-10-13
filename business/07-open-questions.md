# 07. Open questions for the owner

These cannot be answered from the repo. Agents must not guess them. When you answer one, record it in the right `business/` file with the tag `[OWNER yyyy-mm-dd]`, then delete the line here. `Needed by` is the leader whose work is blocked without the answer.

## A. Identity and context

| # | Question | Needed by |
|---|---|---|
| Q-01 | Who owns and runs the business, and who is on the team (names, roles, paid or volunteer)? Who are "Ali Mohsin" and "Paritybitz" in the git history? | CEO |
| Q-02 | What is the legal entity, and in which country and region does it operate? (`£` and London seed data suggest the UK, unconfirmed.) | CEO, Safeguarding, CFO |
| Q-03 | Is this live with real families, a pilot, or pre-launch? The logo says "2020": was the academy founded then, and does it already run in-person sessions? How many real players, parents and coaches exist today? Is "over 500 young athletes" true? | CEO, CMO |
| Q-04 | What are the goals and time horizon? (players, revenue, sites, launch date) What does success look like in 12 months? | CEO |

## B. Offer and money

| # | Question | Needed by |
|---|---|---|
| Q-05 | What is really offered: weekly sessions, camps, squads, matches, trials, one-to-one? Is the mock programme in `seed_mock_sessions.sql` close to reality? | COO, Coaching, CFO |
| Q-06 | Real prices, and the pricing model (per session, termly, membership, sibling discounts, free trials)? | CFO |
| Q-07 | What does a session cost to deliver (pitch hire, coach pay, kit, insurance, admin time)? | CFO |
| Q-08 | Preferred payment method and processor, and who bears fees? When should payment happen (at booking, term start, on the day)? | CFO, CTO |
| Q-09 | Cancellation, refund, missed-session and transfer rules? | CFO, Parent Experience |
| Q-10 | Is merch real? Who makes it, who ships it, and what are the real prices and sizes? | CMO, CFO |

## C. People and delivery

| # | Question | Needed by |
|---|---|---|
| Q-11 | Who are the real coaches? Are they employed or self-employed, and what vetting, qualifications and first-aid training do they have? | Coaching, Safeguarding |
| Q-12 | Where do sessions happen (real venues), who hires the pitch, and what is the weather and cancellation process? | COO |
| Q-13 | Are there age groups or squads (for example by year of birth), and are skill levels assessed in a trial? Who assigns a level? | Coaching |
| Q-14 | What should a coach be able to do in the platform (register, notes, assessment, parent messages)? | Coaching, CTO |

## D. Safeguarding, privacy and policy

| # | Question | Needed by |
|---|---|---|
| Q-15 | Is there a safeguarding policy and a named safeguarding lead? Who handles concerns and incidents? | Safeguarding |
| Q-16 | What counts as an acceptable medical form (who signs it, what it must say)? Who reviews it? Is a form the right control, or should the platform collect health information in structured fields? | Safeguarding, COO |
| Q-17 | Photo and media consent: are players photographed or filmed, and is consent captured anywhere? Are player photos meant to be visible to other parents? | Safeguarding, CMO |
| Q-18 | Is the `player-photos` bucket public in Supabase? What RLS policies and triggers exist in the live database, and have the uncommitted `bookings_*.sql` scripts been run? (Export the live state into `scripts/`.) | CTO, Safeguarding |
| Q-19 | Is there a privacy notice, terms and conditions, and insurance? Who is the data controller? | Safeguarding, CEO |
| Q-20 | How long should a child's data and medical form be kept after they leave? | Safeguarding |

## E. Growth and brand

| # | Question | Needed by |
|---|---|---|
| Q-21 | Who is the target family (area, age, income, school type) and how do they hear about the academy today? | CMO |
| Q-22 | Which competitors and local alternatives do parents compare you with? | CMO, CEO |
| Q-23 | Is there social media, a website beyond this app, a WhatsApp group, a mailing list? | CMO, Parent Experience |
| Q-24 | How do you currently communicate with parents (WhatsApp, email, text)? What do they find painful? | Parent Experience |
| Q-25 | Any brand rules beyond what is in the code (colours, tone, name styling "Street 2 Elite" vs "Street2Elite")? Both spellings appear in the UI. | CMO |

## F. Platform

| # | Question | Needed by |
|---|---|---|
| Q-26 | Who else is editing the repo right now? Uncommitted booking work was written during this analysis. Is it intended to ship as it is? | CTO |
| Q-27 | How is the first admin account created, and who holds the Supabase service-role key? Where is the app deployed? | CTO |
| Q-28 | Is there a staging database, or does everything run against production? | CTO |
