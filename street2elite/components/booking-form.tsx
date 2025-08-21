"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { User, CreditCard, Shield } from "lucide-react"

interface BookingFormProps {
  session: any
  children: any[]
}

export function BookingForm({ session, children }: BookingFormProps) {
  const [selectedChildId, setSelectedChildId] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const selectedChild = children.find((child) => child.id === selectedChildId)

  const handleBooking = async () => {
    if (!selectedChildId || !agreedToTerms) {
      setError("Please select a child and agree to the terms")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          session_id: session.id,
          child_id: selectedChildId,
          parent_id: user.id,
          status: "confirmed", // In real app, this would be "pending" until payment
          payment_status: "paid", // Mock payment success
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // Redirect to confirmation
      router.push(`/sessions/booking-confirmation/${booking.id}`)
    } catch (error: any) {
      setError(error.message || "Failed to create booking")
    } finally {
      setIsLoading(false)
    }
  }

  if (children.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="py-8">
          <div className="text-center">
            <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-300 mb-4">You need to add a child before booking sessions</p>
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <a href="/dashboard/children/add">Add Child</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Booking Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-200">Select Child</Label>
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue placeholder="Choose which child to book for" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.first_name} {child.last_name} ({child.skill_level})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedChild && (
          <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
            <h4 className="font-semibold text-white mb-2">Selected Player</h4>
            <p className="text-slate-300">
              {selectedChild.first_name} {selectedChild.last_name}
            </p>
            <p className="text-sm text-slate-400">Skill Level: {selectedChild.skill_level}</p>
            {selectedChild.medical_notes && (
              <p className="text-sm text-amber-400 mt-2">Medical Notes: {selectedChild.medical_notes}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="requests" className="text-slate-200">
            Special Requests (Optional)
          </Label>
          <Textarea
            id="requests"
            placeholder="Any special requirements or notes for the coach..."
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>

        <div className="border-t border-slate-600 pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-300">Session Price:</span>
            <span className="text-2xl font-bold text-white">${session.price}</span>
          </div>

          <div className="flex items-start space-x-2 mb-6">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={setAgreedToTerms}
              className="border-slate-600 data-[state=checked]:bg-teal-600"
            />
            <Label htmlFor="terms" className="text-sm text-slate-300 leading-relaxed">
              I agree to the{" "}
              <a href="/terms" className="text-teal-400 hover:text-teal-300 underline">
                terms and conditions
              </a>{" "}
              and understand the cancellation policy. I confirm that the selected child is medically fit to participate.
            </Label>
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <Button
            onClick={handleBooking}
            disabled={!selectedChildId || !agreedToTerms || isLoading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3"
          >
            {isLoading ? "Processing..." : `Book Session - $${session.price}`}
          </Button>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
            <Shield className="h-4 w-4" />
            <span>Secure payment processing</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
