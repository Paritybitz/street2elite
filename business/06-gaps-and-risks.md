# 06. Gaps and risks register

Every item is something found in the repo, with its evidence. Severity is a judgement about harm to children, to trust, to revenue or to operations. It is not a legal opinion. "Owner" is the leadership role that carries the item (see `../leadership/README.md`). Tags are defined in `README.md`.

Severity: **S1** harm to a child or personal data, fix before real users. **S2** blocks revenue or core operations. **S3** erodes trust or wastes effort. **S4** hygiene.

## S1. Children and personal data

| ID | Gap | Evidence | Owner |
|---|---|---|---|
| G-02 | **Medical form is self-approved and cannot be reviewed.** Any file a parent uploads is stored as `status: approved`. The admin "View Form" button does nothing. Nothing checks `valid_to`, so an expired form never blocks booking. A replace from the edit modal inserts a new row each time (no unique key). | `add-player-modal.tsx:196`, `edit-player-modal.tsx:185`, `player-details-modal.tsx:471` | Safeguarding, COO |
| G-03 | **Child photos are served by public URL.** Code builds public storage URLs for minors' photos. Whether the bucket is public, and whether anyone can list it, is not in the repo. | `parent-dashboard.tsx` (`getPublicUrl`), `admin-dashboard.tsx:282`, `player-details-modal.tsx:113` | Safeguarding, CTO |
| G-04 | **Access rules are largely not versioned.** No committed RLS, trigger, function or storage policy. The profile-on-signup trigger and the old admin setup script were deleted. Uncommitted scripts `[WIP]` add a booking trigger and RLS for `bookings` only, and nothing proves they have been run. There is no versioned rule for `children`, `profiles`, `medical_forms` or storage, so a review cannot confirm that parent A cannot read parent B's children or medical files, or that a parent cannot set their own role. | `scripts/` contents, commit `5156d54`, `bookings_rls_policies.sql` `[WIP]` | CTO, Safeguarding |
| G-13 | **Deleting a player leaves files behind.** Parent and admin delete remove the database row (cascading bookings and medical forms) but no code removes the photo or medical file from storage. Registration is non-transactional, so a failed upload can leave a child row with no files. | `parent-dashboard.tsx` `handleDeletePlayer`, `player-details-modal.tsx` `handleDeletePlayer`, no `.remove(` anywhere | CTO, Safeguarding |
| G-14 | **Admin view can show the wrong parent against a child.** If the profile lookup returns nothing, the code assigns profiles to children in rotation "for testing". An admin could email or phone the wrong family. Debug logs print child and profile data to the browser console. | `admin-dashboard.tsx:136-145` | CTO |
| G-15 | **No emergency contact, allergy or condition capture, guardian consent or photo consent.** Parents cannot enter medical notes at all. Phone is never asked. | schema, `add-player-modal.tsx`, `signup/page.tsx`, `medical_notes` writers | Safeguarding, Parent Experience |
| G-16 | **Parent edits after approval are not re-reviewed.** A parent can change an approved player's name, date of birth and photo and approval stays `approved`. | `edit-player-modal.tsx` (no `approval_status` handling) | Safeguarding, COO |

## S2. Revenue and operations

