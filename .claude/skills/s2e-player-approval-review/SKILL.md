---
name: s2e-player-approval-review
description: Support the Street 2 Elite player approval workflow - draft or apply a checklist for deciding whether a pending player should be approved, held or rejected, and review how the approval process works in code. Use when defining approval criteria, training an admin, designing rejection handling, or reviewing changes to registration, approval or medical form handling. Recommends only; a person decides every real approval.
---

# Player approval review

Approval is the gate between a registered child and a booked session. In code, `children.approval_status` moves `pending` to `approved` or `rejected`, and (in the working tree) only approved players can be booked. Everything in it today is manual.

## Two modes

**A. Decision support.** The owner or admin describes a case in general terms (not a real child's identifying details). Apply the interim checklist and say what the case needs next.

**B. Process review.** Review code or a proposal against how the process really works (see `business/04-operating-processes.md` P2, P3, P8) and the gaps G-02, G-05, G-16.

## Interim checklist (DRAFT: the owner has not set criteria, Q-16)

What the system shows an admin, and what to check in each:

| Item | Check | Note |
|---|---|---|
| Name | Plausible, and not a duplicate of another record with the same date of birth under a different parent | Duplicates are not detected by the system |
| Date of birth | Under 18 and fits the academy's age range | Age groups are `[UNKNOWN]` (Q-13); the only rule is under 18 |
| Photo | Present, one person, shows a child's face clearly enough to recognise them at a session | The photo is the only identification; its purpose is the owner's to confirm |
| Medical form | Opened and read: dated, signed, legible, within the last year, and for this child | **The in-app "View Form" button does nothing.** Today the admin must open the file in the Supabase dashboard, which gives broad access. This is gap G-02 |
| Parent contact | Email present; phone number present | Phone is never collected at sign-up, only an admin can add one |
| Medical notes and conditions | Anything the parent should have told you | Parents cannot enter these in the app (G-15) |

Possible outcomes, each of which needs the owner's criteria to be real:

- **Approve** when every item above passes.
- **Hold** (leave pending) and ask the parent for what is missing. There is no "hold" status or message in the product, so this is manual.
- **Reject** when the case cannot be fixed. The system stores no reason and the parent sees only "Rejected" (G-05). Record the reason elsewhere and tell the parent by hand.

## Output for mode A

Case summary in general terms, each checklist item as pass, fail or "cannot check in the app", a recommended outcome, the message the parent should get (draft with `s2e-parent-comms`), and what the owner must decide. End with: "A person decides."

## Output for mode B

Findings table with severity and evidence, using the register IDs, then the controls that would close them. Typical ones: medical form review with expiry and a reviewer, structured conditions and emergency contact fields, a `hold` state with a reason field, re-approval when name, date of birth or photo change, a reason stored with every rejection, an audit of who decided and when (`approved_by`, `approved_at` exist).

## Rules

- Never approve or reject a real player, and never open a real child's form or photo. Work from described cases.
- Never invent criteria as if the owner had set them. Label the checklist DRAFT until Q-16 is answered.
- Do not describe the medical form as "approved" in a sense that implies review: the code sets it automatically.
- Safeguarding concerns in a case go to the owner immediately.
