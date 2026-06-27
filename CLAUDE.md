# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Street 2 Elite is an MVP web platform for a youth football academy. It handles player registration (with document uploads), an admin approval workflow, and session booking via an interactive calendar.

The app lives in the `street2elite/` subdirectory. All commands below must be run from inside that directory.

## Commands

```bash
cd street2elite

npm run dev      # Start dev server (Next.js + Turbopack) at localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

There are no tests.

## Architecture

### Tech Stack
- **Next.js 15** (App Router, React 19, TypeScript)
- **Supabase** — Postgres database, Auth (email/password), Storage (file uploads), Realtime subscriptions
- **Tailwind CSS v4** + Radix UI primitives (shadcn-style components in `components/ui/`)
- **FullCalendar v6** — interactive session calendar
- **react-hook-form + zod** — form validation
- **Sonner** — toast notifications

### Supabase Client Pattern
There are two Supabase clients — use the right one or auth will break:
- `lib/server.ts` — `createClient()` for **Server Components** (uses `next/headers` cookies)
- `lib/client.ts` — `createClient()` for **Client Components** (`"use client"`)

### Auth & Middleware
`middleware.ts` → `lib/middleware.ts` runs on every request (excluding static assets). It refreshes the Supabase session and redirects unauthenticated users away from `/dashboard`. Protected pages also do their own server-side `getUser()` check and `redirect()`.

### Role-Based Routing
`/dashboard` is the single authenticated entry point. It server-side checks `profiles.role`:
- `'admin'` → renders `<AdminDashboard>` (sessions calendar + player approval)
- anything else → renders `<ParentDashboard>` (manage own players + upcoming bookings)

There is also a legacy `/admin` route with stats widgets — it is not linked from anywhere in the main UI and is effectively dead code.

### Database Tables
| Table | Key Fields |
|---|---|
| `profiles` | `id` (= Supabase auth UID), `role` ('admin'\|'parent'), `first_name`, `last_name`, `email`, `phone` |
| `children` | `parent_id` → profiles, `approval_status` ('pending'\|'approved'\|'rejected'), `photo_url`, `date_of_birth`, `approved_by`, `approved_at` |
| `sessions` | `date`, `start_time`, `end_time`, `location`, `coach_name`, `skill_level`, `max_participants`, `price`, `is_active` |
| `bookings` | `parent_id`, `child_id`, `session_id`, `status` ('confirmed'), `payment_status` ('paid'\|'unpaid') |
| `medical_forms` | `child_id`, `file_url`, `valid_from`, `valid_to`, `status` |

### Storage Buckets
- `player-photos` — player headshots (path: `{user_id}/{child_id}/photo.{ext}`)
- `medical-forms` — annual doctor's physicals (path: `{user_id}/{child_id}/medical.{ext}`)

### Key Components
- `AcademyCalendar` — FullCalendar wrapper used by both roles. `isAdmin=true` enables drag-to-reschedule, resize, date-click to create, and event-click to edit. `isAdmin=false` is currently read-only (event click shows a toast, not a booking flow).
- `SessionModal` — admin create/edit form for sessions. "Delete" soft-deletes by setting `is_active: false`. Has a "View Participants" panel that switches the modal content.
- `AddPlayerModal` — zod-validated form requiring full name, DOB, a photo upload, and a medical form upload. All three Supabase operations (insert child row, upload photo, upload medical form) happen sequentially on submit.
- `PlayerDetailsModal` — admin view of a single player with approve/reject actions.

### Realtime
Both `AdminDashboard` and `AcademyCalendar` subscribe to Supabase Realtime on their respective tables (`children` and `sessions`) and re-fetch data on any change. Channels are cleaned up on unmount.

## Known Issues

1. **Debug console.logs** — `admin-dashboard.tsx` and `session-modal.tsx` have leftover `console.log` statements from debugging the Supabase FK join between `children.parent_id` and `profiles.id`. There is also a fallback in `AdminDashboard.fetchData()` that cyclically assigns profiles to children when the join returns empty — this is a workaround, not intended behavior.

2. **Parent booking flow is incomplete** — The `/sessions/[id]/book` page and `BookingForm` component exist but are unreachable from the `AcademyCalendar` (parents get a toast on event click instead of being routed to book). Payments (`payment_status` field) are also not yet wired to any payment processor.

3. **Merch store is static** — `app/merch/page.tsx` has hardcoded items and non-functional "Add to Cart" buttons.
