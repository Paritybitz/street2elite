"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Search, 
  Calendar,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  User
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/client"
import { AcademyCalendar } from "./academy-calendar"
import { ProfileDropdown } from "./profile-dropdown"
import { format, differenceInYears } from "date-fns"
import { toast } from "sonner"

interface AdminDashboardProps {
  user: any
  profile: any
}

export function AdminDashboard({ user, profile }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("sessions")
  const [searchTerm, setSearchTerm] = useState("")
  const [players, setPlayers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
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

      if (playersError) throw playersError
      setPlayers(playersData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredPlayers = players.filter(player => 
    player.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${player.profiles?.first_name} ${player.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-600 text-white"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge className="bg-yellow-600 text-white"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>
    }
  }

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
      fetchData() // Refresh data
    } catch (error: any) {
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
      fetchData() // Refresh data
    } catch (error: any) {
      console.error("Error rejecting player:", error)
      toast.error("Failed to reject player")
    }
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
                  onClick={() => setActiveTab("players")}
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
            children={[]}
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
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Registered Players ({filteredPlayers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
                    <p className="text-slate-400 mt-4">Loading players...</p>
                  </div>
                ) : filteredPlayers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No players found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-300">Player</TableHead>
                          <TableHead className="text-slate-300">Age</TableHead>
                          <TableHead className="text-slate-300">Player Manager</TableHead>
                          <TableHead className="text-slate-300">Status</TableHead>
                          <TableHead className="text-slate-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPlayers.map((player) => (
                          <TableRow key={player.id} className="border-slate-700 hover:bg-slate-700/50">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-slate-300" />
                                </div>
                                <div>
                                  <p className="font-medium text-white">{player.full_name}</p>
                                  <p className="text-sm text-slate-400">
                                    Born: {format(new Date(player.date_of_birth), 'MMM dd, yyyy')}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {differenceInYears(new Date(), new Date(player.date_of_birth))} years
                            </TableCell>
                            <TableCell>
                              <div className="text-slate-300">
                                <p className="font-medium">
                                  {player.profiles?.first_name} {player.profiles?.last_name}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                  {player.profiles?.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {player.profiles.email}
                                    </div>
                                  )}
                                  {player.profiles?.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {player.profiles.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(player.approval_status || 'pending')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                {player.approval_status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApprovePlayer(player.id)}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleRejectPlayer(player.id)}
                                    >
                                      <XCircle className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
