import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, Plus } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface UpcomingSessionsProps {
  sessions: any[]
}

export function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Upcoming Sessions</CardTitle>
        <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700">
          <Link href="/admin/sessions/create">
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">No upcoming sessions scheduled</p>
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href="/admin/sessions/create">
                <Plus className="h-4 w-4 mr-2" />
                Create First Session
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const bookingCount = session.bookings?.length || 0
              const availableSpots = session.max_participants - bookingCount

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-white">{session.title}</h4>
                      <Badge variant="secondary" className="bg-amber-600/20 text-amber-400 border-amber-600/30">
                        {session.skill_level}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(session.date), "MMM dd, yyyy")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.start_time} - {session.end_time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {session.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">
                          {bookingCount}/{session.max_participants}
                        </span>
                      </div>
                      <Badge
                        variant={availableSpots > 5 ? "default" : availableSpots > 0 ? "secondary" : "destructive"}
                        className={
                          availableSpots > 5
                            ? "bg-green-600/20 text-green-400 border-green-600/30"
                            : availableSpots > 0
                              ? "bg-amber-600/20 text-amber-400 border-amber-600/30"
                              : "bg-red-600/20 text-red-400 border-red-600/30"
                        }
                      >
                        {availableSpots} spots left
                      </Badge>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                    >
                      <Link href={`/admin/sessions/${session.id}`}>Manage</Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
