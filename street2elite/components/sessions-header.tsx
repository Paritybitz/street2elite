import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SessionsHeader() {
  return (
    <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="text-2xl font-bold">
              <span className="text-white">Street </span>
              <span className="text-4xl text-teal-400">2</span>
              <span className="text-white"> </span>
              <span className="text-white underline decoration-amber-400 decoration-2 underline-offset-4">Elite</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
