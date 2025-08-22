import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { AcademyCalendar } from "@/components/academy-calendar"
import { SessionsHeader } from "@/components/sessions-header"

export default async function CalendarPage() {
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

  // Fetch user's children for booking (parents only)
  const { data: children } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .order("first_name", { ascending: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      <SessionsHeader user={user} profile={profile} />

      <main className="container mx-auto px-6 py-8">
        <AcademyCalendar 
          user={user} 
          profile={profile} 
          children={children || []} 
          isAdmin={isAdmin}
        />
      </main>
    </div>
  )
}
