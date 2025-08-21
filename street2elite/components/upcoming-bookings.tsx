import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User } from "lucide-react"
import { format } from "date-fns"

interface UpcomingBookingsProps {
  bookings: any[]
}

export function UpcomingBookings({ bookings }: UpcomingBookingsProps) {
  if (bookings.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-center py-8">
            No upcoming sessions booked. Ready to get back on the field?
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Upcoming Sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-white">{booking.sessions.title}</h4>
                <Badge variant="secondary" className="bg-teal-600/20 text-teal-400 border-teal-600/30">
                  {booking.sessions.skill_level}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-300">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(booking.sessions.date), "MMM dd, yyyy")}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {booking.sessions.start_time} - {booking.sessions.end_time}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {booking.sessions.location}
                </div>
              </div>

              <div className="flex items-center gap-1 mt-2 text-sm text-slate-400">
                <User className="h-4 w-4" />
                Player: {booking.children.first_name} {booking.children.last_name}
              </div>
            </div>

            <div className="text-right">
              <Badge
                variant={booking.payment_status === "paid" ? "default" : "destructive"}
                className={
                  booking.payment_status === "paid"
                    ? "bg-green-600/20 text-green-400 border-green-600/30"
                    : "bg-red-600/20 text-red-400 border-red-600/30"
                }
              >
                {booking.payment_status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
