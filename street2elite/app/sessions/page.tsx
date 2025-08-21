import { createClient } from "@/lib/server"
import { SessionsHeader } from "@/components/sessions-header"
import { SessionsFilters } from "@/components/sessions-filters"
import { SessionsList } from "@/components/sessions-list"
import { redirect } from "next/navigation"

interface SearchParams {
  skill_level?: string
  date?: string
  location?: string
  search?: string
}

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user's children for booking
  const { data: children } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .order("first_name", { ascending: true })

  // Build query for sessions
  let query = supabase
    .from("sessions")
    .select("*")
    .eq("is_active", true)
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })

  // Apply filters
  if (params.skill_level && params.skill_level !== "all") {
    query = query.or(`skill_level.eq.${params.skill_level},skill_level.eq.all`)
  }

  if (params.date) {
    query = query.eq("date", params.date)
  }

  if (params.location) {
    query = query.ilike("location", `%${params.location}%`)
  }

  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,description.ilike.%${params.search}%,coach_name.ilike.%${params.search}%`,
    )
  }

  const { data: sessions } = await query

  // Get booking counts for each session
  const sessionIds = sessions?.map((s) => s.id) || []
  const { data: bookingCounts } = await supabase
    .from("bookings")
    .select("session_id")
    .in("session_id", sessionIds)
    .eq("status", "confirmed")

  // Calculate available spots
  const sessionsWithAvailability = sessions?.map((session) => {
    const bookedCount = bookingCounts?.filter((b) => b.session_id === session.id).length || 0
    return {
      ...session,
      booked_count: bookedCount,
      available_spots: session.max_participants - bookedCount,
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <SessionsHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Book Training Sessions</h1>
          <p className="text-slate-300">Choose from our professional coaching sessions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SessionsFilters />
          </div>

          {/* Sessions List */}
          <div className="lg:col-span-3">
            <SessionsList sessions={sessionsWithAvailability || []} children={children || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
