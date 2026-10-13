# 02. People and roles

Tags are defined in `README.md`.

## Roles in the database `[CODE]`

`profiles.role` is constrained to `parent`, `admin` or `coach` (`scripts/profiles.sql`). Default is `parent`. `CLAUDE.md` lists only `admin | parent`, so the document is out of date (see `05-platform-and-data.md`).

| Role | What it can actually do in the app today |
|---|---|
| `parent` | Sign up, register players, edit or delete own players, view own upcoming bookings. Register players for sessions `[WIP]`. Calendar was read-only for parents in committed code. |
| `admin` | Everything on `/dashboard` for admins: session calendar (create, edit, drag to reschedule, resize, soft-delete, view participants) and the Players area (approve, reject, edit, remove, message the parent by mailto link). |
| `coach` | **Nothing distinct.** `/dashboard` sends every non-admin to the parent view. Only the dead legacy `/admin` page lets `coach` in. `[CODE]` `app/dashboard/page.tsx`, `app/admin/page.tsx` |

Coaches also exist as free text: `sessions.coach_name` is a plain string, not linked to a profile. `[CODE]` `scripts/sessions.sql`

## How roles are assigned `[CODE]`

- Sign-up creates an auth user with first and last name in metadata. Role defaults to `parent`. `app/auth/signup/page.tsx`
- Nothing in the app promotes a user to `admin` or `coach`. How the first admin is created is `[UNKNOWN]`. An old setup script `004_admin_setup.sql` was deleted in commit `5156d54`.
- The profile row is expected to exist after sign-up. The trigger that creates it was in a deleted script (`002_profile_trigger.sql`) and is not versioned now. `[CODE]` git history

## The customer `[CODE]` + `[INFERRED]`

- The paying customer is the parent. The beneficiary is the child. The two are separate records (`profiles` and `children`).
- Parent data collected at sign-up: first name, last name, email, password (minimum 6 characters). Phone is optional in the schema and **never collected** by any form. An admin can type one in. `[CODE]`
- Player data collected: full name (split on the first space), date of birth, photo (required), medical form (required). `[CODE]`
- Skill level defaults to `beginner` and is never asked at registration. Only an admin can change it. `[CODE]` `scripts/children.sql`, `components/player-details-modal.tsx`
- Medical notes can only be typed by an admin. Parents cannot enter allergies or conditions in any form. `[CODE]` search of `medical_notes` writers
- **Not collected anywhere:** emergency contact, second guardian, who may collect the child, photo or media consent, school, position, address. `[CODE]` absence confirmed by schema and form review.

## Internal users

Whether there is any human staff beyond the repo owners is `[UNKNOWN]`. The leadership structure in `../leadership/` is a set of AI leadership roles scoped from what the product does. It does not describe real employees.
