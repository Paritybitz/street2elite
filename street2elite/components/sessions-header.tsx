import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProfileDropdown } from "@/components/profile-dropdown"

interface SessionsHeaderProps {
  user: any
  profile: any
}

export function SessionsHeader({ user, profile }: SessionsHeaderProps) {
  return (
    <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Logo - Primary brand element, furthest left */}
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image
                src="/s2e-white.png"
                alt="Street 2 Elite"
                width={120}
                height={80}
                className="h-10 w-auto rounded-lg"
              />
            </Link>
            
            {/* Back to Dashboard - Secondary navigation */}
            <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Profile dropdown on the right */}
          <ProfileDropdown user={user} profile={profile} />
        </div>
      </div>
    </header>
  )
}
