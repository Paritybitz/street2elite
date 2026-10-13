# Street 2 Elite: business knowledge base

Ground truth for every leadership agent and skill in this repo. It was built by reading the whole codebase, the SQL in `street2elite/scripts/`, the git history and the local environment. Nothing here comes from outside knowledge or guesses.

**Snapshot:** 2026-10-12, git `4eb5124` plus an uncommitted working tree (see `[WIP]` below).
**Refresh with:** the `s2e-kb-refresh` skill, after any merge that touches the product.

## Evidence tags (use them everywhere)

| Tag | Meaning | May be stated as fact? |
|---|---|---|
| `[CODE]` | Confirmed in committed source or SQL. A file reference follows. | Yes |
| `[WIP]` | Seen in the uncommitted working tree on the snapshot date. May change or be dropped. | Only as "in progress" |
| `[SEED]` | Appears only in mock/demo data (`scripts/seed_mock_sessions.sql`). | No. It is an example, not a business fact. |
| `[CLAIM]` | Marketing copy or a hardcoded statement nobody has verified. | No. Flag it. |
| `[INFERRED]` | A reasonable reading of several `[CODE]` facts, not stated anywhere. | Only with the word "inferred" |
| `[UNKNOWN]` | Not in the repo. Only the owner can answer. Listed in `07-open-questions.md`. | Never. Ask. |

**The rule:** if a statement has no tag, treat it as `[UNKNOWN]`. Never promote `[SEED]`, `[CLAIM]` or `[INFERRED]` to fact in a deliverable. When the owner answers an open question, move the answer into the right file and tag it `[OWNER <date>]`.

## Files

| File | What it holds |
|---|---|
| `01-the-business.md` | What the business is, and what is and isn't known about it |
| `02-people-and-roles.md` | Who uses the platform and what each role can actually do |
| `03-offer-and-pricing.md` | What is sold, at what price, and where that data comes from |
| `04-operating-processes.md` | Every end-to-end flow as built, step by step, with its gaps |
| `05-platform-and-data.md` | Stack, schema, storage, status vocabularies, documentation drift |
| `06-gaps-and-risks.md` | Register of gaps with IDs, severity and evidence |
| `07-open-questions.md` | What only the owner can answer, and which leader needs it |
| `08-brand.md` | Brand identity as evidenced in code |

Leadership structure, charters and handoff rules live in `../leadership/`. Agents are in `../.claude/agents/`, skills in `../.claude/skills/`.
