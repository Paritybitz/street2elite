"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "sonner"
import { Loader2, Trash2, Users } from "lucide-react"
import { format, differenceInYears } from "date-fns"
import { cancelBooking, fetchSessionRoster, type RosterEntry } from "@/lib/bookings"

const sessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  location: z.string().min(1, "Location is required"),
  coach_name: z.string().min(1, "Coach name is required"),
  skill_level: z.enum(["beginner", "intermediate", "advanced", "all"]),
  max_participants: z.number().min(1, "Must allow at least 1 participant"),
  price: z.number().min(0, "Price cannot be negative"),
})

interface SessionModalProps {
  open: boolean
  onClose: () => void
  session?: any
  selectedDate?: Date | null
  onSuccess: () => void
}

export function SessionModal({ open, onClose, session, selectedDate, onSuccess }: SessionModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [participants, setParticipants] = useState<RosterEntry[]>([])
  const [participantToRemove, setParticipantToRemove] = useState<RosterEntry | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      start_time: "",
      end_time: "",
      location: "",
      coach_name: "",
      skill_level: "intermediate" as const,
      max_participants: 15,
      price: 25,
    },
  })

  // Fetch registered players (with parent contact details) for an existing session
  const fetchParticipants = async (sessionId: string) => {
    try {
      setParticipants(await fetchSessionRoster(supabase, sessionId))
    } catch (error: any) {
      console.error("Error fetching participants:", error)
      toast.error(`Failed to load participants: ${error.message || "Unknown error"}`)
      setParticipants([])
    }
  }

  // Keep the roster live while the modal is open: anyone registering or cancelling updates it
  useEffect(() => {
    const sessionId = session?.id
    if (!open || !sessionId) return

    const channel = supabase
      .channel(`session-roster-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `session_id=eq.${sessionId}` },
        () => fetchParticipants(sessionId)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, session?.id])

  const handleRemoveParticipant = async () => {
    if (!participantToRemove) return
    setIsRemoving(true)
    try {
      await cancelBooking(supabase, participantToRemove.id)
      toast.success("Registration removed")
      setParticipantToRemove(null)
      if (session?.id) await fetchParticipants(session.id)
    } catch (error: any) {
      toast.error(error.message || "Failed to remove registration")
    } finally {
      setIsRemoving(false)
    }
  }

  // Reset form when modal opens/closes or session changes
  useEffect(() => {
    if (open) {
      if (session) {
        // Editing existing session
        const sessionDate = session.start ? new Date(session.start).toISOString().split("T")[0] : ""
        const startTime = session.start ? new Date(session.start).toTimeString().slice(0, 5) : ""
        const endTime = session.end ? new Date(session.end).toTimeString().slice(0, 5) : ""

        reset({
          title: session.title || "",
          description: session.description || "",
          date: sessionDate,
          start_time: startTime,
          end_time: endTime,
          location: session.location || "",
          coach_name: session.coach_name || "",
          skill_level: session.skill_level || "intermediate",
          max_participants: session.max_participants || 15,
          price: session.price || 25,
        })

        // Fetch participants for existing session
        if (session.id) {
          fetchParticipants(session.id)
        }
      } else if (selectedDate) {
        // Creating new session
        const dateStr = format(selectedDate, "yyyy-MM-dd")
        reset({
          title: "",
          description: "",
          date: dateStr,
          start_time: "18:00",
          end_time: "19:30",
          location: "",
          coach_name: "",
          skill_level: "intermediate",
          max_participants: 15,
          price: 25,
        })
      }
    } else {
      setShowParticipants(false)
      setParticipants([])
      setShowDeleteConfirm(false)
    }
  }, [open, session, selectedDate, reset])

  const onSubmit = async (data: z.infer<typeof sessionSchema>) => {
    setIsLoading(true)
    
    try {
      console.log("Submitting session data:", data)
      
      const sessionData = {
        title: data.title,
        description: data.description || null,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        location: data.location,
        coach_name: data.coach_name,
        skill_level: data.skill_level,
        max_participants: data.max_participants,
        price: data.price,
        is_active: true,
      }

      let result
      if (session?.id) {
        // Update existing session
        console.log("Updating session with ID:", session.id)
        result = await supabase
          .from("sessions")
          .update(sessionData)
          .eq("id", session.id)
          .select()
      } else {
        // Create new session
        console.log("Creating new session")
        result = await supabase
          .from("sessions")
          .insert([sessionData])
          .select()
      }

      console.log("Supabase result:", result)

      if (result.error) {
        console.error("Supabase error:", result.error)
        throw result.error
      }

      toast.success(session?.id ? "Session updated successfully!" : "Session created successfully!")
      onSuccess()
    } catch (error: any) {
      console.error("Detailed error:", error)
      toast.error(`Error saving session: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!session?.id) return

    setIsDeleting(true)
    
    try {
      const { error } = await supabase
        .from("sessions")
        .update({ is_active: false })
        .eq("id", session.id)

      if (error) throw error

      toast.success("Session deleted successfully")
      setShowDeleteConfirm(false)
      onSuccess()
    } catch (error: any) {
      console.error("Error deleting session:", error)
      toast.error("Failed to delete session")
    } finally {
      setIsDeleting(false)
    }
  }

  if (showParticipants) {
    const capacity = session?.max_participants
    return (
      <>
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[640px] bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                Registered Players ({participants.length}
                {capacity ? ` / ${capacity}` : ""})
              </DialogTitle>
              {session?.title && <p className="text-sm text-slate-400">{session.title}</p>}
            </DialogHeader>

            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              {participants.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No players registered yet</p>
              ) : (
                participants.map((entry) => (
                  <div key={entry.id} className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-medium text-white">
                          {entry.child ? `${entry.child.first_name} ${entry.child.last_name}` : "Unknown Player"}
                        </h4>
                        <p className="text-sm text-slate-300">
                          {entry.child?.date_of_birth
                            ? `Age ${differenceInYears(new Date(), new Date(entry.child.date_of_birth))}`
                            : "Age unknown"}
                          {entry.child?.skill_level && <span className="capitalize"> · {entry.child.skill_level}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            entry.payment_status === "paid"
                              ? "border-green-500 text-green-400"
                              : "border-yellow-500 text-yellow-400"
                          }
                        >
                          {entry.payment_status === "paid" ? "Paid" : "Unpaid"}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setParticipantToRemove(entry)}
                          className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {entry.parent && (
                      <div className="mt-2 text-sm text-slate-400">
                        <p>
                          Parent: {entry.parent.first_name} {entry.parent.last_name}
                        </p>
                        {entry.parent.email && <p>Email: {entry.parent.email}</p>}
                        {entry.parent.phone && <p>Phone: {entry.parent.phone}</p>}
                      </div>
                    )}
                    {entry.created_at && (
                      <p className="mt-1 text-xs text-slate-500">
                        Registered {format(new Date(entry.created_at), "d MMM yyyy, h:mm a")}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setShowParticipants(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white"
              >
                Back to Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmationDialog
          open={!!participantToRemove}
          onOpenChange={(isOpen) => !isOpen && setParticipantToRemove(null)}
          title="Remove Registration"
          description={`Remove ${participantToRemove?.child?.first_name ?? "this player"} from this session? Their parent will see the change straight away.`}
          confirmText="Remove"
          cancelText="Keep"
          variant="destructive"
          onConfirm={handleRemoveParticipant}
          isLoading={isRemoving}
        />
      </>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {session ? "Edit Session" : "Create New Session"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Title
                </label>
                <Input
                  {...register("title")}
                  placeholder="e.g., Advanced Training Session"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  {...register("date")}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                {errors.date && (
                  <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>
                )}
              </div>

              {/* Skill Level */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Skill Level
                </label>
                <Select value={watch("skill_level")} onValueChange={(value) => setValue("skill_level", value as any)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="all">All Levels</SelectItem>
                  </SelectContent>
                </Select>
                {errors.skill_level && (
                  <p className="text-red-400 text-sm mt-1">{errors.skill_level.message}</p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Start Time
                </label>
                <Input
                  type="time"
                  {...register("start_time")}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                {errors.start_time && (
                  <p className="text-red-400 text-sm mt-1">{errors.start_time.message}</p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  End Time
                </label>
                <Input
                  type="time"
                  {...register("end_time")}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                {errors.end_time && (
                  <p className="text-red-400 text-sm mt-1">{errors.end_time.message}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Location
                </label>
                <Input
                  {...register("location")}
                  placeholder="e.g., Main Pitch"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                {errors.location && (
                  <p className="text-red-400 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>

              {/* Coach */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Coach
                </label>
                <Input
                  {...register("coach_name")}
                  placeholder="e.g., Coach Smith"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                {errors.coach_name && (
                  <p className="text-red-400 text-sm mt-1">{errors.coach_name.message}</p>
                )}
              </div>

              {/* Max Participants */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Max Participants
                </label>
                <Input
                  type="number"
                  {...register("max_participants", { valueAsNumber: true })}
                  min="1"
                  max="30"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                {errors.max_participants && (
                  <p className="text-red-400 text-sm mt-1">{errors.max_participants.message}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Price (£)
                </label>
                <Input
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                  min="0"
                  step="0.01"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                {errors.price && (
                  <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <Textarea
                  {...register("description")}
                  placeholder="Session description (optional)"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center">
              {/* View Participants - Left aligned with navbar-style styling */}
              <div className="flex-1">
                {session?.id && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowParticipants(true)}
                    className="flex items-center gap-2 text-white hover:bg-white hover:text-black transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    View Participants{participants.length > 0 ? ` (${participants.length})` : ""}
                  </Button>
                )}
              </div>
              
              {/* Right aligned buttons */}
              <div className="flex gap-2">
                {session?.id && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
                
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {session ? "Update Session" : "Create Session"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Training Session"
        description="Are you sure you want to delete this session? This action cannot be undone."
        confirmText="OK"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </>
  )
}
