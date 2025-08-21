import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { AdminHeader } from "@/components/admin-header"
import { AdminStats } from "@/components/admin-stats"
import { RecentBookings } from "@/components/recent-bookings"
import { UpcomingSessions } from "@/components/upcoming-sessions"
import { QuickActions } from "@/components/quick-actions"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || !["admin", "coach"].includes(profile.role)) {
    redirect("/dashboard")
  }

  // Fetch dashboard data
  const [
    { data: totalSessions },
    { data: totalBookings },
    { data: totalChildren },
    { data: totalParents },
    { data: recentBookings },
    { data: upcomingSessions },
  ] = await Promise.all([
    supabase.from("sessions").select("id", { count: "exact" }),
    supabase.from("bookings").select("id", { count: "exact" }).eq("status", "confirmed"),
    supabase.from("children").select("id", { count: "exact" }),
    supabase.from("profiles").select("id", { count: "exact" }).eq("role", "parent"),
    supabase
      .from("bookings")
      .select(`
        *,
        sessions(title, date, start_time),
        children(first_name, last_name),
        profiles(first_name, last_name)
      `)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("sessions")
      .select(`
        *,
        bookings!inner(id)
      `)
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(5),
  ])

  const stats = {
    totalSessions: totalSessions?.length || 0,
    totalBookings: totalBookings?.length || 0,
    totalChildren: totalChildren?.length || 0,
    totalParents: totalParents?.length || 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <AdminHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-300">Manage sessions, bookings, and academy operations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <AdminStats stats={stats} />
            <RecentBookings bookings={recentBookings || []} />
            <UpcomingSessions sessions={upcomingSessions || []} />
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
