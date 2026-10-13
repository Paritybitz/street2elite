---
name: s2e-roadmap-prioritiser
description: Turn the Street 2 Elite gap register (business/06-gaps-and-risks.md) and the owner's goals into a ranked, dependency-aware roadmap with the scoring shown. Use when deciding what to build or fix next, planning a release, or defining the go-live gate.
---

# Roadmap prioritiser

## Inputs

1. `business/06-gaps-and-risks.md`: the items, their severity (S1 to S4), owners and evidence.
2. `business/07-open-questions.md`: what is blocked on the owner.
3. The owner's goals if given (Q-04). If not given, say "goals unknown" and rank on the harm and dependency rules below only.
4. Current `[WIP]` work from `git status`: do not plan work that duplicates it.

## Method

**Step 1. Gate.** Items that harm children or expose personal data (S1) come first and are never traded against growth. Propose this as the go-live gate for the owner to confirm: no S1 item open before real families are onboarded.

**Step 2. Score everything else** on four factors, each 1 (low) to 3 (high). Show the scores in the table.

| Factor | 3 means |
|---|---|
| Harm if ignored | Money lost, families lost, or staff time wasted every week |
| Unblocks | Other items cannot start without it |
| Confidence | The evidence is `[CODE]` and the fix is understood |
| Effort (inverted) | Hours or a day, not weeks |

Priority score = Harm + Unblocks + Confidence + Effort. Ties go to the item with more things behind it.

**Step 3. Dependencies.** For each item, list what must exist first. Typical chains in this codebase:
- Payment (G-01) needs the pricing and refund rules (Q-06, Q-09) and a trusted server path for `payment_status` (G-23).
- Parent messages (G-10, G-18) need a sending channel the platform does not have.
- Coach features (G-07) need Q-14 answered.
- Any child-data fix needs the access rules to be visible first (G-04, Q-18).

**Step 4. Blocked items.** Items waiting on an owner answer go in their own list with the question ID. Do not guess the answer to unblock them.

**Step 5. Sequence into batches** that can ship independently: Batch 0 is the go-live gate; later batches group items by who builds them (CTO work, COO process work, CMO copy work, Safeguarding policy drafts) so work can run in parallel.

## Output

1. **Go-live gate** (list of S1 items still open, with owner).
2. **Ranked table**: rank, gap ID, one-line description, four scores, total, depends on, owner, who builds it.
3. **Blocked on the owner**: question IDs with the items they unblock.
4. **Batches** with what each delivers.
5. **What I did not rank and why** (for example items with no evidence).
6. **Assumptions**: should be empty. If a score depends on an assumption, mark that row "scenario".

## Rules

- Never invent effort in hours as fact; use Low, Medium, High unless the code makes it obvious.
- Never rank marketing growth above an open S1 item.
- Do not drop a gap because it is awkward. If the owner defers one, record it as deferred with the reason in `leadership/DECISIONS.md`.
- The ranking is a recommendation. The owner decides.
