"use client"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function AdminHeader() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/admin" className="flex items-center space-x-3">
            <div className="text-2xl font-bold">
              <span className="text-white">Street </span>
              <span className="text-4xl text-teal-400">2</span>
              <span className="text-white"> </span>
              <span className="text-white underline decoration-amber-400 decoration-2 underline-offset-4">Elite</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-red-600/20 rounded-full border border-red-600/30">
              <Shield className="h-3 w-3 text-red-400" />
              <span className="text-xs text-red-400 font-medium">ADMIN</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/admin" className="text-slate-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/sessions" className="text-slate-300 hover:text-white transition-colors">
              Sessions
            </Link>
            <Link href="/admin/bookings" className="text-slate-300 hover:text-white transition-colors">
              Bookings
            </Link>
            <Link href="/admin/users" className="text-slate-300 hover:text-white transition-colors">
              Users
            </Link>
            <Link href="/admin/analytics" className="text-slate-300 hover:text-white transition-colors">
              Analytics
            </Link>
          </nav>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-red-600 text-white font-semibold">A</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-white">Admin User</p>
                  <p className="w-[200px] truncate text-sm text-slate-400">admin@street2elite.com</p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-slate-700" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
