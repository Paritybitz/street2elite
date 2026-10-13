"use client"

import { useState, useEffect, useRef } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import listPlugin from "@fullcalendar/list"
import interactionPlugin from "@fullcalendar/interaction"
import type { EventClickArg, EventContentArg, EventDropArg } from "@fullcalendar/core"
import { createClient } from "@/lib/client"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { SessionModal } from "./session-modal"
import { SessionBookingModal, type BookablePlayer, type BookableSession } from "./session-booking-modal"

interface AcademyCalendarProps {
  user: { id: string }
  profile: unknown
  /** The signed-in parent's players. Unused for admins. */
  players?: BookablePlayer[]
  isAdmin?: boolean
}

interface SessionEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  textColor: string
  classNames: string[]
  extendedProps: {
    location: string
    coach_name: string
    skill_level: string
    max_participants: number
    price: number
    description?: string
    booked_count: number
    available_spots: number
    /** The signed-in parent has at least one player registered for this session. */
    registered: boolean
  }
}

interface EventResizeInfo {
  event: {
    id: string
    end: Date | null
  }
  revert: () => void
}

export function AcademyCalendar({ user, players = [], isAdmin = false }: AcademyCalendarProps) {
  const [events, setEvents] = useState<SessionEvent[]>([])
  const [selectedSession, setSelectedSession] = useState<unknown>(null)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  // Parents: which session's booking modal is open. Derived from `events`, so it stays live.
  const [bookingSessionId, setBookingSessionId] = useState<string | null>(null)
  const calendarRef = useRef<FullCalendar>(null)
  const supabase = createClient()

  // Fetch sessions + registration counts from Supabase
  const fetchSessions = async () => {
    try {
      const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select("*")
        .eq("is_active", true)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })

      if (sessionsError) throw sessionsError

      if (!sessions || sessions.length === 0) {
        setEvents([])
        return
      }

      // Confirmed registrations for these sessions (all parents' — counts must be global)
      const sessionIds = sessions.map((s) => s.id)
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("session_id, parent_id")
        .in("session_id", sessionIds)
        .eq("status", "confirmed")

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError)
        // Continue without booking data rather than failing completely
      }

      const formattedEvents: SessionEvent[] = sessions.map((session) => {
        const sessionBookings = bookings?.filter((b) => b.session_id === session.id) ?? []
        const bookedCount = sessionBookings.length
        const availableSpots = session.max_participants - bookedCount
        const registered = !isAdmin && sessionBookings.some((b) => b.parent_id === user.id)

        // Color coding based on availability
        let backgroundColor = "#10b981" // Green - available
        let borderColor = "#059669"

        if (availableSpots <= 0) {
          backgroundColor = "#ef4444" // Red - full
          borderColor = "#dc2626"
        } else if (availableSpots <= 3) {
          backgroundColor = "#f59e0b" // Gold - low spots
          borderColor = "#d97706"
        }

        return {
          id: session.id,
          title: session.title,
          start: `${session.date}T${session.start_time}`,
          end: `${session.date}T${session.end_time}`,
          backgroundColor,
          borderColor,
          textColor: "#ffffff",
          classNames: registered ? ["fc-event-registered"] : [],
          extendedProps: {
            location: session.location,
            coach_name: session.coach_name,
            skill_level: session.skill_level,
            max_participants: session.max_participants,
            price: session.price,
            description: session.description,
            booked_count: bookedCount,
            available_spots: availableSpots,
            registered,
          },
        }
      })

      setEvents(formattedEvents)
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast.error("Failed to load sessions")
    }
  }

  // Load once, then keep in sync: any change to sessions OR bookings (by anyone) refetches.
  useEffect(() => {
    fetchSessions()

    const channel = supabase
      .channel("calendar-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions" }, () => fetchSessions())
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchSessions())
      .subscribe()

    // Safety net if the realtime socket dropped while the tab was in the background
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchSessions()
    }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      document.removeEventListener("visibilitychange", onVisible)
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle event click - admin edits the session (and sees who's registered), parents register players
  const handleEventClick = (info: EventClickArg) => {
    const event = info.event

    if (isAdmin) {
      const sessionData = {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        location: event.extendedProps.location,
        coach_name: event.extendedProps.coach_name,
        skill_level: event.extendedProps.skill_level,
        max_participants: event.extendedProps.max_participants,
        price: event.extendedProps.price,
        description: event.extendedProps.description,
      }

      setSelectedSession(sessionData)
      setSelectedDate(null) // Clear selected date since we're editing existing session
      setShowSessionModal(true)
    } else {
      setBookingSessionId(event.id)
    }
  }

  const bookingEvent = bookingSessionId ? events.find((e) => e.id === bookingSessionId) : undefined
  const bookingSession: BookableSession | null = bookingEvent
    ? {
        id: bookingEvent.id,
        title: bookingEvent.title,
        start: new Date(bookingEvent.start),
        end: new Date(bookingEvent.end),
        location: bookingEvent.extendedProps.location,
        coach_name: bookingEvent.extendedProps.coach_name,
        skill_level: bookingEvent.extendedProps.skill_level,
        price: bookingEvent.extendedProps.price,
        description: bookingEvent.extendedProps.description,
        max_participants: bookingEvent.extendedProps.max_participants,
        booked_count: bookingEvent.extendedProps.booked_count,
        available_spots: bookingEvent.extendedProps.available_spots,
      }
    : null

  // Event body: time, title (✓ when this parent is registered) and a registered/capacity count
  const renderEventContent = (arg: EventContentArg) => {
    const { booked_count, max_participants, registered } = arg.event.extendedProps
    return (
      <div className="flex items-center justify-between gap-1 w-full overflow-hidden">
        <span className="truncate">
          {registered && <span className="mr-1">✓</span>}
          {arg.timeText && <span className="opacity-80 mr-1">{arg.timeText}</span>}
          {arg.event.title}
        </span>
        <span className="shrink-0 opacity-90 text-[11px] font-semibold">
          {booked_count}/{max_participants}
        </span>
      </div>
    )
  }

  // Handle date click - admin can create new sessions
  const handleDateClick = (info: { date: Date }) => {
    console.log("Date clicked:", info)
    if (isAdmin) {
      setSelectedDate(info.date)
      setSelectedSession(null) // Clear selected session since we're creating new
      setShowSessionModal(true)
    }
  }

  // Handle event drop (admin only)
  const handleEventDrop = async (info: EventDropArg) => {
    if (!isAdmin || !info.event.start || !info.event.end) return

    try {
      const { error } = await supabase
        .from("sessions")
        .update({
          date: info.event.start.toISOString().split("T")[0],
          start_time: info.event.start.toTimeString().split(" ")[0].slice(0, 5),
          end_time: info.event.end.toTimeString().split(" ")[0].slice(0, 5),
        })
        .eq("id", info.event.id)

      if (error) throw error
      toast.success("Session moved successfully")
    } catch (error) {
      console.error("Error moving session:", error)
      toast.error("Failed to move session")
      info.revert() // Revert the change
    }
  }

  // Handle event resize (admin only) - Fixed with correct interface
  const handleEventResize = async (info: EventResizeInfo) => {
    if (!isAdmin || !info.event.end) return

    try {
      const { error } = await supabase
        .from("sessions")
        .update({
          end_time: info.event.end.toTimeString().split(" ")[0].slice(0, 5),
        })
        .eq("id", info.event.id)

      if (error) throw error
      toast.success("Session duration updated")
    } catch (error) {
      console.error("Error resizing session:", error)
      toast.error("Failed to update session duration")
      info.revert()
    }
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isAdmin ? "Manage Training Sessions" : "Book Training Sessions"}
          </h1>
          <p className="text-slate-300">
            {isAdmin 
              ? "Create, edit, and manage academy sessions. Click sessions to edit or dates to create new ones." 
              : "Click a session to register your players. Sessions you're registered for are marked ✓."
            }
          </p>
        </div>
      </div>

      {/* Calendar */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="calendar-container">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: ""
              }}
              events={events}
              eventContent={renderEventContent}
              eventClick={handleEventClick}
              dateClick={isAdmin ? handleDateClick : undefined}
              editable={isAdmin}
              droppable={isAdmin}
              eventDrop={isAdmin ? handleEventDrop : undefined}
              eventResize={isAdmin ? handleEventResize : undefined}
              height="auto"
              aspectRatio={1.35}
              eventDisplay="block"
              dayMaxEvents={3}
              moreLinkClick="popover"
              noEventsContent="No sessions found matching your criteria."
            />
          </div>
          
          {/* Legend moved inside calendar box at bottom */}
          <div className="mt-4 pt-4 border-t border-slate-600">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-slate-300">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                <span className="text-slate-300">Few Spots Left</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-slate-300">Full</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-300 text-xs">Numbers show registered / capacity</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Modal (Parents only) */}
      {!isAdmin && (
        <SessionBookingModal
          open={!!bookingSessionId && !!bookingSession}
          onClose={() => setBookingSessionId(null)}
          session={bookingSession}
          players={players}
          userId={user.id}
          onChanged={fetchSessions}
        />
      )}

      {/* Session Modal (Admin only) */}
      {isAdmin && (
        <SessionModal
          open={showSessionModal}
          onClose={() => {
            setShowSessionModal(false)
            setSelectedSession(null)
            setSelectedDate(null)
          }}
          session={selectedSession}
          selectedDate={selectedDate}
          onSuccess={() => {
            fetchSessions()
            setShowSessionModal(false)
            setSelectedSession(null)
            setSelectedDate(null)
          }}
        />
      )}

      <style jsx global>{`
        .calendar-container .fc {
          background: transparent;
        }
        
        .calendar-container .fc-theme-standard td,
        .calendar-container .fc-theme-standard th {
          border-color: #475569;
        }
        
        .calendar-container .fc-col-header-cell {
          background: #334155;
          color: #e2e8f0;
          font-weight: 600;
        }
        
        .calendar-container .fc-daygrid-day {
          background: #1e293b;
        }
        
        .calendar-container .fc-daygrid-day:hover {
          background: #334155;
        }
        
        .calendar-container .fc-day-today {
          background: #0f172a !important;
        }
        
        .calendar-container .fc-button {
          background: #0f766e;
          border-color: #0f766e;
          color: white;
        }
        
        .calendar-container .fc-button:hover {
          background: #0d9488;
          border-color: #0d9488;
        }
        
        .calendar-container .fc-toolbar-title {
          color: #e2e8f0;
          font-weight: 700;
        }
        
        .calendar-container .fc-daygrid-day-number {
          color: #cbd5e1;
        }
        
        .calendar-container .fc-event {
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          padding: 2px 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .calendar-container .fc-event-registered {
          box-shadow: 0 0 0 2px #ffffff inset;
        }

        .calendar-container .fc-event:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}
