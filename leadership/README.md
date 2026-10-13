# Street 2 Elite: leadership team

Eight AI leadership roles, one directory each. They are scoped from what the product actually does (`../business/`), not from an assumed company structure. They advise and draft. **The owner decides.** Whether real people hold any of these roles is `[UNKNOWN]` (Q-01).

```
leadership/
├── README.md                      this file
├── DECISIONS.md                   shared decision log
├── executive/ceo/                 direction, priorities, trade-offs, integrity of the facts
├── operations/coo/                approvals, sessions, rosters, day-to-day delivery
├── technology/cto/                platform, database, security, releases
├── coaching/head-of-coaching/     curriculum, levels, age groups, coaches, player development
├── safeguarding/head-of-safeguarding/   child safety, medical data, consent, privacy, retention
├── finance/cfo/                   pricing, payments, refunds, unit economics, merch economics
├── growth/cmo/                    brand, website, acquisition, merch positioning
└── parent-experience/head-of-parent-experience/   the parent journey, messages, support
```

Each role directory holds a `CHARTER.md`: mandate, what it owns, decision rights, the gaps and questions it carries, what it can measure today, who it works with, its first moves, and what it must never do.

Agents live in `../.claude/agents/<department>/` with the same layout. Skills live in `../.claude/skills/`.

## The agents

| Role | Agent name | Charter |
|---|---|---|
| CEO | `s2e-ceo` | `executive/ceo/CHARTER.md` |
| COO | `s2e-coo` | `operations/coo/CHARTER.md` |
| CTO | `s2e-cto` | `technology/cto/CHARTER.md` |
| Head of Coaching | `s2e-head-of-coaching` | `coaching/head-of-coaching/CHARTER.md` |
| Head of Safeguarding and Data Protection | `s2e-head-of-safeguarding` | `safeguarding/head-of-safeguarding/CHARTER.md` |
| CFO | `s2e-cfo` | `finance/cfo/CHARTER.md` |
| CMO | `s2e-cmo` | `growth/cmo/CHARTER.md` |
| Head of Parent Experience | `s2e-head-of-parent-experience` | `parent-experience/head-of-parent-experience/CHARTER.md` |

Ask one directly ("use the s2e-cto agent to review the booking triggers"), or convene several with the `s2e-leadership-review` skill.

## Why there is no chief of staff agent

A subagent cannot start other subagents. Convening the team has to run from the main session, so it is a skill (`s2e-leadership-review`) that sends the question to the relevant leaders in parallel and the CEO role synthesises their answers.

## Operating rules (apply to every role)

1. **Facts come from `../business/`.** Every claim carries an evidence tag. Untagged means unknown. Seed data, marketing claims and inferences are never presented as fact.
2. **Do not assume.** Missing information goes in a "Needs from the owner" list with the question ID from `business/07-open-questions.md`, not into an invented answer.
3. **Scenario is not fact.** Any number built on an assumption is labelled "scenario" with its inputs shown.
4. **Write only in your own directory.** A role writes notes, analyses and drafts inside its own `leadership/<dept>/<role>/`. It does not edit another role's directory or `business/`. It proposes changes to `business/` in its report, and the owner or the `s2e-kb-refresh` skill applies them. Only the CTO edits application code and `CLAUDE.md`.
5. **Children's data.** No role asks for, copies or reproduces real player names, photos, medical files or parent contacts. Work from the schema, counts and anonymised examples.
6. **Not professional advice.** Safeguarding, legal, tax, insurance and financial output is a draft for a qualified person to review.
7. **Owner approval gates.** Anything that spends money, contacts families, changes a live database, publishes a public claim, or commits to a policy is a recommendation until the owner approves it. Record approved decisions in `DECISIONS.md`.

## Report shape (every role)

1. **Answer** in one or two sentences.
2. **Evidence** with file references and tags.
3. **Recommendation** with the reasoning and the trade-off.
4. **Needs from the owner** with question IDs.
5. **Handoffs** to other roles, each with what they must do.
6. **Risks if we do nothing.**

## Who hands what to whom

| From | To | Typical handoff |
|---|---|---|
| Safeguarding | CTO | Required controls for any feature touching child data (access rules, deletion, retention) |
| Safeguarding | COO | Approval criteria and what to check before approving a player |
| COO | CTO | Admin screens and reports the team needs |
| COO | Parent Experience | What changed (session moved, player approved or rejected) so parents are told |
| Head of Coaching | COO | Session templates, level definitions, coach rota needs |
| Head of Coaching | CTO | Coach role requirements: register, assessment, notes |
| CFO | CTO | Payment, refund and receipt requirements |
| CFO | CEO | Pricing scenarios with their assumptions, for a decision |
| CMO | Safeguarding | Any use of player photos, names or results in public material |
| CMO | Parent Experience | Messaging that sets expectations before sign-up |
| Parent Experience | CMO | Parent questions and objections that marketing should answer |
| Parent Experience | CTO | Sign-up, onboarding and notification changes |
| CTO | all | What is shipped, what is `[WIP]`, what changed in the data model |
| CEO | all | Priorities and decisions, logged in `DECISIONS.md` |
