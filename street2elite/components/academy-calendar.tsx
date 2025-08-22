"use client"

import { useState, useEffect, useRef } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import listPlugin from "@fullcalendar/list"
import interactionPlugin from "@fullcalendar/interaction"
import type { EventClickArg, EventDropArg } from "@fullcalendar/core"
import { createClient } from "@/lib/client"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { SessionModal } from "./session-modal"

interface AcademyCalendarProps {
  user: unknown
  profile: unknown
  playersList: unknown[]
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
  extendedProps: {
    location: string
    coach_name: string
    skill_level: string
    max_participants: number
    price: number
    description?: string
    booked_count: number
    available_spots: number
  }
}

interface EventResizeInfo {
  event: {
    id: string
    end: Date | null
  }
  revert: () => void
}

export function AcademyCalendar({ isAdmin = false }: AcademyCalendarProps) {
  const [events, setEvents] = useState<SessionEvent[]>([])
  const [selectedSession, setSelectedSession] = useState<unknown>(null)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const calendarRef = useRef<FullCalendar>(null)
  const supabase = createClient()

  // Fetch sessions from Supabase
  const fetchSessions = async () => {
    try {
      console.log("Fetching sessions...")
      
      // Get all active sessions first
      const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select("*")
        .eq("is_active", true)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })

      if (sessionsError) {
        console.error("Error fetching sessions:", sessionsError)
        throw sessionsError
      }

      console.log("Sessions fetched:", sessions)

      if (!sessions || sessions.length === 0) {
        console.log("No sessions found")
        setEvents([])
        return
      }

      // Get booking counts for each session
      const sessionIds = sessions.map(s => s.id)
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("session_id")
        .in("session_id", sessionIds)
        .eq("status", "confirmed")

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError)
        // Continue without booking data rather than failing completely
      }

      console.log("Bookings fetched:", bookings)

      // Calculate availability and format for FullCalendar
      const formattedEvents: SessionEvent[] = sessions.map((session) => {
        const bookedCount = bookings?.filter(b => b.session_id === session.id).length || 0
        const availableSpots = session.max_participants - bookedCount
        
        console.log(`Session ${session.title}: ${bookedCount} booked, ${availableSpots} available`)
        
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

        // Create proper datetime strings
        const startDateTime = `${session.date}T${session.start_time}`
        const endDateTime = `${session.date}T${session.end_time}`

        console.log(`Session ${session.title}: ${startDateTime} to ${endDateTime}`)

        return {
          id: session.id,
          title: session.title,
          start: startDateTime,
          end: endDateTime,
          backgroundColor,
          borderColor,
          textColor: "#ffffff",
          extendedProps: {
            location: session.location,
            coach_name: session.coach_name,
            skill_level: session.skill_level,
            max_participants: session.max_participants,
            price: session.price,
            description: session.description,
            booked_count: bookedCount,
            available_spots: availableSpots,
          }
        }
      })

      console.log("Formatted events:", formattedEvents)
      setEvents(formattedEvents)
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast.error("Failed to load sessions")
    }
  }

  // Setup real-time subscription
  useEffect(() => {
    fetchSessions()

    // Subscribe to real-time changes
    const channel = supabase
      .channel("sessions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sessions",
        },
        (payload) => {
          console.log("Sessions table changed:", payload)
          fetchSessions() // Refetch when sessions change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Handle event click - admin can edit, parents see details
  const handleEventClick = (info: EventClickArg) => {
    console.log("Event clicked:", info)
    const event = info.event
    
    if (isAdmin) {
      // For admin: prepare session data for editing
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
      // For parents: show session details (to be implemented later)
      toast.info(`Session: ${event.title} at ${event.extendedProps.location}`)
    }
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
              : "Choose from our professional coaching sessions"
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
            </div>
          </div>
        </CardContent>
      </Card>

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
        
        .calendar-container .fc-event:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}
