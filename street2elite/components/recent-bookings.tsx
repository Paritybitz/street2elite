import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Eye } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface RecentBookingsProps {
  bookings: any[]
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  if (bookings.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-center py-8">No recent bookings found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Recent Bookings</CardTitle>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
        >
          <Link href="/admin/bookings">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-white">{booking.sessions.title}</h4>
                  <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
                    {booking.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-300">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(booking.sessions.date), "MMM dd, yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {booking.sessions.start_time}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {booking.children.first_name} {booking.children.last_name}
                  </div>
                </div>

                <p className="text-sm text-slate-400 mt-1">
                  Parent: {booking.profiles.first_name} {booking.profiles.last_name}
                </p>
              </div>

              <div className="flex items-center gap-2">
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
                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
