import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, User, Calendar } from "lucide-react"
import Link from "next/link"
import { differenceInYears } from "date-fns"

interface ChildrenOverviewProps {
  children: any[]
}

export function ChildrenOverview({ children }: ChildrenOverviewProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">My Children</CardTitle>
        <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700">
          <Link href="/dashboard/children/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Child
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {children.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">No children registered yet</p>
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href="/dashboard/children/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Child
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child) => {
              const age = differenceInYears(new Date(), new Date(child.date_of_birth))

              return (
                <div key={child.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white">
                        {child.first_name} {child.last_name}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                        <Calendar className="h-3 w-3" />
                        Age {age}
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-amber-600/20 text-amber-400 border-amber-600/30">
                      {child.skill_level}
                    </Badge>
                  </div>

                  {child.medical_notes && (
                    <p className="text-xs text-slate-400 mb-3">Medical notes: {child.medical_notes}</p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                    >
                      <Link href={`/dashboard/children/${child.id}`}>
                        <User className="h-3 w-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700">
                      <Link href={`/sessions?child=${child.id}`}>Book Session</Link>
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
