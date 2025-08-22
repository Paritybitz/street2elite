"use client"

import { CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NotificationIconProps {
  count: number
  onClick: () => void
}

export function NotificationIcon({ count, onClick }: NotificationIconProps) {
  if (count === 0) {
    return null // Don't show the icon if there are no pending requests
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="relative p-2 text-white hover:bg-white hover:text-black transition-colors"
      title={`${count} pending approval${count === 1 ? '' : 's'}`}
    >
      <CheckSquare className="h-5 w-5" />
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
        {count > 99 ? '99+' : count}
      </span>
    </Button>
  )
}
