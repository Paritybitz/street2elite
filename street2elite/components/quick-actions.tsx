import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, BookOpen, BarChart3, QrCode, Settings } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild className="w-full bg-teal-600 hover:bg-teal-700 justify-start">
          <Link href="/admin/sessions/create">
            <Calendar className="h-4 w-4 mr-2" />
            Create New Session
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 justify-start bg-transparent"
        >
          <Link href="/admin/bookings">
            <BookOpen className="h-4 w-4 mr-2" />
            Manage Bookings
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 justify-start bg-transparent"
        >
          <Link href="/admin/users">
            <Users className="h-4 w-4 mr-2" />
            View Users
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 justify-start bg-transparent"
        >
          <Link href="/admin/checkin">
            <QrCode className="h-4 w-4 mr-2" />
            QR Check-in
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 justify-start bg-transparent"
        >
          <Link href="/admin/analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 justify-start bg-transparent"
        >
          <Link href="/admin/settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
