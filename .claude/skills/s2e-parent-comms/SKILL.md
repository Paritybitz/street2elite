---
name: s2e-parent-comms
description: Draft Street 2 Elite messages to parents - welcome, player registered, approved, more information needed, rejected, booking confirmed or cancelled, session changed or cancelled, payment pending, medical form expiring, reminders - as drafts with placeholders for anything the owner has not decided. Use when writing templates, notification copy, FAQs or onboarding text. Drafts only; never sends.
---

# Parent communications

The platform sends one email today: the sign-up confirmation from Supabase Auth. Everything else here is a **draft** for the owner to approve, and a requirement for the CTO if it is to be automated (G-10, G-18). The channel (email, SMS, WhatsApp, in-app) is `[UNKNOWN]` (Q-23, Q-24), so write channel-neutral text and give a short version for SMS-length use.

Templates are in [references/templates.md](references/templates.md).

## Steps

1. Identify the trigger, the audience (one parent), and what the parent must do next.
2. Take the template for that trigger and fill only what is known. Every unknown stays a visible slot:
   - `{{first_name}}`, `{{player_first_name}}`, `{{session_title}}`, `{{date}}`, `{{time}}`, `{{venue}}`: data fields the system holds.
   - `[OWNER TO SET: ...]`: a policy, price, deadline, contact route or promise. Never write a value there yourself.
3. Check the draft with the rules below, and with `s2e-brand-copy` for tone and claims.
4. Give the owner: the message, its trigger, the slots to fill, and what the platform would need to send it automatically.

## Voice

Warm, plain, short, direct. Speak to the parent, name the child by first name only, say what happened, what happens next, and who to contact. Consistent with the brand evidence in `business/08-brand.md`: confident and sporty in public copy, calm and functional in account messages. No exclamation marks in anything about safety, medical forms, rejection or cancellation.

## Rules

- **No policy invented.** Cancellation windows, refund promises, response times, payment deadlines, approval times and complaint routes are `[OWNER TO SET]` until the owner sets them.
- **Minimum personal data.** First name of the child only. Never include medical information, date of birth, or another family's details. Subject lines carry no child name.
- **Rejection and "more information needed"** always say what can be done next. The system stores no rejection reason (G-05), so the sender must have one; the draft leaves it as `[REASON: written by the admin]`. Safeguarding wording is reviewed by the Safeguarding role first.
- **Session changes and cancellations** state the old and new details, the effect on the booking, and the owner's refund or transfer rule as a slot.
- Never claim an email has been sent or a family contacted.
- Do not use real family names, addresses or contact details in drafts or examples.
