import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardStats } from "@/components/dashboard-stats"
import { UpcomingBookings } from "@/components/upcoming-bookings"
import { ChildrenOverview } from "@/components/children-overview"
import { QuickActions } from "@/components/quick-actions"

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

  // Fetch children
  const { data: children } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true })

  // Fetch upcoming bookings with session details
  const { data: upcomingBookings } = await supabase
    .from("bookings")
    .select(`
      *,
      sessions(*),
      children(first_name, last_name)
    `)
    .eq("parent_id", user.id)
    .eq("status", "confirmed")
    .gte("sessions.date", new Date().toISOString().split("T")[0])
    .order("sessions.date", { ascending: true })
    .limit(5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <DashboardHeader user={user} profile={profile} />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {profile?.first_name || "Parent"}!</h1>
          <p className="text-slate-300">Manage your children's soccer training and upcoming sessions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <DashboardStats
              childrenCount={children?.length || 0}
              upcomingBookingsCount={upcomingBookings?.length || 0}
            />

            <UpcomingBookings bookings={upcomingBookings || []} />

            <ChildrenOverview children={children || []} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  )
}
