---
name: s2e-safeguarding-review
description: Review a Street 2 Elite feature, code change, schema change, database policy or process for risks to children and their data - photos, medical forms, dates of birth, parent contacts, access, consent, retention, deletion, logging and third parties. Use before building or merging anything that touches player or parent data, and when asked whether something is safe to launch. Findings only; not legal advice.
---

# Safeguarding and data review

Not legal advice. Jurisdiction is unconfirmed (Q-02). Say what was checked, what was not, and what needs a qualified adviser.

## Steps

1. **Define the scope.** What is being reviewed (diff, file list, feature description, SQL)? If it is a diff, run `git diff` and `git status`; include untracked files, which are the easiest to miss.
2. **Map the child data it touches.** For each data item write: what it is, where it is stored (table or bucket), who can read it, who can write it, how it leaves the system (display, log, email, export), how it is deleted. Items in this product: child name, date of birth, photo, medical form file, medical notes, skill level, approval status, parent name, email, phone, booking history.
3. **Apply the checklist** in [references/checklist.md](references/checklist.md). Read the code that does the thing; do not trust names or comments.
4. **Compare with the known baseline** in `business/06-gaps-and-risks.md` (G-02, G-03, G-04, G-13, G-14, G-15, G-16). Say whether the change fixes, worsens or leaves each one alone.
5. **Write findings.** One row per finding: ID, severity, what, evidence (file and line, with tag `[CODE]` or `[WIP]`), the failure scenario in plain words, the control that fixes it, who builds it.
6. **Give a release view:** "no S1 finding", or "S1 findings open: list". The owner decides; you recommend.

## Severity

S1 harm to a child or exposure of personal data. S2 weak control likely to cause harm or loss later. S3 weak practice. S4 hygiene. Same scale as the register.

## Output

```
Scope: ...
Checked: ...    Not checked: ... (policies in the live database, bucket settings, anything needing a real record)
Data map: table
Findings: table, most severe first
Baseline items affected: G-xx fixed / worsened / unchanged
Release view: ...
Needs from the owner: question IDs
Controls for the CTO: concrete list
```

## Rules

- Never view, request or reproduce a real child's record. Use the schema, code, counts and invented examples.
- Do not say "compliant", "safe" or "lawful". Say what was checked.
- If anything you read looks like a disclosure, an incident or a live concern about a real child, stop the review and tell the owner at once. Do not analyse it.
- If a finding depends on live database state you cannot see (policies, bucket visibility), list it as a question (Q-18), not as a finding of fact.
- A new third party that receives personal data (email, payments, analytics, storage) is always a finding to raise, even when well-intentioned.
