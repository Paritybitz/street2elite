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
import { Plus, Calendar, MoreVertical, Edit, Trash2, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { differenceInYears } from "date-fns"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { AddPlayerModal } from "@/components/add-player-modal"
import { EditPlayerModal } from "@/components/edit-player-modal"
import { createClient } from "@/lib/client"
import { toast } from "sonner"
import Image from "next/image"

interface ParentDashboardProps {
  user: any
  profile: any
  players: any[]
  upcomingBookings: any[]
}

export function ParentDashboard({ user, profile, players: initialPlayers, upcomingBookings }: ParentDashboardProps) {
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
      const photos: { [key: string]: string } = {}
      
      for (const player of players) {
        if (player.photo_url) {
          try {
            const { data } = supabase.storage
              .from('player-photos')
              .getPublicUrl(player.photo_url)
            
            if (data?.publicUrl) {
              photos[player.id] = data.publicUrl
            }
          } catch (error) {
            console.error(`Error loading photo for player ${player.id}:`, error)
          }
        }
      }
      
      setPlayerPhotos(photos)
    }

    if (players.length > 0) {
      loadPlayerPhotos()
    }
  }, [players, supabase])

  const handlePlayerAdded = (newPlayer: any) => {
    setPlayers([...players, newPlayer])
    setShowAddPlayerModal(false)
  }

  const handlePlayerUpdated = (updatedPlayer: any) => {
    setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p))
    setShowEditPlayerModal(false)
    setSelectedPlayer(null)
  }

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return
    
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', playerToDelete.id)

      if (error) throw error

      setPlayers(players.filter(p => p.id !== playerToDelete.id))
      toast.success('Player removed successfully')
    } catch (error: any) {
      console.error('Error deleting player:', error)
      toast.error('Failed to remove player')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setPlayerToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-600 text-white"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge className="bg-amber-600 text-white"><Clock className="h-3 w-3 mr-1" />Pending Approval</Badge>
    }
  }

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

            <div className="flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <Link href="/sessions" className="text-slate-300 hover:text-white transition-colors">
                  Sessions
                </Link>
                <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                  Players
                </Link>
              </nav>
              
              <ProfileDropdown user={user} profile={profile} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {profile?.first_name || 'Parent'}
          </h1>
          <p className="text-slate-300">Manage your players and training sessions</p>
        </div>

        <div className="grid gap-8">
          {/* My Players */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">My Players</CardTitle>
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
                    Register Player
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {players.map((player) => {
                    const age = differenceInYears(new Date(), new Date(player.date_of_birth))
                    const isPending = player.approval_status === 'pending'
                    
                    return (
                      <div 
                        key={player.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                          isPending 
                            ? 'bg-slate-700/30 border-slate-600 opacity-75' 
                            : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700/70'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            {playerPhotos[player.id] ? (
                              <img
                                src={playerPhotos[player.id]}
                                alt={`${player.first_name} ${player.last_name}`}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-teal-600 flex items-center justify-center text-white font-semibold">
                                {player.first_name[0]}{player.last_name[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">
                              {player.first_name} {player.last_name}
                            </h3>
                            <p className="text-slate-400 text-sm">{age} years old</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(player.approval_status)}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem 
                                className="text-slate-300 hover:text-white hover:bg-slate-700"
                                onClick={() => {
                                  setSelectedPlayer(player)
                                  setShowEditPlayerModal(true)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                                onClick={() => {
                                  setPlayerToDelete(player)
                                  setShowDeleteDialog(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })}
                  
                  <Button 
                    onClick={() => setShowAddPlayerModal(true)}
                    variant="outline" 
                    className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Register Another Player
                  </Button>
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
              {!upcomingBookings || upcomingBookings.length === 0 ? (
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
                  {upcomingBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div>
                        <h4 className="text-white font-semibold">{booking.sessions?.title}</h4>
                        <p className="text-slate-400 text-sm">
                          {format(new Date(booking.sessions?.date), 'EEEE, MMMM d')} at {booking.sessions?.start_time}
                        </p>
                        <p className="text-slate-400 text-sm">{booking.sessions?.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">£{booking.sessions?.price}</p>
                        <Badge className="bg-green-600 text-white">Confirmed</Badge>
                      </div>
                    </div>
                  ))}
                  
                  {upcomingBookings.length > 3 && (
                    <Button asChild variant="outline" className="w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700">
                      <Link href="/sessions">
                        View All Sessions
                      </Link>
                    </Button>
                  )}
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

      <EditPlayerModal
        open={showEditPlayerModal}
        onClose={() => {
          setShowEditPlayerModal(false)
          setSelectedPlayer(null)
        }}
        player={selectedPlayer}
        onPlayerUpdated={handlePlayerUpdated}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Player?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Are you sure you want to remove {playerToDelete?.first_name} {playerToDelete?.last_name}? 
              This action cannot be undone and will cancel any upcoming bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlayer}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Player"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}