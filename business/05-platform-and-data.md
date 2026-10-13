# 05. Platform and data

Tags are defined in `README.md`. App commands run from `street2elite/` (see `CLAUDE.md`).

## Stack `[CODE]`

Next.js 15.2.4 (App Router, React 19, TypeScript), Supabase (Postgres, Auth with email and password, Storage, Realtime), Tailwind v4, shadcn-style Radix components in `components/ui/`, FullCalendar v6, react-hook-form with zod, Sonner toasts, date-fns, framer-motion. `npm run dev | build | lint`. **No tests.**

Two Supabase clients exist and must not be mixed up: `lib/server.ts` (Server Components) and `lib/client.ts` (Client Components). `middleware.ts` refreshes the session and redirects signed-out users away from `/dashboard` only. Other pages (`/sessions`, `/calendar`, `/admin`, booking) do their own `getUser()` check.

Environment variables present locally (names only, values deliberately not read): Supabase URL and anon key, service-role key, JWT secret, and Postgres connection strings. `.env.local` is gitignored. No payment, email or analytics keys exist, which confirms none of those integrations are configured. `[CODE]`

## Routes `[CODE]`

| Route | Purpose | State |
|---|---|---|
| `/` | Landing: logo, tagline, Join Now, Sign In, Merch | Live |
| `/auth/signup`, `/auth/login`, `/auth/signup-success` | Auth | Live |
| `/dashboard` | Admin or parent view by role | Live |
| `/sessions`, `/calendar` | Same calendar page twice, signed-in only | Live, duplicate |
| `/sessions/[id]/book` | Legacy booking page | Unreachable, mock payment |
| `/merch` | Static merch | Live, non-functional |
| `/admin` | Legacy stats page | Not linked; its quick-action links point to pages that do not exist |

Links to routes that do not exist: `/terms`, `/dashboard/children/add`, `/dashboard/children`, `/dashboard/bookings`, `/sessions/booking-confirmation/[id]`, `/sessions/[id]` (redirect target), `/admin/sessions`, `/admin/sessions/create`, `/admin/bookings`, `/admin/users`, `/admin/analytics`, `/admin/settings`, `/admin/checkin`.

Components imported by nothing (legacy): `dashboard-client`, `session-details-modal`, `sessions-list`, `sessions-filters`, `children-overview`, `upcoming-bookings`, `dashboard-stats`, `dashboard-header`.

## Schema `[CODE]` `street2elite/scripts/*.sql`

| Table | Columns that matter | Constraints |
|---|---|---|
| `profiles` | `id` = auth user id, `first_name`, `last_name`, `phone`, `email`, `role` | `role` in parent, admin, coach. `email` unique. |
| `children` | `parent_id`, `first_name`, `last_name`, `date_of_birth`, `skill_level`, `medical_notes`, `photo_url`, `approval_status`, `approved_by`, `approved_at`, `rejection_reason` | `skill_level` in beginner, intermediate, advanced. `approval_status` in pending, approved, rejected. Cascade delete from parent. |
| `sessions` | `title`, `description`, `date`, `start_time`, `end_time`, `location`, `coach_name`, `skill_level`, `max_participants`, `price`, `is_active` | `skill_level` in beginner, intermediate, advanced, all. |
| `bookings` | `session_id`, `child_id`, `parent_id`, `status`, `payment_status`, `payment_intent_id`, `checked_in`, `checked_in_at` | unique (`session_id`, `child_id`). `status` in pending, confirmed, cancelled, completed. `payment_status` in pending, paid, refunded. Cascade delete from session, child and parent. |
| `medical_forms` | `child_id`, `file_url`, `valid_from`, `valid_to`, `status` | `status` in pending, approved, expired. No unique on `child_id`. |

Storage buckets used by code: `player-photos` and `medical-forms`, path `{user_id}/{child_id}/{photo|medical}.{ext}`. Photos are read through public URLs (`getPublicUrl` and `/storage/v1/object/public/...`), so the code assumes `player-photos` is a public bucket. The bucket's real visibility and policies are `[UNKNOWN]`. No code ever reads the `medical-forms` bucket back, and no code deletes any stored file.

## What is **not** versioned `[CODE]`

No committed file contains a row-level-security policy, trigger, function or storage policy. The earlier setup scripts (`001_create_tables`, `002_profile_trigger`, `003_seed_sessions`, `004_admin_setup`) were deleted in commit `5156d54`.

Two **uncommitted** scripts appeared on 2026-10-12 `[WIP]`:
- `scripts/bookings_realtime_and_rules.sql`: adds `bookings`, `sessions` and `children` to the realtime publication, and the `enforce_booking_rules` trigger (see `04-operating-processes.md` P5).
- `scripts/bookings_rls_policies.sql` ("OPTIONAL"): RLS on `bookings` only, and an `is_admin()` function that recognises `admin` but not `coach`.

Still not versioned anywhere: the profile-on-sign-up trigger, any RLS on `profiles`, `children`, `sessions` and `medical_forms`, and every storage policy. Whether the WIP scripts have been run, and what the live policies are, is `[UNKNOWN]` (Q-18). Behaviour that depends on the live database therefore cannot be audited from the repo. (G-04)

## Realtime `[CODE]`

`AdminDashboard` listens to `children`. `AcademyCalendar` listens to `sessions` and, in the working tree, `bookings` `[WIP]`. Both refetch on any change.

## Drift between `CLAUDE.md` and the SQL `[CODE]`

`CLAUDE.md` was written 2026-06-27. On 2026-10-12 it was being edited in the working tree `[WIP]` to describe the booking flow, but the schema description below was still unchanged. It differs from the SQL as follows:

- Roles: says `admin | parent`; SQL allows `coach` too.
- `bookings.status`: says `'confirmed'`; SQL allows pending, confirmed, cancelled, completed.
- `bookings.payment_status`: says `paid | unpaid`; SQL allows pending, paid, refunded (there is no `unpaid`).
- `sessions`: omits `title` and `description`.
- `children`: omits `skill_level`, `medical_notes`, `rejection_reason`.
- `bookings`: omits `checked_in`, `checked_in_at`, `payment_intent_id`.
- Known Issue 2 ("booking flow is incomplete") is being addressed in the working tree `[WIP]`.
