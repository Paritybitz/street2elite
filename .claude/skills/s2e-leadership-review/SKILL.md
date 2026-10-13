---
name: s2e-leadership-review
description: Convene the Street 2 Elite leadership team on one question. Sends it to the relevant leader agents in parallel, then synthesises their reports into one recommendation with conflicts, open questions and handoffs. Use for decisions that cut across functions (go-live readiness, a new feature, pricing, a policy, a launch) or when asked for a leadership review.
disable-model-invocation: true
argument-hint: "[question or decision]"
---

# Leadership review

Runs from the main session, because subagents cannot start other subagents.

## Steps

1. **Frame the question** in one or two sentences: the decision, the deadline if the owner gave one, and what "done" looks like. If the owner gave no deadline or goal, say so. Do not invent one.
2. **Pick the leaders.** Use only those with a real stake. Typical sets:

   | Question type | Leaders |
   |---|---|
   | Ready for real families? | Safeguarding, CTO, COO, Parent Experience, CEO |
   | New feature | CTO, Safeguarding, the feature's owner, Parent Experience |
   | Pricing or payments | CFO, CTO, Parent Experience, CEO |
   | Programme or levels | Head of Coaching, COO, CFO, Parent Experience |
   | Public launch or campaign | CMO, Safeguarding, Parent Experience, CEO |
   | Policy (cancellation, privacy, safeguarding) | Safeguarding, CFO, COO, Parent Experience, CEO |

   Agents: `s2e-ceo`, `s2e-coo`, `s2e-cto`, `s2e-head-of-coaching`, `s2e-head-of-safeguarding`, `s2e-cfo`, `s2e-cmo`, `s2e-head-of-parent-experience`.
3. **Brief them in parallel.** Start all chosen agents in one step. Give each the same question and its angle ("answer from your role"). Do not pass your own conclusion. Tell them to use the report shape in `leadership/README.md`. Run the CEO last, not in parallel.
4. **Collect.** Read each report. Note any claim without an evidence tag and any number without its inputs.
5. **Synthesise.** Brief the `s2e-ceo` agent with the reports and ask for a recommendation. Then write one summary for the owner:
   - **Recommendation** in two sentences.
   - **Where leaders agree**, in one line each.
   - **Where they conflict**, each side, the trade-off, and what would settle it.
   - **Needs from the owner**, merged and de-duplicated, with question IDs from `business/07-open-questions.md`. Rank by how much each blocks.
   - **Handoffs**, one line per role, with what it must do next.
   - **If we do nothing**, the main risk.
   - **Proposed decision-log entry** for `leadership/DECISIONS.md`, status `proposed`.
6. **Stop.** Do not act on a recommendation without the owner's approval. Do not edit app code, contact families or run SQL.

## Quality checks before replying

- Every number is tagged or labelled "scenario" with inputs.
- No seed venue, coach, price or the "500 athletes" claim appears as fact.
- Any item touching children's data has Safeguarding's view in it.
- Anything that spends money, publishes a claim or changes the live database is marked as needing the owner.
- If a leader returned "unknown", it appears in "Needs from the owner" and not as a guess.
