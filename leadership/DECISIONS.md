# Decision log

Only the owner approves a decision. Leaders propose; the CEO role records. One entry per decision, newest last. Status is `proposed`, `approved`, `rejected` or `superseded by D-nnn`.

Entry format:

```
## D-nnn. Short title
- Date: yyyy-mm-dd
- Status:
- Proposed by: role
- Decision: what will be done
- Why: the reason, with evidence tags and gap or question IDs
- Alternatives considered:
- Needs from the owner:
- Revisit when:
```

## D-001. Create the leadership structure and business knowledge base
- Date: 2026-10-12
- Status: proposed (awaiting owner review)
- Proposed by: Claude, from a full read of the repo
- Decision: adopt `business/` as the shared ground truth and the eight roles in `leadership/` as the advisory team. Agents and skills in `.claude/` follow them.
- Why: no business documentation existed beyond `CLAUDE.md`, which has drifted from the SQL (G-21). Most business facts are unknown (see `business/07-open-questions.md`), so the structure is built to ask rather than assume.
- Alternatives considered: a chief-of-staff agent (rejected: subagents cannot start other subagents; replaced by the `s2e-leadership-review` skill).
- Needs from the owner: answers to Q-01 to Q-04 first, then the questions each leader lists in their charter.
- Revisit when: Q-01 is answered. The real team may not match these roles.
