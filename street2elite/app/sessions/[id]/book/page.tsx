import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { BookingForm } from "@/components/booking-form"
import { SessionDetails } from "@/components/session-details"

export default async function BookSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch session details
  const { data: session } = await supabase.from("sessions").select("*").eq("id", id).single()

  if (!session) {
    redirect("/sessions")
  }

  // Fetch user's children
  const { data: children } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .order("first_name", { ascending: true })

  // Check current bookings for this session
  const { data: currentBookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("session_id", id)
    .eq("status", "confirmed")

  const availableSpots = session.max_participants - (currentBookings?.length || 0)

  if (availableSpots <= 0) {
    redirect(`/sessions/${id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Book Session</h1>
          <p className="text-slate-300">Complete your booking for this training session</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <SessionDetails session={session} availableSpots={availableSpots} />
          </div>
          <div>
            <BookingForm session={session} children={children || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
