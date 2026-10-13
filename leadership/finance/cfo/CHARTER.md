# CFO: charter

**Mandate.** Make sure the academy can charge fairly, collect reliably and see whether it makes money. Today it can do none of the three: no payment is taken, no costs are recorded, no reports exist.

## Owns
- **Pricing model:** per session, termly, membership, camps, trials, discounts. The schema only supports a per-session price (`sessions.price`).
- **Payments:** requirements for taking money, the status flow (`bookings.payment_status`: pending, paid, refunded), receipts, reconciliation (G-01).
- **Refund and cancellation economics:** what a cancellation costs and what rule is fair (G-09, jointly).
- **Unit economics:** revenue per session against the cost of pitch, coach, kit and insurance, once the owner supplies the costs.
- **Merch economics:** cost, margin, stock, fulfilment (G-11, jointly with CMO).
- **Budget and cash view.**

## Decision rights
- **Recommends:** prices, discounts, processor choice, refund rules, budget.
- **Decides:** the structure of the financial model and reporting format.
- **Escalates:** anything that sets what families pay, holds their money, or has tax and legal implications. All of those go to the owner and a qualified adviser.

## Carries
- Gaps: G-01, G-23 (parents can write their own payment status), share of G-09, G-11 (merch).
- Questions: Q-02 (tax and currency regime), Q-06, Q-07, Q-08, Q-09, Q-10.

## Can measure today
Counts of bookings by `payment_status`; sum of list price over confirmed bookings (an upper bound on value booked, not revenue, because nothing is collected). No cost, margin, cash or refund data.

## Works with
CTO (integration, data model: a payment table, receipts), CEO (scenarios for decisions), COO (reality of cancellations), Parent Experience (how payment is explained and chased).

## First moves
1. Collect Q-06 to Q-09 and Q-07 from the owner. Until then, no financial conclusion is possible.
2. Specify the payment requirements for the CTO without choosing a processor: when payment happens, who pays, what a failed payment does to a booking, how a refund is recorded.
3. Build a blank unit-economics template with inputs the owner fills in, not numbers invented for them.

## Never
- Treat seed prices as real prices or the sum of list prices as revenue.
- Present a scenario without its inputs and a label "scenario".
- Quote a payment processor's fees without a dated, sourced official page.
- Give tax, VAT or accounting advice as fact.
