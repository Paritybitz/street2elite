"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Calendar, MoreVertical, Edit, Trash2, User, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { differenceInYears } from "date-fns"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { AddPlayerModal } from "@/components/add-player-modal"
import { EditPlayerModal } from "@/components/edit-player-modal"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import Image from "next/image"

interface DashboardClientProps {
  user: any
  profile: any
  players: any[]
  upcomingBookings: any[]
}

export function DashboardClient({ user, profile, players: initialPlayers, upcomingBookings }: DashboardClientProps) {
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false)
  const [showEditPlayerModal, setShowEditPlayerModal] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [playerToDelete, setPlayerToDelete] = useState<any>(null)
  const [players, setPlayers] = useState(initialPlayers)
  const [isDeleting, setIsDeleting] = useState(false)
  const [playerPhotos, setPlayerPhotos] = useState<{ [key: string]: string }>({})
  const supabase = createClient()

  // Load player photos
  useEffect(() => {
    const loadPlayerPhotos = async () => {
      const photoUrls: { [key: string]: string } = {}
      
      for (const player of players) {
        if (player.photo_url) {
          try {
            const { data } = await supabase.storage
              .from('player-photos')
              .createSignedUrl(player.photo_url, 60 * 60)
            
            if (data?.signedUrl) {
              photoUrls[player.id] = data.signedUrl
            }
          } catch (error) {
            console.warn(`Failed to load photo for player ${player.id}:`, error)
          }
        }
      }
      
      setPlayerPhotos(photoUrls)
    }

    if (players.length > 0) {
      loadPlayerPhotos()
    }
  }, [players, supabase.storage])

  const handlePlayerAdded = () => {
    window.location.reload()
  }

  const handlePlayerUpdated = () => {
    window.location.reload()
  }

  const handleEditPlayer = (player: any) => {
    setSelectedPlayer(player)
    setShowEditPlayerModal(true)
  }

  const handleDeleteClick = (player: any) => {
    setPlayerToDelete(player)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!playerToDelete) return
    
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from("children")
        .delete()
        .eq("id", playerToDelete.id)
        .eq("parent_id", user.id)

      if (error) throw error

      setPlayers(players.filter(p => p.id !== playerToDelete.id))
      toast.success("Player deleted successfully")
      
    } catch (error: any) {
      console.error("Error deleting player:", error)
      toast.error("Failed to delete player. Please try again.")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setPlayerToDelete(null)
    }
  }

  // Get approval status display
  const getApprovalStatus = (player: any) => {
    switch (player.approval_status) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-400" />,
          text: "Approved",
          badge: "bg-green-600/20 text-green-400 border-green-600/30"
        }
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          text: "Rejected",
          badge: "bg-red-600/20 text-red-400 border-red-600/30"
        }
      default: // pending
        return {
          icon: <Clock className="w-5 h-5 text-amber-400" />,
          text: "Pending Approval",
          badge: "bg-amber-600/20 text-amber-400 border-amber-600/30"
        }
    }
  }

  // Separate players by approval status
  const approvedPlayers = players.filter(p => p.approval_status === 'approved')
  const pendingPlayers = players.filter(p => p.approval_status === 'pending')
  const rejectedPlayers = players.filter(p => p.approval_status === 'rejected')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Image
                src="/s2e-white.png"
                alt="Street 2 Elite"
                width={120}
                height={80}
                className="h-10 w-auto rounded-lg"
              />
            </Link>

            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                Bookings
              </Link>
              <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                Players
              </Link>
              <ProfileDropdown user={user} profile={profile} />
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {profile?.first_name || "Parent"}!
          </h1>
          <p className="text-slate-300">Manage your players and training sessions</p>
        </div>

        <div className="space-y-8">
          {/* Manage Players */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Manage Players</CardTitle>
                {pendingPlayers.length > 0 && (
                  <p className="text-sm text-amber-400 mt-1">
                    {pendingPlayers.length} player{pendingPlayers.length > 1 ? 's' : ''} awaiting admin approval
                  </p>
                )}
              </div>
              <Button 
                onClick={() => setShowAddPlayerModal(true)}
                className="bg-teal-600 hover:bg-teal-700"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Player
              </Button>
            </CardHeader>
            <CardContent>
              {players.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">No players registered yet</p>
                  <Button 
                    onClick={() => setShowAddPlayerModal(true)}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Register Your First Player
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Pending Players Section */}
                  {pendingPlayers.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-medium text-amber-400 uppercase tracking-wide">
                          Awaiting Approval
                        </h3>
                      </div>
                      {pendingPlayers.map((player) => {
                        const age = differenceInYears(new Date(), new Date(player.date_of_birth))
                        const status = getApprovalStatus(player)
                        
                        return (
                          <div 
                            key={player.id} 
                            className="group flex items-center justify-between p-4 bg-slate-700/20 rounded-lg border border-slate-600/50 opacity-60 hover:opacity-80 transition-all"
                          >
                            <div className="flex items-center space-x-4">
                              {/* Player Photo */}
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
                                {playerPhotos[player.id] ? (
                                  <img
                                    src={playerPhotos[player.id]}
                                    alt={`${player.first_name} ${player.last_name}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-600">
                                    <User className="w-6 h-6 text-slate-400" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Player Info */}
                              <div>
                                <h4 className="font-semibold text-white">
                                  {player.first_name} {player.last_name}
                                </h4>
                                <p className="text-sm text-slate-400">Age {age}</p>
                              </div>
                              
                              {/* Status Badge */}
                              <Badge className={status.badge}>
                                {status.icon}
                                <span className="ml-1">{status.text}</span>
                              </Badge>
                            </div>
                            
                            {/* Actions - can still edit pending players */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-600"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                  <DropdownMenuItem 
                                    onClick={() => handleEditPlayer(player)}
                                    className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClick(player)}
                                    className="text-red-400 hover:text-red-300 hover:bg-slate-700 cursor-pointer"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        )
                      })}
                      
                      {/* Pending approval message */}
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-400">Pending Admin Approval</h4>
                            <p className="text-sm text-amber-300/80 mt-1">
                              Your player registration{pendingPlayers.length > 1 ? 's are' : ' is'} being reviewed by Street2Elite. 
                              This may take 24-48 hours.
                              You can still make edits to pending registrations.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Approved Players Section */}
                  {approvedPlayers.length > 0 && (
                    <div className="space-y-4">
                      {pendingPlayers.length > 0 && (
                        <div className="flex items-center space-x-2 pt-6 border-t border-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <h3 className="text-sm font-medium text-green-400 uppercase tracking-wide">
                            Approved Players
                          </h3>
                        </div>
                      )}
                      {approvedPlayers.map((player) => {
                        const age = differenceInYears(new Date(), new Date(player.date_of_birth))
                        const status = getApprovalStatus(player)
                        
                        return (
                          <div 
                            key={player.id} 
                            className="group flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:bg-slate-700/50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              {/* Player Photo */}
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
                                {playerPhotos[player.id] ? (
                                  <img
                                    src={playerPhotos[player.id]}
                                    alt={`${player.first_name} ${player.last_name}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-600">
                                    <User className="w-6 h-6 text-slate-400" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Player Info */}
                              <div>
                                <h4 className="font-semibold text-white">
                                  {player.first_name} {player.last_name}
                                </h4>
                                <p className="text-sm text-slate-400">Age {age}</p>
                              </div>
                              
                              {/* Status Badge */}
                              <Badge className={status.badge}>
                                {status.icon}
                                <span className="ml-1">{status.text}</span>
                              </Badge>
                            </div>
                            
                            {/* Actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-600"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                  <DropdownMenuItem 
                                    onClick={() => handleEditPlayer(player)}
                                    className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClick(player)}
                                    className="text-red-400 hover:text-red-300 hover:bg-slate-700 cursor-pointer"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Rejected Players Section */}
                  {rejectedPlayers.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 pt-6 border-t border-slate-600">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <h3 className="text-sm font-medium text-red-400 uppercase tracking-wide">
                          Needs Attention
                        </h3>
                      </div>
                      {rejectedPlayers.map((player) => {
                        const age = differenceInYears(new Date(), new Date(player.date_of_birth))
                        const status = getApprovalStatus(player)
                        
                        return (
                          <div 
                            key={player.id} 
                            className="group flex items-center justify-between p-4 bg-red-900/10 rounded-lg border border-red-600/30 hover:bg-red-900/20 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-600 flex-shrink-0">
                                {playerPhotos[player.id] ? (
                                  <img
                                    src={playerPhotos[player.id]}
                                    alt={`${player.first_name} ${player.last_name}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-600">
                                    <User className="w-6 h-6 text-slate-400" />
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-white">
                                  {player.first_name} {player.last_name}
                                </h4>
                                <p className="text-sm text-slate-400">Age {age}</p>
                                {player.rejection_reason && (
                                  <p className="text-sm text-red-400 mt-1">
                                    {player.rejection_reason}
                                  </p>
                                )}
                              </div>
                              
                              <Badge className={status.badge}>
                                {status.icon}
                                <span className="ml-1">{status.text}</span>
                              </Badge>
                            </div>
                            
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-600"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                  <DropdownMenuItem 
                                    onClick={() => handleEditPlayer(player)}
                                    className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit & Resubmit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClick(player)}
                                    className="text-red-400 hover:text-red-300 hover:bg-slate-700 cursor-pointer"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Training Sessions */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Upcoming Training Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">No training sessions booked</p>
                  <Button asChild className="bg-teal-600 hover:bg-teal-700">
                    <Link href="/sessions">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Training Session
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-slate-400 text-sm">
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Location</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-2">
                        {upcomingBookings.map((booking) => (
                          <tr key={booking.id} className="border-t border-slate-600">
                            <td className="py-3 text-white">
                              {format(new Date(booking.sessions.date), "MMM dd, yyyy")}
                            </td>
                            <td className="py-3 text-slate-300">
                              {booking.sessions.location}
                            </td>
                            <td className="py-3">
                              <Badge 
                                variant={booking.payment_status === "paid" ? "default" : "destructive"}
                                className={booking.payment_status === "paid" 
                                  ? "bg-green-600/20 text-green-400 border-green-600/30" 
                                  : "bg-red-600/20 text-red-400 border-red-600/30"
                                }
                              >
                                {booking.payment_status === "paid" ? "Paid" : "Unpaid"}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300">
                                  View
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                  Cancel
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <AddPlayerModal
        open={showAddPlayerModal}
        onClose={() => setShowAddPlayerModal(false)}
        onPlayerAdded={handlePlayerAdded}
      />

      {selectedPlayer && (
        <EditPlayerModal
          open={showEditPlayerModal}
          onClose={() => {
            setShowEditPlayerModal(false)
            setSelectedPlayer(null)
          }}
          onPlayerUpdated={handlePlayerUpdated}
          player={selectedPlayer}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Player
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete {playerToDelete?.first_name} {playerToDelete?.last_name}? 
              This action cannot be undone and will also delete all their bookings and medical records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Player"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
