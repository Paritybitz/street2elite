import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, User, DollarSign, Info } from "lucide-react"
import { format } from "date-fns"

interface SessionDetailsProps {
  session: any
  availableSpots: number
}

export function SessionDetails({ session, availableSpots }: SessionDetailsProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-white text-xl">{session.title}</CardTitle>
          <Badge variant="secondary" className="bg-amber-600/20 text-amber-400 border-amber-600/30">
            {session.skill_level === "all" ? "All Levels" : session.skill_level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-slate-300">{session.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-slate-300">
            <Calendar className="h-5 w-5 text-teal-400" />
            <div>
              <p className="font-medium">{format(new Date(session.date), "EEEE, MMM dd")}</p>
              <p className="text-sm text-slate-400">{format(new Date(session.date), "yyyy")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <Clock className="h-5 w-5 text-teal-400" />
            <div>
              <p className="font-medium">
                {session.start_time} - {session.end_time}
              </p>
              <p className="text-sm text-slate-400">90 minutes</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <MapPin className="h-5 w-5 text-teal-400" />
            <div>
              <p className="font-medium">{session.location}</p>
              <p className="text-sm text-slate-400">Professional facility</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <User className="h-5 w-5 text-teal-400" />
            <div>
              <p className="font-medium">{session.coach_name}</p>
              <p className="text-sm text-slate-400">Certified coach</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-600 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-400" />
              <span className="text-slate-300">Availability</span>
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
              {availableSpots} spots remaining
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <span className="text-slate-300">Session Price</span>
            </div>
            <span className="text-2xl font-bold text-white">${session.price}</span>
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white mb-2">What to Bring</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Soccer cleats and shin guards</li>
                <li>• Water bottle and towel</li>
                <li>• Comfortable athletic wear</li>
                <li>• Positive attitude and willingness to learn!</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
