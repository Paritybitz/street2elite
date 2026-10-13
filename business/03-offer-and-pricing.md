# 03. Offer and pricing

Tags are defined in `README.md`.

## What the platform sells `[CODE]`

1. **Training sessions**, priced per player per session. `sessions.price numeric(10,2)` is required. There is no subscription, term pass, package, sibling discount or membership in the schema.
2. **Merchandise**, a static page of four items. `[CODE]` `app/merch/page.tsx`

Free sessions are possible (price 0). Session types the schema can express: title, description, date, start and end time, location (text), coach name (text), skill level (`beginner | intermediate | advanced | all`), capacity (default 20; the admin form caps input at 30 in the HTML but the schema has no cap), price.

## Merch (hardcoded, not a real catalogue) `[CODE]` `app/merch/page.tsx`

| Item | Price shown |
|---|---|
| Street 2 Elite Jersey | £25 |
| Elite Training Shorts | £18 |
| Academy Water Bottle | £12 |
| Elite Soccer Ball | £22 |

- "Add to Cart" and "Contact Support" have no handlers. There is no cart, checkout, stock, sizing or fulfilment. `[CODE]`
- The four image files named in the page do not exist in `public/`. They will fail to load. `[CODE]` `git ls-files public`
- Whether these prices or products are real is `[UNKNOWN]`.

## Session programme: mock only `[SEED]`

`scripts/seed_mock_sessions.sql` is headed "Mock sessions for the Street 2 Elite demo: Oct 13 - Nov 30, 2026". Everything below is a demo, **not** a statement of what the academy offers.

| Weekday | Mock session | Level | Mock price | Capacity |
|---|---|---|---|---|
| Tue | Technical Foundations | beginner | £15 | 16 |
| Wed | Tactical Training | intermediate | £20 | 18 |
| Thu | Elite Performance Squad | advanced | £25 | 14 |
| Sat | Saturday Academy | all | £20 | 24 |
| Sat | Small-Sided Games | intermediate | £15 | 20 |
| Sun | Goalkeeper Clinic | all | £22 | 8 |

One-offs in the mock set: free trial evening, futsal night (£18), a five-day half-term camp (£45 per day, capacity 40), a Halloween shootout (£10), an academy trial day (free), a finishing masterclass (£28), a U12 friendly (free), a parent info evening (free), a winter fitness night (£18), and a closing tournament (£12).

The mock set also names venues in East London and four coaches. Those names are demo data. They must not be used as real venue or staff information.

**What the mock set can legitimately be used for:** it shows the shapes of offer the product is designed to hold (levels, camps, trials, matches, info events, goalkeeper specialism). It says nothing about demand, price acceptance or what the owner intends to run.

## Pricing facts that are `[UNKNOWN]`

- Real session prices, camp prices, any discount structure.
- Whether the model is pay-per-session, termly, or membership.
- Cost to deliver a session (pitch hire, coach pay, kit, insurance, admin).
- Refund and cancellation terms. The legacy booking form links to `/terms`, which does not exist. `[CODE]`
- Currency. `£` is used in the session form, merch and the booking modal `[WIP]`. The legacy `booking-form.tsx` shows `$`. `[CODE]`
