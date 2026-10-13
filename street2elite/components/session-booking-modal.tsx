"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { format, differenceInYears } from "date-fns"
import { toast } from "sonner"
import { AlertCircle, CalendarDays, Check, Clock, Loader2, MapPin, PoundSterling, User, Users } from "lucide-react"
import { createClient } from "@/lib/client"
import { cancelBooking, registerChild } from "@/lib/bookings"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export interface BookableSession {
  id: string
  title: string
  start: Date
  end: Date
  location: string
  coach_name: string
  skill_level: string
  price: number
  description?: string
  max_participants: number
  booked_count: number
  available_spots: number
}

export interface BookablePlayer {
  id: string
  first_name: string
  last_name: string
  date_of_birth?: string | null
  approval_status?: string | null
}

interface SessionBookingModalProps {
  open: boolean
  onClose: () => void
  session: BookableSession | null
  players: BookablePlayer[]
  userId: string
  onChanged: () => void
}

export function SessionBookingModal({ open, onClose, session, players, userId, onChanged }: SessionBookingModalProps) {
  const supabase = createClient()
  // child_id -> booking id, for this parent's confirmed registrations in this session
  const [myBookings, setMyBookings] = useState<Record<string, string>>({})
  const [busyChildId, setBusyChildId] = useState<string | null>(null)

  const sessionId = session?.id
  const bookedCount = session?.booked_count

  const loadMyBookings = useCallback(async () => {
    if (!sessionId) return
    const { data, error } = await supabase
      .from("bookings")
      .select("id, child_id")
      .eq("session_id", sessionId)
      .eq("parent_id", userId)
      .eq("status", "confirmed")

    if (error) {
      toast.error("Couldn't load your registrations")
      return
    }
    setMyBookings(Object.fromEntries((data ?? []).map((b) => [b.child_id, b.id])))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, userId])

  // Reload whenever the modal opens, or when the session's headcount changes
  // (the calendar refetches on any booking change, which updates booked_count).
  useEffect(() => {
    if (open) loadMyBookings()
    else setMyBookings({})
  }, [open, loadMyBookings, bookedCount])

  if (!session) return null

  const hasStarted = session.start.getTime() <= Date.now()
  const iAmRegistered = Object.keys(myBookings).length > 0
  const isFull = session.available_spots <= 0
  const isFree = Number(session.price) === 0

  const handleRegister = async (player: BookablePlayer) => {
    setBusyChildId(player.id)
    try {
      await registerChild(supabase, { sessionId: session.id, childId: player.id, parentId: userId, free: isFree })
      toast.success(`${player.first_name} is registered for ${session.title}`)
      await loadMyBookings()
      onChanged()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't register this player")
      // Capacity or approval may have changed under us; resync.
      onChanged()
    } finally {
      setBusyChildId(null)
    }
  }

  const handleCancel = async (player: BookablePlayer) => {
    const bookingId = myBookings[player.id]
    if (!bookingId) return
    setBusyChildId(player.id)
    try {
      await cancelBooking(supabase, bookingId)
      toast.success(`${player.first_name}'s registration was cancelled`)
      await loadMyBookings()
      onChanged()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't cancel this registration")
    } finally {
      setBusyChildId(null)
    }
  }

  const availability = isFull
    ? { label: "Full", className: "bg-red-600 text-white" }
    : session.available_spots <= 3
      ? { label: `${session.available_spots} spot${session.available_spots === 1 ? "" : "s"} left`, className: "bg-amber-500 text-white" }
      : { label: `${session.available_spots} spots available`, className: "bg-green-600 text-white" }

  const renderAction = (player: BookablePlayer) => {
    const isBusy = busyChildId === player.id
    const registered = !!myBookings[player.id]

    if (registered) {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-green-600 text-white">
            <Check className="h-3 w-3" />
            Registered
          </Badge>
          {!hasStarted && (
            <Button
              size="sm"
              variant="ghost"
              disabled={isBusy}
              onClick={() => handleCancel(player)}
              className="text-red-400 hover:text-red-300 hover:bg-slate-700"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel"}
            </Button>
          )}
        </div>
      )
    }

    if (player.approval_status === "rejected") {
      return <Badge className="bg-red-600/80 text-white">Not approved</Badge>
    }
    if (player.approval_status !== "approved") {
      return <Badge className="bg-yellow-600 text-white">Awaiting approval</Badge>
    }
    if (hasStarted) {
      return <span className="text-sm text-slate-400">Session started</span>
    }
    if (isFull) {
      return <span className="text-sm text-slate-400">Session full</span>
    }
    return (
      <Button
        size="sm"
        disabled={isBusy}
        onClick={() => handleRegister(player)}
        className="bg-teal-600 hover:bg-teal-700 text-white"
      >
        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register"}
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[520px] bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{session.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2 text-slate-300 text-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {format(session.start, "EEEE, d MMMM yyyy")}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              {format(session.start, "h:mm a")} – {format(session.end, "h:mm a")}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              {session.location}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              Coach {session.coach_name}
            </div>
            <div className="flex items-center gap-2">
              <PoundSterling className="h-4 w-4 text-slate-400" />
              {isFree ? "Free" : `£${Number(session.price).toFixed(2)} per player`}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              {session.booked_count} / {session.max_participants} registered
              <Badge className={availability.className}>{availability.label}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Level:</span>
              <Badge variant="outline" className="capitalize border-slate-500 text-slate-200">
                {session.skill_level === "all" ? "All levels" : session.skill_level}
              </Badge>
            </div>
          </div>

          {session.description && <p className="text-sm text-slate-300 leading-relaxed">{session.description}</p>}

          <div>
            <h4 className="text-sm font-medium text-slate-200 mb-2">Your players</h4>
            {players.length === 0 ? (
              <div className="text-center py-4 bg-slate-700/30 rounded-lg">
                <p className="text-slate-400 mb-3 text-sm">Register a player before booking a session.</p>
                <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700">
                  <Link href="/dashboard">Register a player</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between gap-3 p-3 bg-slate-700/40 rounded-lg border border-slate-600/60"
                  >
                    <div>
                      <p className="text-white font-medium">
                        {player.first_name} {player.last_name}
                      </p>
                      {player.date_of_birth && (
                        <p className="text-xs text-slate-400">
                          {differenceInYears(new Date(), new Date(player.date_of_birth))} years old
                        </p>
                      )}
                    </div>
                    {renderAction(player)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {isFull && !iAmRegistered && (
            <div className="flex items-start gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              This session is full. Check the calendar for other dates.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:bg-slate-700">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
