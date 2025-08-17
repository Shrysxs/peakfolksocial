"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MountainIcon, Search, Bell, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"

export function MobileHeader() {
  const { dbUser } = useAuth()

  return (
    <header className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center justify-between md:hidden">
      <Link href="/feed" className="flex items-center space-x-2">
        <MountainIcon className="h-8 w-8 text-orange-500" />
        <span className="text-2xl font-bold text-white">Peakfolk</span>
      </Link>

      <div className="flex items-center space-x-2">
        <Link href="/explore">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500">
            <Search className="h-6 w-6" />
            <span className="sr-only">Search</span>
          </Button>
        </Link>
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500">
            <Bell className="h-6 w-6" />
            <span className="sr-only">Notifications</span>
          </Button>
        </Link>
        <Link href="/messages">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500">
            <MessageSquare className="h-6 w-6" />
            <span className="sr-only">Messages</span>
          </Button>
        </Link>
        {dbUser ? (
          <Link href={`/profile/${dbUser.id}`}>
            <Avatar className="h-9 w-9 border-2 border-orange-500">
              <AvatarImage src={dbUser.avatar || "/placeholder.svg"} alt={dbUser.username} />
              <AvatarFallback>{dbUser.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="border-orange-500 text-orange-500 hover:bg-orange-900 hover:text-white bg-transparent"
            >
              Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
