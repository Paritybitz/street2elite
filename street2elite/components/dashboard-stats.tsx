import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Trophy, Clock } from "lucide-react"

interface DashboardStatsProps {
  childrenCount: number
  upcomingBookingsCount: number
}

export function DashboardStats({ childrenCount, upcomingBookingsCount }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">My Children</CardTitle>
          <Users className="h-4 w-4 text-teal-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{childrenCount}</div>
          <p className="text-xs text-slate-400">Registered players</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Upcoming Sessions</CardTitle>
          <Calendar className="h-4 w-4 text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{upcomingBookingsCount}</div>
          <p className="text-xs text-slate-400">This month</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Skills Progress</CardTitle>
          <Trophy className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">85%</div>
          <p className="text-xs text-slate-400">Average improvement</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Training Hours</CardTitle>
          <Clock className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">24</div>
          <p className="text-xs text-slate-400">This month</p>
        </CardContent>
      </Card>
    </div>
  )
}
