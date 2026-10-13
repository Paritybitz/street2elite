# Parent message templates (DRAFTS)

Slots: `{{field}}` is data the system holds. `[OWNER TO SET: ...]` must be decided by the owner before use. `[SHORT]` is a text-message version.

Sender name: `[OWNER TO SET: sender name / reply-to address]` (the app has no contact address; "Contact Us" on the landing page goes nowhere).

---

## 1. Welcome after email confirmation
**Trigger:** the parent confirms their email. Not sent today.
**Subject:** Welcome to Street 2 Elite

Hi {{first_name}},

Your account is ready. Here is what happens next:

1. Register your player. We need their name, date of birth, a photo and a medical form.
2. We review each new player before they can be booked into sessions. `[OWNER TO SET: usual review time]`
3. Once approved, you can book sessions from the calendar.

Questions? `[OWNER TO SET: contact route]`

[SHORT] Welcome to Street 2 Elite. Register your player in your account; we review new players before booking opens. `[OWNER TO SET: contact]`

---

## 2. Player registered, waiting for review
**Trigger:** a player is added.
**Subject:** We have received your player's registration

Hi {{first_name}},

Thanks for registering {{player_first_name}}. We will review the details and the medical form before approving. `[OWNER TO SET: usual review time]` You will not be able to book sessions for {{player_first_name}} until they are approved.

---

## 3. Player approved
**Trigger:** admin approves.
**Subject:** {{player_first_name}} is approved

Hi {{first_name}},

{{player_first_name}} is approved. You can now book sessions from the calendar in your account.

[SHORT] {{player_first_name}} is approved at Street 2 Elite. You can book sessions in your account now.

---

## 4. More information needed (hold)
**Trigger:** admin needs something before deciding. There is no "hold" status in the product today.
**Subject:** One more thing we need for {{player_first_name}}

Hi {{first_name}},

We cannot approve {{player_first_name}} yet. `[REASON: written by the admin, specific and kind]` To continue, please `[WHAT THE PARENT MUST DO]` by `[OWNER TO SET: deadline, or remove]`.

Reply here or contact `[OWNER TO SET: contact route]` if you would like to talk it through.

---

## 5. Player not approved (reject)
**Trigger:** admin rejects. The reason is not stored by the system (G-05). **Safeguarding reviews this wording first.**
**Subject:** An update on {{player_first_name}}'s registration

Hi {{first_name}},

We are not able to approve {{player_first_name}}'s registration at this time. `[REASON: written by the admin]`. `[OWNER TO SET: whether and how the family can resubmit or appeal]`

If you would like to talk it through, please contact `[OWNER TO SET: contact route]`.

---

## 6. Booking confirmed
**Trigger:** a registration is made.
**Subject:** {{player_first_name}} is booked in

Hi {{first_name}},

{{player_first_name}} is registered for {{session_title}} on {{date}}, {{time}}, at {{venue}}.
Price: {{price}}. `[OWNER TO SET: payment status wording and what to do next if unpaid]`
To cancel, go to your dashboard. `[OWNER TO SET: cancellation window and refund rule]`

[SHORT] {{player_first_name}}: {{session_title}}, {{date}} {{time}}, {{venue}}. `[OWNER TO SET: payment/cancellation line]`

---

## 7. Booking cancelled by the parent
**Subject:** Booking cancelled

{{player_first_name}}'s place in {{session_title}} on {{date}} is cancelled. `[OWNER TO SET: refund or credit outcome]`

---

## 8. Session changed
**Trigger:** the academy moves a session. Not sent today (G-10).
**Subject:** {{session_title}} has changed

Hi {{first_name}},

{{session_title}} has changed. Before: {{old_date}}, {{old_time}}, {{old_venue}}. Now: {{date}}, {{time}}, {{venue}}.
If this does not work for you, `[OWNER TO SET: options, such as cancel for a refund or credit]`.

[SHORT] Change: {{session_title}} is now {{date}} {{time}} at {{venue}} (was {{old_date}} {{old_time}}). `[OWNER TO SET: option line]`

---

## 9. Session cancelled by the academy
**Subject:** {{session_title}} on {{date}} is cancelled

We are sorry. {{session_title}} on {{date}} will not go ahead. `[REASON: for example weather or coach unavailable, written by the admin]`. `[OWNER TO SET: refund, credit or replacement session]`

---

## 10. Payment pending
**Trigger:** a booking is `pending` payment. No payment exists yet (G-01).
**Subject:** Payment needed for {{player_first_name}}'s booking

Your booking for {{session_title}} on {{date}} is not yet paid. `[OWNER TO SET: how to pay, deadline, what happens if unpaid]`

---

## 11. Medical form expiring
**Trigger:** the medical form's `valid_to` is near. Not tracked today (G-02).
**Subject:** {{player_first_name}}'s medical form needs renewing

The medical form we hold for {{player_first_name}} runs out on {{valid_to}}. Please upload a new one in your account. `[OWNER TO SET: whether sessions can be booked while it is out of date]`

---

## 12. Session reminder
**Trigger:** the day before. Not sent today.
**Subject:** Tomorrow: {{session_title}}

{{player_first_name}} is booked for {{session_title}} tomorrow, {{time}} at {{venue}}. `[OWNER TO SET: what to bring, arrival time, weather line]`

---

## FAQ starters (answers are the owner's)

| Question | Answer source |
|---|---|
| How long does approval take? | `[OWNER TO SET]` |
| Why do you need a medical form and a photo? | `[OWNER TO SET]` with Safeguarding |
| Can I book before approval? | No: the product only lets approved players be registered `[WIP]` |
| How do I cancel or move a booking? | `[OWNER TO SET: rule]`; the product allows cancelling until the session starts `[WIP]` |
| What if it rains? | `[OWNER TO SET]` |
| How do I pay? | `[OWNER TO SET]` (no payment exists in the product) |
| What level is my child? | Explain the three levels once Head of Coaching and the owner agree the definitions (Q-13) |
| Who are the coaches? | `[OWNER TO SET]` |
