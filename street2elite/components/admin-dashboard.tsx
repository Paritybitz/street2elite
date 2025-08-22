"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Calendar,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/client"
import { AcademyCalendar } from "./academy-calendar"
import { ProfileDropdown } from "./profile-dropdown"
import { NotificationIcon } from "./notification-icon"
import { format, differenceInYears } from "date-fns"
import { toast } from "sonner"

interface Player {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  approval_status: string
  created_at: string
  photo_url?: string
  profiles?: {
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
}

interface AdminDashboardProps {
  user: { id: string }
  profile: { role: string }
}

export function AdminDashboard({ user, profile }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("sessions")
  const [playersTab, setPlayersTab] = useState("registered")
  const [searchTerm, setSearchTerm] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [pendingPlayers, setPendingPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      console.log("Admin fetching data...")
      
      // Check current user and profile
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error("Error getting current user:", userError)
        throw userError
      }
      
      console.log("Current user:", currentUser?.id)
      console.log("Profile role:", profile?.role)
      
      // Check if we can access the children table at all
      const { data: testData, error: testError } = await supabase
        .from("children")
        .select("id, approval_status")
        .limit(1)

      console.log("Test query result:", { testData, testError })

      if (testError) {
        console.error("Cannot access children table:", testError)
        throw testError
      }
      
      // Try to get ALL children regardless of RLS
      const { data: allChildren, error: allError } = await supabase
        .from("children")
        .select("*")
        .limit(100)

      console.log("All children query:", { count: allChildren?.length, error: allError, data: allChildren })
      
      // Check if there are any children at all
      const { count, error: countError } = await supabase
        .from("children")
        .select("*", { count: 'exact', head: true })

      console.log("Children count:", { count, error: countError })
      
      // Fetch all players with their parent info
      const { data: playersData, error: playersError } = await supabase
        .from("children")
        .select(`
          *,
          profiles!children_parent_id_fkey (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .order("created_at", { ascending: false })

      console.log("Players query result:", { 
        playersCount: playersData?.length, 
        playersError,
        firstPlayer: playersData?.[0]
      })

      if (playersError) {
        console.error("Supabase error details:", playersError)
        throw playersError
      }
      
      if (!playersData) {
        console.log("No players data returned")
        setPlayers([])
        setPendingPlayers([])
        return
      }
      
      console.log("Total players found:", playersData.length)
      
      // Log all players with their status
      playersData.forEach((player, index) => {
        console.log(`Player ${index + 1}:`, {
          name: `${player.first_name} ${player.last_name}`,
          status: player.approval_status,
          created: player.created_at
        })
      })
      
      // Separate approved and pending players
      const approved = playersData.filter(p => p.approval_status === 'approved')
      const pending = playersData.filter(p => p.approval_status === 'pending')
      
      console.log("Approved players:", approved.length)
      console.log("Pending players:", pending.length)
      console.log("Pending players details:", pending.map(p => ({
        name: `${p.first_name} ${p.last_name}`,
        status: p.approval_status,
        created: p.created_at
      })))
      
      setPlayers(approved)
      setPendingPlayers(pending)
      
    } catch (error) {
      const err = error as { message: string; details?: string; hint?: string }
      console.error("Error fetching data:", error)
      console.error("Error message:", err.message)
      console.error("Error details:", err.details)
      console.error("Error hint:", err.hint)
      toast.error(`Failed to load data: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Set up real-time subscription to refresh when new players are added
    const channel = supabase
      .channel('children-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'children',
        },
        (payload) => {
          console.log('Children table changed:', payload)
          fetchData() // Refresh data when children table changes
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredPlayers = players.filter(player => 
    `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${player.profiles?.first_name} ${player.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPendingPlayers = pendingPlayers.filter(player => 
    `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${player.profiles?.first_name} ${player.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleApprovePlayer = async (playerId: string) => {
    try {
      console.log("Approving player:", playerId)
      const { error } = await supabase
        .from("children")
        .update({ 
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq("id", playerId)

      if (error) {
        console.error("Error approving player:", error)
        throw error
      }
      
      toast.success("Player approved")
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error approving player:", error)
      toast.error("Failed to approve player")
    }
  }

  const handleRejectPlayer = async (playerId: string) => {
    try {
      console.log("Rejecting player:", playerId)
      const { error } = await supabase
        .from("children")
        .update({ 
          approval_status: 'rejected',
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq("id", playerId)

      if (error) {
        console.error("Error rejecting player:", error)
        throw error
      }
      
      toast.success("Player rejected")
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error rejecting player:", error)
      toast.error("Failed to reject player")
    }
  }

  // Helper function to get the full image URL from Supabase storage
  const getImageUrl = (photoUrl: string | null | undefined) => {
    if (!photoUrl) return null
    
    // If it's already a full URL, return as is
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
      return photoUrl
    }
    
    // If it's a relative path, construct the full Supabase storage URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/player-photos/${photoUrl}`
  }

  const PlayerCard = ({ player, showActions = true }: { player: Player, showActions?: boolean }) => {
    const imageUrl = getImageUrl(player.photo_url)

    return (
      <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${player.first_name} ${player.last_name}`}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                onError={() => {
                  // This will be handled by the fallback below
                }}
              />
            ) : (
              <User className="h-6 w-6 text-slate-300" />
            )}
          </div>
          <div>
            <p className="font-medium text-white">{player.first_name} {player.last_name}</p>
            <p className="text-sm text-slate-400">
              Age: {player.date_of_birth ? differenceInYears(new Date(), new Date(player.date_of_birth)) : 'N/A'} • 
              Parent: {player.profiles?.first_name} {player.profiles?.last_name}
            </p>
            <p className="text-xs text-slate-500">
              Status: {player.approval_status} • Created: {format(new Date(player.created_at), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
        
        {showActions && (
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
            <DropdownMenuContent align="end" className="bg-slate-700 border-slate-600">
              <DropdownMenuItem className="text-slate-300 hover:bg-slate-600 hover:text-white">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {player.approval_status === 'pending' && (
                <>
                  <DropdownMenuItem 
                    onClick={() => handleApprovePlayer(player.id)}
                    className="text-green-400 hover:bg-slate-600 hover:text-green-300"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleRejectPlayer(player.id)}
                    className="text-red-400 hover:bg-slate-600 hover:text-red-300"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem className="text-slate-300 hover:bg-slate-600 hover:text-white">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-400 hover:bg-slate-600 hover:text-red-300">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* Admin Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <Image
                  src="/s2e-white.png"
                  alt="Street 2 Elite"
                  width={120}
                  height={80}
                  className="h-10 w-auto rounded-lg"
                />
              </Link>
              
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                {/* Debug info */}
                <span className="text-xs text-slate-400">
                  ({pendingPlayers.length} pending)
                </span>
              </div>
            </div>

            {/* Navigation moved to the right, before profile */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("sessions")}
                  className={`flex items-center gap-2 text-white hover:bg-white hover:text-black transition-colors ${
                    activeTab === "sessions" 
                      ? "bg-white text-black" 
                      : "text-white hover:bg-white hover:text-black"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Sessions
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setActiveTab("players")
                    if (pendingPlayers.length > 0) {
                      setPlayersTab("pending")
                    }
                  }}
                  className={`flex items-center gap-2 text-white hover:bg-white hover:text-black transition-colors ${
                    activeTab === "players" 
                      ? "bg-white text-black" 
                      : "text-white hover:bg-white hover:text-black"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Players
                </Button>
              </div>
              
              {/* Notification Icon */}
              <NotificationIcon 
                count={pendingPlayers.length} 
                onClick={() => {
                  setActiveTab("players")
                  setPlayersTab("pending")
                }}
              />
              
              <ProfileDropdown user={user} profile={profile} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === "sessions" && (
          <AcademyCalendar
            user={user}
            profile={profile}
            playersList={[]}
            isAdmin={true}
          />
        )}

        {activeTab === "players" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Players Management</h1>
                <p className="text-slate-300">
                  Manage player registrations and approvals
                </p>
                {/* Debug info */}
                <p className="text-xs text-slate-500 mt-1">
                  Debug: {players.length} approved, {pendingPlayers.length} pending, Loading: {isLoading ? 'Yes' : 'No'}
                </p>
              </div>
              
              {/* Search moved here */}
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search players or managers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 w-full sm:w-80"
                />
              </div>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <Tabs value={playersTab} onValueChange={setPlayersTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                    <TabsTrigger 
                      value="registered" 
                      className="text-slate-300 data-[state=active]:bg-white data-[state=active]:text-black"
                    >
                      Registered Players ({players.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="pending" 
                      className="text-slate-300 data-[state=active]:bg-white data-[state=active]:text-black relative"
                    >
                      Pending Requests ({pendingPlayers.length})
                      {pendingPlayers.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                          {pendingPlayers.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="registered" className="mt-6">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
                        <p className="text-slate-400 mt-4">Loading players...</p>
                      </div>
                    ) : filteredPlayers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">No registered players found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredPlayers.map((player) => (
                          <PlayerCard key={player.id} player={player} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="mt-6">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
                        <p className="text-slate-400 mt-4">Loading pending requests...</p>
                      </div>
                    ) : filteredPendingPlayers.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">
                          {pendingPlayers.length === 0 ? "No pending approval requests" : "No matching pending requests"}
                        </p>
                        {/* Debug button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            console.log("Manual refresh triggered")
                            fetchData()
                          }}
                          className="mt-4 text-slate-400 border-slate-600"
                        >
                          Refresh Data
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredPendingPlayers.map((player) => (
                          <PlayerCard key={player.id} player={player} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