| ID | Gap | Evidence | Owner |
|---|---|---|---|
| G-01 | **No payment.** Paid sessions are booked as `pending` and nothing collects money. `payment_intent_id` and `refunded` are unused. The legacy form marks bookings `paid` with no charge. | `lib/bookings.ts` `[WIP]`, `booking-form.tsx:53`, schema | CFO, CTO |
| G-05 | **Rejection is a dead end.** No reason is collected (`rejection_reason` is never written), the parent only sees a red badge, and there is no resubmit path. | `admin-dashboard.tsx` `handleRejectPlayer`, grep of `rejection_reason` | COO, Parent Experience |
| G-06 | **Skill level is never assessed and never enforced.** Every child defaults to `beginner`; only an admin can change it; booking ignores session level. Levels are the product's main differentiator (`beginner / intermediate / advanced`). | `children.sql`, `player-details-modal.tsx`, `lib/bookings.ts` | Head of Coaching |
| G-07 | **The `coach` role is empty.** Schema allows it; the app treats coaches as parents. Coach is free text on a session. No register, rosters for coaches, check-in or assessment. | `dashboard/page.tsx`, `sessions.sql`, unused `checked_in` | Head of Coaching, CTO |
| G-09 | **No policies exist.** No terms, privacy notice, cancellation or refund rule. `/terms` is linked by the legacy form and does not exist. Cancellation is allowed any time before start `[WIP]`. The legacy form shows `$`, elsewhere `£`. | `booking-form.tsx:151`, `lib/bookings.ts` `[WIP]` | CEO, CFO, Safeguarding |
| G-10 | **Changes to sessions notify nobody.** Drag-to-reschedule and delete leave bookings in place and send nothing. There is no email, SMS or in-app messaging in the product. | `academy-calendar.tsx` `handleEventDrop`, `session-modal.tsx` | COO, Parent Experience |
| G-12 | **Admin has no business view.** No bookings list, payments, revenue, attendance or reports. The legacy `/admin` stats page is unlinked and its links lead to pages that do not exist. Admin dropdown items "Edit" and "Delete" on pending players do nothing. | `admin-dashboard.tsx:405-409`, `app/admin/page.tsx`, `quick-actions.tsx` | COO, CTO |
| G-17 | **Registration rules are incomplete.** Committed code checks capacity in the browser only. The `[WIP]` trigger fixes capacity, approval and active-session checks (if it has been run, G-04) but does not check the medical form, the session's skill level, whether the session has started, or a cancellation cut-off. No waiting list. | `booking-form.tsx`, `bookings_realtime_and_rules.sql` `[WIP]` | CTO, COO |
| G-23 | **A parent could mark their own booking as paid.** The draft RLS lets a parent insert and update any column of their own bookings, and `payment_status` is chosen by the browser (`paid` for free sessions, `pending` otherwise). Harmless while nothing is charged; a revenue-integrity hole the moment payment exists. Payment status should only be written by a trusted server path. | `bookings_rls_policies.sql:35-45` `[WIP]`, `lib/bookings.ts:127,142` `[WIP]` | CFO, CTO |
| G-19 | **No age groups or squads.** Sessions and players have a skill level but no age band. Only "under 18" is checked, by year difference, so a player turning 18 this calendar year passes. | `add-player-modal.tsx:31-32`, schema | Head of Coaching |

## S3. Trust and brand

| ID | Gap | Evidence | Owner |
|---|---|---|---|
| G-11 | **Unverified or non-working public content.** "Trusted by over 500 young athletes across the region" `[CLAIM]`. "Contact Us" goes to `#`. Merch "Add to Cart" and "Contact Support" do nothing. The four merch image files do not exist in `public/`. | `app/page.tsx:48,106`, `app/merch/page.tsx:12-33,78,90` | CMO |
| G-18 | **No sign-up follow-up.** No welcome, no "what happens next" after sign-up, no password reset, no guidance that approval is required before booking. | `signup-success/page.tsx`, `login/page.tsx` | Parent Experience |

## S4. Engineering hygiene

| ID | Gap | Evidence | Owner |
|---|---|---|---|
| G-20 | No automated tests. Heavy use of `any`. Debug `console.log` calls in several components. Eight legacy components unused. `/sessions` and `/calendar` are duplicates. | `CLAUDE.md`, grep | CTO |
| G-21 | `CLAUDE.md` has drifted from the SQL (see `05-platform-and-data.md`). | `CLAUDE.md` vs `scripts/` | CTO |
| G-22 | The calendar loads only sessions dated today or later, so history is invisible, and there is no list view, filter or search for parents. | `academy-calendar.tsx` | CTO, Parent Experience |

## Reading order for planning

Safeguarding items (G-02, G-03, G-04, G-13, G-14, G-15, G-16) come first because they concern children's data and wellbeing and are cheap relative to their downside. Payment (G-01) and policies (G-09) come next because nothing can be sold responsibly without them. The `s2e-roadmap-prioritiser` skill turns this register into a ranked plan once the owner has answered `07-open-questions.md`.
