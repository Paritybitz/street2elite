import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { AdminDashboard } from "@/components/admin-dashboard"
import { ParentDashboard } from "@/components/parent-dashboard"
import { fetchUpcomingBookings } from "@/lib/bookings"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user is admin
  const isAdmin = profile?.role === 'admin'

  if (isAdmin) {
    // Admin gets the powerful admin dashboard
    return <AdminDashboard user={user} profile={profile} />
  } else {
    // Parents get the simplified parent dashboard
    // Fetch players and bookings for parents
    const { data: players } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", user.id)
      .order("created_at", { ascending: true })

    const upcomingBookings = await fetchUpcomingBookings(supabase, user.id).catch(() => [])

    return (
      <ParentDashboard 
        user={user} 
        profile={profile} 
        players={players || []} 
        upcomingBookings={upcomingBookings} 
      />
    )
  }
}
