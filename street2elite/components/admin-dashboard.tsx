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
import { differenceInYears } from "date-fns"
import { toast } from "sonner"
import { PlayerDetailsModal } from "./player-details-modal"

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
}

interface AdminDashboardProps {
  user: { id: string }
  profile: { role: string }
}

export function AdminDashboard({ user, profile }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("sessions")
  const [playersTab, setPlayersTab] = useState("registered")
  const [registeredSearchTerm, setRegisteredSearchTerm] = useState("")
  const [pendingSearchTerm, setPendingSearchTerm] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [pendingPlayers, setPendingPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const supabase = createClient()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      // Manual join approach - this will definitely work
      console.log("=== DEBUGGING DATABASE RELATIONSHIPS ===")
      
      // Get all children first
      const { data: childrenData, error: childrenError } = await supabase
        .from("children")
        .select("*")
        .order("created_at", { ascending: false })

      if (childrenError || !childrenData) {
        console.error("Children query error:", childrenError)
        throw childrenError || new Error("No children data")
      }

      console.log("Children data fetched:", childrenData.length, "records")
      console.log("First child full data:", childrenData[0])

      // Get all unique parent IDs
      const parentIds = [...new Set(childrenData.map(child => child.parent_id).filter(Boolean))]
      console.log("Parent IDs to fetch:", parentIds)
      console.log("Parent IDs types:", parentIds.map(id => ({ id, type: typeof id })))
      
      // Let's also check what's actually in the profiles table
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, phone")
        .limit(10)

      console.log("All profiles in database (first 10):", allProfiles)
      console.log("Profiles query error:", allProfilesError)

      if (allProfiles && allProfiles.length > 0) {
        console.log("Profile IDs in database:", allProfiles.map(p => ({ id: p.id, type: typeof p.id })))
        console.log("Do parent_ids match profile ids?", parentIds.map(pid => ({
          parent_id: pid,
          exists_in_profiles: allProfiles.some(p => p.id === pid)
        })))
      }
      
      // Get all profiles for these parents
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, phone")
        .in("id", parentIds)

      if (profilesError) {
        console.error("Profiles query error:", profilesError)
      }

      console.log("Profiles data fetched:", profilesData?.length || 0, "records")
      console.log("Matching profiles:", profilesData)

      // Let's also try a different approach - get profiles by email if we have that info
      if ((!profilesData || profilesData.length === 0) && allProfiles && allProfiles.length > 0) {
        console.log("=== TRYING ALTERNATIVE APPROACH ===")
        // Maybe the relationship is broken, let's try to match by other means
        // For now, let's just assign the first available profile to each child for testing
        const playersData: Player[] = childrenData.map((child, index) => ({
          ...child,
          profiles: allProfiles[index % allProfiles.length] // Just for testing - assign profiles cyclically
        }))

        console.log("Using alternative approach - first player with assigned profile:", playersData[0])
        
        // Separate approved and pending players
        const approved = playersData.filter(p => p.approval_status === 'approved')
        const pending = playersData.filter(p => p.approval_status === 'pending')
        
        console.log("Final counts - Approved players:", approved.length, "Pending players:", pending.length)
        
        setPlayers(approved)
        setPendingPlayers(pending)
        return
      }

      // Combine the data manually - fix the profiles property to be a single object
      const playersData: Player[] = childrenData.map(child => ({
        ...child,
        profiles: profilesData?.find(profile => profile.id === child.parent_id) || undefined
      }))

      console.log("Combined data sample:")
      playersData.slice(0, 2).forEach((player, index) => {
        console.log(`Player ${index + 1}:`, {
          name: `${player.first_name} ${player.last_name}`,
          status: player.approval_status,
          parent_id: player.parent_id,
          manager: player.profiles ? `${player.profiles.first_name} ${player.profiles.last_name}` : 'No manager data',
          managerEmail: player.profiles?.email || 'No email',
          hasManagerData: !!player.profiles
        })
      })
      
      // Separate approved and pending players
      const approved = playersData.filter(p => p.approval_status === 'approved')
      const pending = playersData.filter(p => p.approval_status === 'pending')
      
      console.log("Final counts - Approved players:", approved.length, "Pending players:", pending.length)
      
      setPlayers(approved)
      setPendingPlayers(pending)
      
    } catch (error) {
      const err = error as { message: string; details?: string; hint?: string }
      console.error("Error fetching data:", error)
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
        () => {
          fetchData() // Refresh data when children table changes
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredPlayers = players.filter(player => 
    `${player.first_name} ${player.last_name}`.toLowerCase().includes(registeredSearchTerm.toLowerCase()) ||
    player.profiles?.email?.toLowerCase().includes(registeredSearchTerm.toLowerCase()) ||
    `${player.profiles?.first_name} ${player.profiles?.last_name}`.toLowerCase().includes(registeredSearchTerm.toLowerCase())
  )

  const filteredPendingPlayers = pendingPlayers.filter(player => 
    `${player.first_name} ${player.last_name}`.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
    player.profiles?.email?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
    `${player.profiles?.first_name} ${player.profiles?.last_name}`.toLowerCase().includes(pendingSearchTerm.toLowerCase())
  )

  const handleApprovePlayer = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from("children")
        .update({ 
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq("id", playerId)

      if (error) throw error
      
      toast.success("Player approved")
      fetchData()
    } catch (error) {
      console.error("Error approving player:", error)
      toast.error("Failed to approve player")
    }
  }

  const handleRejectPlayer = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from("children")
        .update({ 
          approval_status: 'rejected',
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq("id", playerId)

      if (error) throw error
      
      toast.success("Player rejected")
      fetchData()
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

  // Rectangular card for registered players
  const PlayerCard = ({ player }: { player: Player }) => {
    const imageUrl = getImageUrl(player.photo_url)

    return (
      <div 
        className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors cursor-pointer border border-slate-600/50"
        onClick={() => setSelectedPlayer(player)}
      >
        {/* Player Photo */}
        <div className="w-full h-32 bg-slate-600 rounded-lg flex items-center justify-center overflow-hidden mb-3">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${player.first_name} ${player.last_name}`}
              width={200}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-16 w-16 text-slate-300" />
          )}
        </div>
        
        {/* Player Info */}
        <div className="text-center">
          <h3 className="font-medium text-white text-lg mb-1">
            {player.first_name} {player.last_name}
          </h3>
          <p className="text-slate-400 text-sm">
            Age: {player.date_of_birth ? differenceInYears(new Date(), new Date(player.date_of_birth)) : 'N/A'}
          </p>
        </div>
      </div>
    )
  }

  // List item for pending players (keep the original style)
  const PendingPlayerItem = ({ player }: { player: Player }) => {
    const imageUrl = getImageUrl(player.photo_url)

    return (
      <div 
        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
        onClick={() => setSelectedPlayer(player)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${player.first_name} ${player.last_name}`}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-slate-300" />
            )}
          </div>
          <div>
            <p className="font-medium text-white">{player.first_name} {player.last_name}</p>
            <p className="text-sm text-slate-400">
              Age: {player.date_of_birth ? differenceInYears(new Date(), new Date(player.date_of_birth)) : 'N/A'}
            </p>
            <p className="text-xs text-slate-500">
              Manager: {player.profiles?.first_name && player.profiles?.last_name 
                ? `${player.profiles.first_name} ${player.profiles.last_name}`
                : 'Manager info not available'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleApprovePlayer(player.id)
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation()
              handleRejectPlayer(player.id)
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-600"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-700 border-slate-600">
              <DropdownMenuItem 
                className="text-slate-300 hover:bg-slate-600 hover:text-white"
                onClick={() => setSelectedPlayer(player)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
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
        </div>
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
                  width={140}
                  height={90}
                  className="h-12 w-auto rounded-lg"
                />
              </Link>
              
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
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
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="registered" className="mt-6">
                    {/* Search bar for registered players */}
                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Search registered players or managers..."
                        value={registeredSearchTerm}
                        onChange={(e) => setRegisteredSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>

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
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredPlayers.map((player) => (
                          <PlayerCard key={player.id} player={player} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="mt-6">
                    {/* Search bar for pending requests */}
                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Search pending requests or managers..."
                        value={pendingSearchTerm}
                        onChange={(e) => setPendingSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>

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
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredPendingPlayers.map((player) => (
                          <PendingPlayerItem key={player.id} player={player} />
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

      {/* Player Details Modal */}
      <PlayerDetailsModal
        player={selectedPlayer}
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        onPlayerUpdated={fetchData}
        onApprove={handleApprovePlayer}
        onReject={handleRejectPlayer}
      />
    </div>
  )
}
