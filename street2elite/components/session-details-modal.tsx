"use client"

import { useState } from "react"
import { createClient } from "@/lib/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Clock, 
  MapPin, 
  Users, 
  DollarSign,
  User,
  Calendar,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import Link from "next/link"

interface SessionDetailsModalProps {
  open: boolean
  onClose: () => void
  session: any
  children: any[]
  user: any
}

export function SessionDetailsModal({ open, onClose, session, children, user }: SessionDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  if (!session) return null

  // Check if user has eligible children (approved with valid medical forms)
  const eligibleChildren = children.filter(child => 
    child.approval_status === 'approved'
  )

  const handleBookSession = async () => {
    if (eligibleChildren.length === 0) {
      toast.error("You need at least one approved player to book sessions")
      return
    }

    if (session.available_spots <= 0) {
      toast.error("This session is fully booked")
      return
    }

    // For MVP, redirect to booking page
    // In full implementation, this would open a booking flow
    window.location.href = `/sessions/${session.id}/book`
  }

  const getAvailabilityStatus = () => {
    if (session.available_spots <= 0) {
      return { color: "destructive", text: "Full", icon: AlertCircle }
    }
    if (session.available_spots <= 3) {
      return { color: "warning", text: `${session.available_spots} spots left`, icon: AlertCircle }
    }
    return { color: "success", text: "Available", icon: CheckCircle }
  }

  const availabilityStatus = getAvailabilityStatus()
  const StatusIcon = availabilityStatus.icon

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {session.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Info */}
          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="h-4 w-4" />
                <span>{format(session.start, "EEEE, MMMM d, yyyy")}</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="h-4 w-4" />
                <span>{format(session.start, "h:mm a")} - {format(session.end, "h:mm a")}</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="h-4 w-4" />
                <span>{session.location}</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-300">
                <User className="h-4 w-4" />
                <span>Coach: {session.coach_name}</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="h-4 w-4" />
                <span>{session.booked_count} / {session.max_participants} players</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-300">
                <DollarSign className="h-4 w-4" />
                <span>£{session.price.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Availability Status */}
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Availability:</span>
            <Badge 
              variant={availabilityStatus.color as any}
              className="flex items-center gap-1"
            >
              <StatusIcon className="h-3 w-3" />
              {availabilityStatus.text}
            </Badge>
          </div>

          {/* Skill Level */}
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Skill Level:</span>
            <Badge variant="outline" className="capitalize">
              {session.skill_level === 'all' ? 'All Levels' : session.skill_level}
            </Badge>
          </div>

          {/* Description */}
          {session.description && (
            <div>
              <h4 className="text-sm font-medium text-slate-200 mb-2">Description</h4>
              <p className="text-slate-300 text-sm">{session.description}</p>
            </div>
          )}

          {/* Player Status */}
          <div>
            <h4 className="text-sm font-medium text-slate-200 mb-2">Your Players</h4>
            {children.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-slate-400 mb-2">No players registered</p>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Register a Player
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                    <span className="text-slate-300">
                      {child.first_name} {child.last_name}
                    </span>
                    <Badge 
                      variant={child.approval_status === 'approved' ? 'success' : 'warning'}
                      className="text-xs"
                    >
                      {child.approval_status === 'approved' ? 'Eligible' : 'Pending Approval'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          
          {eligibleChildren.length > 0 && session.available_spots > 0 ? (
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={handleBookSession}
              disabled={isLoading}
            >
              Book Session
            </Button>
          ) : (
            <Button
              disabled
              className="bg-slate-600"
            >
              {eligibleChildren.length === 0 
                ? "No Eligible Players" 
                : "Session Full"
              }
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}