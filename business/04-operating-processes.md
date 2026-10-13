# 04. Operating processes, as built

Each flow is described as the code does it, not as it should work. Gap IDs (`G-xx`) point to `06-gaps-and-risks.md`. Tags are defined in `README.md`.

## P1. Parent sign-up and login `[CODE]`

1. Parent enters first name, last name, email, password (min 6), confirm password. `app/auth/signup/page.tsx`
2. App checks `profiles` for an existing email, then calls `supabase.auth.signUp` with names in metadata.
3. Parent is sent to "Check Your Email" and must click a confirmation link before the account is active.
4. Login is email and password, then redirect to `/dashboard`. There is no password-reset or "forgot password" link. `[CODE]` absence in `app/auth/login/page.tsx`
5. `/dashboard` reads `profiles.role`. `admin` gets the admin view. Everything else gets the parent view.

Gaps: no phone or emergency contact captured (G-15), no terms or privacy consent captured at sign-up (G-09), no password reset.

## P2. Player registration (parent) `[CODE]`

1. Parent clicks "Register Player" and fills: full name, date of birth (must be under 18, year-difference check), player photo (JPG or PNG, max 5 MB), medical form (PDF, JPG or PNG, max 5 MB).
2. Sequence on submit: insert `children` row (status defaults to `pending`), upload photo to `player-photos/{user}/{child}/photo.{ext}`, upload medical form to `medical-forms/{user}/{child}/medical.{ext}`, write `photo_url`, insert `medical_forms` row with `valid_from` = now, `valid_to` = now + 1 year and **`status: "approved"`**.
3. If the photo or medical upload fails, the earlier steps are not rolled back, so a child row can exist without files. If the `photo_url` update or the `medical_forms` insert fails, the code only warns. `[CODE]` `components/add-player-modal.tsx`
4. The parent sees the player with a "Pending Approval" badge.

Gaps: medical form is self-approved (G-02), no emergency contact, medical conditions or consent captured (G-15), skill level not assessed (G-06), no rollback (G-13).

## P3. Player approval (admin) `[CODE]`

1. A realtime subscription on `children` refreshes the admin Players area. A bell icon shows the pending count.
2. Admin sees pending players with photo, age and parent ("Manager") name. Opening a player shows details and notes.
3. Approve sets `approval_status = approved`, `approved_at`, `approved_by`. Reject sets `rejected` with the same stamps. No reason is requested or stored (the `rejection_reason` column is never written). `[CODE]`
4. The "View Form" button in the player modal has no handler, so the admin cannot open the uploaded medical form from the app. `[CODE]` `components/player-details-modal.tsx:471`
5. No notification is sent to the parent. They see the badge change next time they open the dashboard.
6. Admin can edit a player's name, DOB, skill level, medical notes, and the parent's name and phone, or permanently delete the player.

Gaps: medical form cannot be reviewed (G-02), no rejection reason or path to resubmit (G-05), approval is not re-triggered when a parent later edits an approved player (G-05), parent contact joined with a cyclic-assignment fallback that can show the wrong parent (G-14).

## P4. Session management (admin) `[CODE]`

1. Admin opens the Sessions calendar (FullCalendar, month view; only active sessions with date today or later load).
2. Click a date to create, click an event to edit, drag to reschedule, drag edge to resize. Colour shows availability: green, amber at 3 or fewer spots, red when full.
3. "Delete" sets `is_active = false`. The dialog says it "cannot be undone" even though it is a soft delete. Existing bookings are left untouched.
4. "View Participants" lists confirmed bookings with child name, age, the parent's name, email and phone. `[WIP]` The roster is live (realtime), shows Paid or Unpaid per booking, and lets the admin remove a registration, which soft-cancels it. The parent sees the change but is not messaged.
5. Rescheduling or deleting a session sends no notice to booked parents. `[CODE]` no messaging code exists.

Gaps: no recurring-session tool (the seed script generates them in SQL), no notifications (G-10), no attendance.

## P5. Booking `[WIP]` unless stated

**Committed code (`[CODE]`):** the parent calendar only shows a toast on click. A separate page `/sessions/[id]/book` with `BookingForm` exists but nothing links to it. It writes `status: confirmed, payment_status: paid` without charging anyone, then redirects to `/sessions/booking-confirmation/{id}`, which does not exist.

**Working tree (`[WIP]`, uncommitted, seen 2026-10-12):**

1. Parent clicks a session on the calendar and sees a modal: date, time, venue, coach, price, spots, level, description, and each of their players.
2. For each player: "Awaiting approval" or "Not approved" unless approved. Approved players get "Register". Registered players show a badge and "Cancel" until the session starts.
3. Register creates a `bookings` row `status = confirmed`. `payment_status` is `paid` for free sessions and `pending` for paid sessions. No payment is taken.
4. A cancelled booking is revived if the same child re-registers (unique on session and child).
5. Capacity, session availability and child eligibility are enforced by a database trigger, `enforce_booking_rules`, defined in the uncommitted script `scripts/bookings_realtime_and_rules.sql` `[WIP]`. It locks the session row and rejects a confirmed booking if the session is inactive (`session_unavailable`), the child is not the parent's own approved child (`child_not_eligible`), or the session is at capacity (`session_full`). Whether this script has been run on the live database is `[UNKNOWN]`. The trigger does **not** check the medical form, the session's skill level, whether the session has already started, or any cancellation cut-off. (G-04, G-17)
5a. An optional script `scripts/bookings_rls_policies.sql` `[WIP]` adds row-level security on `bookings` only: any signed-in user can read all bookings (ids only), a parent can insert bookings for themselves, a parent or an admin can update their own or any booking, nobody can delete. A parent can therefore update any column of their own booking, including `payment_status`. (G-23)
6. Calendar counts update live via a realtime subscription on `bookings` and `sessions`.
7. Skill level is shown but not enforced. A beginner can book an advanced session. `[WIP]` `lib/bookings.ts`

Gaps: no payment (G-01), no cancellation cut-off or refund rule (G-09), no waiting list, no sibling or multi-session booking, no confirmation message.

## P6. Payment `[CODE]`

None. `bookings.payment_intent_id` and `payment_status = refunded` exist in the schema but nothing reads or writes them. The parent dashboard shows a "Paid" or "Unpaid" badge only. No processor, invoice, receipt, refund or reconciliation.

## P7. Attendance and coaching delivery `[CODE]`

`bookings.checked_in` and `checked_in_at` exist in the schema and are never used. A legacy admin quick-action links to `/admin/checkin`, which does not exist. There is no coach view, register, session notes, player assessment or progress tracking.

## P8. Medical form lifecycle `[CODE]`

Uploaded at registration (required). Valid for one year from upload by construction (`valid_to`). Nothing checks `valid_to`, nothing marks forms `expired`, nothing reminds the parent, and nothing stops booking with an expired form. A parent can replace the form from the edit modal; that path uses `upsert` with no conflict key, so it inserts another row each time. (G-02)

## P9. Communication `[CODE]`

The only outbound channels are Supabase Auth's confirmation email and a `mailto:` link the admin can open from the player modal. There is no transactional email, SMS, push or in-app inbox. The landing page "Contact Us" link goes to `#`. (G-11)

## P10. Merch `[CODE]`

Static page, no purchase path. See `03-offer-and-pricing.md`.
