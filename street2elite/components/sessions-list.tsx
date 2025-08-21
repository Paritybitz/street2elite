import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, User, DollarSign } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface SessionsListProps {
  sessions: any[]
  children: any[]
}

export function SessionsList({ sessions, children }: SessionsListProps) {
  if (sessions.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-slate-400 text-lg mb-4">No sessions found matching your criteria</p>
            <p className="text-slate-500">Try adjusting your filters or check back later for new sessions</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {sessions.map((session) => (
        <Card key={session.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-white text-xl mb-2">{session.title}</CardTitle>
                <p className="text-slate-300 text-sm">{session.description}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-amber-600/20 text-amber-400 border-amber-600/30">
                  {session.skill_level === "all" ? "All Levels" : session.skill_level}
                </Badge>
                <Badge
                  variant={session.available_spots > 0 ? "default" : "destructive"}
                  className={
                    session.available_spots > 0
                      ? "bg-green-600/20 text-green-400 border-green-600/30"
                      : "bg-red-600/20 text-red-400 border-red-600/30"
                  }
                >
                  {session.available_spots > 0 ? `${session.available_spots} spots left` : "Full"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="h-4 w-4 text-teal-400" />
                <span className="text-sm">{format(new Date(session.date), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="h-4 w-4 text-teal-400" />
                <span className="text-sm">
                  {session.start_time} - {session.end_time}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="h-4 w-4 text-teal-400" />
                <span className="text-sm">{session.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <User className="h-4 w-4 text-teal-400" />
                <span className="text-sm">{session.coach_name}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="h-4 w-4 text-amber-400" />
                  <span className="text-sm">
                    {session.booked_count}/{session.max_participants} participants
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-lg font-semibold text-white">${session.price}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                >
                  <Link href={`/sessions/${session.id}`}>View Details</Link>
                </Button>
                {session.available_spots > 0 && children.length > 0 ? (
                  <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700">
                    <Link href={`/sessions/${session.id}/book`}>Book Now</Link>
                  </Button>
                ) : session.available_spots === 0 ? (
                  <Button size="sm" disabled>
                    Session Full
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-amber-600 text-amber-400 hover:bg-amber-600/10 bg-transparent"
                  >
                    <Link href="/dashboard/children/add">Add Child First</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
