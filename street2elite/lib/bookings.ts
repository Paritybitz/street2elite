import { format } from "date-fns"

// Works with both the browser client (lib/client.ts) and the server client (lib/server.ts).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = { from: (table: string) => any }

export interface RosterEntry {
  id: string
  status: string
  payment_status: string | null
  created_at: string | null
  child: {
    id: string
    first_name: string
    last_name: string
    date_of_birth: string | null
    skill_level: string | null
  } | null
  parent: {
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
  } | null
}

/**
 * Confirmed registrations for one session, with child and parent details.
 * Joined manually (bookings -> children / profiles) instead of through PostgREST embeds,
 * to avoid the FK-join problems noted in CLAUDE.md.
 */
export async function fetchSessionRoster(db: Db, sessionId: string): Promise<RosterEntry[]> {
  const { data: bookings, error } = await db
    .from("bookings")
    .select("id, status, payment_status, created_at, child_id, parent_id")
    .eq("session_id", sessionId)
    .eq("status", "confirmed")
    .order("created_at", { ascending: true })

  if (error) throw error
  if (!bookings || bookings.length === 0) return []

  const childIds = [...new Set<string>(bookings.map((b: { child_id: string }) => b.child_id))]
  const parentIds = [...new Set<string>(bookings.map((b: { parent_id: string }) => b.parent_id))]

  const [childrenRes, profilesRes] = await Promise.all([
    db.from("children").select("id, first_name, last_name, date_of_birth, skill_level").in("id", childIds),
    db.from("profiles").select("id, first_name, last_name, email, phone").in("id", parentIds),
  ])

  if (childrenRes.error) throw childrenRes.error
  // A profiles error is non-fatal: the roster still shows the children.
  const children = childrenRes.data ?? []
  const profiles = profilesRes.data ?? []

  return bookings.map((b: { id: string; status: string; payment_status: string | null; created_at: string | null; child_id: string; parent_id: string }) => ({
    id: b.id,
    status: b.status,
    payment_status: b.payment_status,
    created_at: b.created_at,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    child: children.find((c: any) => c.id === b.child_id) ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parent: profiles.find((p: any) => p.id === b.parent_id) ?? null,
  }))
}

export interface UpcomingBooking {
  id: string
  status: string
  payment_status: string | null
  session_id: string
  child_id: string
  sessions: {
    id: string
    title: string
    date: string
    start_time: string
    end_time: string
    location: string
    coach_name: string
    price: number
  }
  children: { first_name: string; last_name: string } | null
}

/** A parent's confirmed bookings for active sessions that haven't happened yet, soonest first. */
export async function fetchUpcomingBookings(db: Db, parentId: string): Promise<UpcomingBooking[]> {
  const today = format(new Date(), "yyyy-MM-dd")

  const { data, error } = await db
    .from("bookings")
    .select(
      "id, status, payment_status, session_id, child_id, sessions!inner(id, title, date, start_time, end_time, location, coach_name, price, is_active), children(first_name, last_name)"
    )
    .eq("parent_id", parentId)
    .eq("status", "confirmed")
    .eq("sessions.is_active", true)
    .gte("sessions.date", today)

  if (error) throw error

  return ((data ?? []) as UpcomingBooking[]).sort((a, b) =>
    `${a.sessions.date}T${a.sessions.start_time}`.localeCompare(`${b.sessions.date}T${b.sessions.start_time}`)
  )
}

/** Turns database / RLS / trigger errors into messages a parent can act on. */
export function friendlyBookingError(error: { code?: string; message?: string } | null | undefined): string {
  const message = error?.message ?? ""
  if (message.includes("session_full")) return "Sorry, this session just filled up."
  if (message.includes("session_unavailable")) return "This session is no longer available."
  if (message.includes("child_not_eligible")) return "Only approved players can be registered for sessions."
  if (error?.code === "23505") return "This player is already registered for this session."
  if (error?.code === "42501") return "You don't have permission to do that. Please contact the academy."
  return message || "Something went wrong. Please try again."
}

/**
 * Register a child for a session. Re-activates a previously cancelled registration.
 * Payments aren't wired up yet: paid sessions start as 'pending'; free sessions have nothing to pay.
 */
export async function registerChild(
  db: Db,
  { sessionId, childId, parentId, free = false }: { sessionId: string; childId: string; parentId: string; free?: boolean }
): Promise<void> {
  const paymentStatus = free ? "paid" : "pending"

  // Friendly pre-check; the database trigger is the real guard against races.
  const [{ data: session }, { count }] = await Promise.all([
    db.from("sessions").select("max_participants").eq("id", sessionId).single(),
    db.from("bookings").select("id", { count: "exact", head: true }).eq("session_id", sessionId).eq("status", "confirmed"),
  ])
  if (session && typeof count === "number" && count >= session.max_participants) {
    throw new Error("Sorry, this session just filled up.")
  }

  const { error } = await db.from("bookings").insert({
    session_id: sessionId,
    child_id: childId,
    parent_id: parentId,
    status: "confirmed",
    payment_status: paymentStatus,
  })

  if (!error) return

  if (error.code === "23505") {
    // (session_id, child_id) is unique, so a cancelled booking blocks a fresh insert: revive it.
    const { data: revived, error: reviveError } = await db
      .from("bookings")
      .update({ status: "confirmed", payment_status: paymentStatus })
      .eq("session_id", sessionId)
      .eq("child_id", childId)
      .eq("parent_id", parentId)
      .eq("status", "cancelled")
      .select("id")

    if (reviveError) throw new Error(friendlyBookingError(reviveError))
    if (!revived || revived.length === 0) throw new Error(friendlyBookingError(error))
    return
  }

  throw new Error(friendlyBookingError(error))
}

/** Soft-cancel (keeps history; the app only counts status = 'confirmed'). */
export async function cancelBooking(db: Db, bookingId: string): Promise<void> {
  const { data, error } = await db.from("bookings").update({ status: "cancelled" }).eq("id", bookingId).select("id")
  if (error) throw new Error(friendlyBookingError(error))
  // RLS can silently filter an update to zero rows.
  if (!data || data.length === 0) throw new Error("Couldn't cancel this booking. Please try again.")
}
