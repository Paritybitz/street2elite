"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  MoreVertical, 
  Trash2, 
  Mail, 
  Edit3, 
  FileText, 
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Phone,
} from "lucide-react"
import Image from "next/image"
import { differenceInYears, format } from "date-fns"
import { createClient } from "@/lib/client"
import { toast } from "sonner"

interface Player {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  approval_status: string
  created_at: string
  photo_url?: string
  skill_level?: string
  medical_notes?: string
  parent_id: string
  profiles?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
  manager?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
}

interface PlayerDetailsModalProps {
  player: Player | null
  isOpen: boolean
  onClose: () => void
  onPlayerUpdated: () => void
  onApprove?: (playerId: string) => void
  onReject?: (playerId: string) => void
}

export function PlayerDetailsModal({ 
  player, 
  isOpen, 
  onClose, 
  onPlayerUpdated, 
  onApprove, 
  onReject 
}: PlayerDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editedPlayer, setEditedPlayer] = useState<Player | null>(null)
  const supabase = createClient()

  if (!player) return null

  // Initialize edited player when modal opens
  if (!editedPlayer && player) {
    setEditedPlayer({ ...player })
  }

  // Helper function to get the full image URL from Supabase storage
  const getImageUrl = (photoUrl: string | null | undefined) => {
    if (!photoUrl) return null
    
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/player-photos/${photoUrl}`
  }

  const handleSaveChanges = async () => {
    if (!editedPlayer) return

    try {
      setIsLoading(true)
      
      // Update player information
      const { error: playerError } = await supabase
        .from("children")
        .update({
          first_name: editedPlayer.first_name,
          last_name: editedPlayer.last_name,
          date_of_birth: editedPlayer.date_of_birth,
          skill_level: editedPlayer.skill_level,
          medical_notes: editedPlayer.medical_notes,
        })
        .eq("id", editedPlayer.id)

      if (playerError) throw playerError

      // Update manager information if profiles exist
      if (editedPlayer.profiles && player.parent_id) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            first_name: editedPlayer.profiles.first_name,
            last_name: editedPlayer.profiles.last_name,
            phone: editedPlayer.profiles.phone,
          })
          .eq("id", player.parent_id) // Use the actual parent_id

        if (profileError) {
          console.error("Profile update error:", profileError)
          // Don't throw here as player update succeeded
        }
      }

      toast.success("Player information updated successfully")
      setIsEditing(false)
      onPlayerUpdated()
      
    } catch (error) {
      console.error("Error updating player:", error)
      toast.error("Failed to update player information")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePlayer = async () => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from("children")
        .delete()
        .eq("id", player.id)

      if (error) throw error

      toast.success("Player removed successfully")
      setShowDeleteDialog(false)
      onClose()
      onPlayerUpdated()
      
    } catch (error) {
      console.error("Error deleting player:", error)
      toast.error("Failed to remove player")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMessageManager = () => {
    if (player.profiles?.email) {
      const subject = `Regarding ${player.first_name} ${player.last_name} - Street 2 Elite Academy`
      const body = `Dear ${player.profiles.first_name} ${player.profiles.last_name},\n\nI hope this message finds you well.\n\nBest regards,\nStreet 2 Elite Academy`
      const mailtoLink = `mailto:${player.profiles.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.open(mailtoLink)
    }
  }

  const handleApprove = () => {
    if (onApprove) {
      onApprove(player.id)
      onClose()
    }
  }

  const handleReject = () => {
    if (onReject) {
      onReject(player.id)
      onClose()
    }
  }

  const imageUrl = getImageUrl(player.photo_url)
  const playerAge = player.date_of_birth ? differenceInYears(new Date(), new Date(player.date_of_birth)) : 'N/A'
  const dateJoined = format(new Date(player.created_at), 'MMM dd, yyyy')
  const managerData = player.profiles || player.manager

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 text-white">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {isEditing ? 'Edit Player Information' : 'Player Details'}
            </DialogTitle>
            {/* Only show dropdown if not editing - this prevents duplicate X buttons */}
            {!isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-700 border-slate-600">
                  <DropdownMenuItem 
                    onClick={() => setIsEditing(true)}
                    className="text-slate-300 hover:bg-slate-600"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Player Info
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleMessageManager}
                    className="text-slate-300 hover:bg-slate-600"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Message Manager
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-400 hover:bg-slate-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Player
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </DialogHeader>

          <div className="space-y-6">
            {/* Player Photo and Basic Info */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 bg-slate-600 rounded-lg flex items-center justify-center overflow-hidden border-2 border-slate-500">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={`${player.first_name} ${player.last_name}`}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-slate-300" />
                )}
              </div>
            </div>

            {/* Player Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Player Name</Label>
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Input
                        value={editedPlayer?.first_name || ''}
                        onChange={(e) => setEditedPlayer(prev => prev ? {...prev, first_name: e.target.value} : null)}
                        placeholder="First name"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Input
                        value={editedPlayer?.last_name || ''}
                        onChange={(e) => setEditedPlayer(prev => prev ? {...prev, last_name: e.target.value} : null)}
                        placeholder="Last name"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  ) : (
                    <p className="text-white font-medium">{player.first_name} {player.last_name}</p>
                  )}
                </div>

                <div>
                  <Label className="text-slate-300">Date of Birth (Age: {playerAge})</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedPlayer?.date_of_birth || ''}
                      onChange={(e) => setEditedPlayer(prev => prev ? {...prev, date_of_birth: e.target.value} : null)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  ) : (
                    <p className="text-white">{format(new Date(player.date_of_birth), 'MMM dd, yyyy')}</p>
                  )}
                </div>

                <div>
                  <Label className="text-slate-300">Date Joined</Label>
                  <p className="text-white flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                    {dateJoined}
                  </p>
                </div>

                <div>
                  <Label className="text-slate-300">Skill Level</Label>
                  {isEditing ? (
                    <select
                      value={editedPlayer?.skill_level || 'beginner'}
                      onChange={(e) => setEditedPlayer(prev => prev ? {...prev, skill_level: e.target.value} : null)}
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  ) : (
                    <p className="text-white capitalize">{player.skill_level || 'Beginner'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Manager Name</Label>
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Input
                        value={editedPlayer?.profiles?.first_name || ''}
                        onChange={(e) => setEditedPlayer(prev => prev?.profiles ? {
                          ...prev, 
                          profiles: {...prev.profiles, first_name: e.target.value}
                        } : prev)}
                        placeholder="First name"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Input
                        value={editedPlayer?.profiles?.last_name || ''}
                        onChange={(e) => setEditedPlayer(prev => prev?.profiles ? {
                          ...prev, 
                          profiles: {...prev.profiles, last_name: e.target.value}
                        } : prev)}
                        placeholder="Last name"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  ) : (
                    <p className="text-white">
                      {managerData?.first_name && managerData?.last_name
                        ? `${managerData.first_name} ${managerData.last_name}`
                        : 'Manager information not available'
                      }
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-slate-300">Manager Email</Label>
                  <p className="text-white flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-slate-400" />
                    {managerData?.email || 'Email not available'}
                  </p>
                </div>

                <div>
                  <Label className="text-slate-300">Manager Phone</Label>
                  {isEditing ? (
                    <Input
                      value={editedPlayer?.profiles?.phone || ''}
                      onChange={(e) => setEditedPlayer(prev => prev?.profiles ? {
                        ...prev, 
                        profiles: {...prev.profiles, phone: e.target.value}
                      } : prev)}
                      placeholder="Phone number"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  ) : (
                    <p className="text-white flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-slate-400" />
                      {managerData?.phone || 'Phone not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-slate-300">Status</Label>
                  <p className="text-white">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      player.approval_status === 'approved' 
                        ? 'bg-green-600 text-white' 
                        : player.approval_status === 'pending'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}>
                      {player.approval_status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Medical Notes */}
            <div>
              <Label className="text-slate-300">Medical Notes</Label>
              {isEditing ? (
                <Textarea
                  value={editedPlayer?.medical_notes || ''}
                  onChange={(e) => setEditedPlayer(prev => prev ? {...prev, medical_notes: e.target.value} : null)}
                  placeholder="Any medical conditions or notes..."
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={3}
                />
              ) : (
                <p className="text-white bg-slate-700/50 p-3 rounded-md">
                  {player.medical_notes || 'No medical notes on file'}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-600">
              {!isEditing ? (
                <div className="flex space-x-3 w-full">
                  {/* Show approve/reject buttons for pending players */}
                  {player.approval_status === 'pending' && onApprove && onReject && (
                    <>
                      <Button 
                        onClick={handleApprove}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Player
                      </Button>
                      <Button 
                        onClick={handleReject}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Player
                      </Button>
                    </>
                  )}
                  
                  <div className="flex space-x-3 ml-auto">
                    <Button 
                      variant="outline" 
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Form
                    </Button>
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Manage Player
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3 w-full">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false)
                      setEditedPlayer({ ...player })
                    }}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remove Player</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Are you sure you want to remove {player.first_name} {player.last_name} from the academy? 
              This action cannot be undone and will permanently delete all player data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePlayer}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Removing...' : 'Remove Player'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
