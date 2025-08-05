"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MountainIcon, Search, Bell, MessageSquare, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { ProfileSettingsDialog } from "./profile-settings-dialog"
import { FollowRequestsDialog } from "./follow-requests-dialog"

export function Header() {
  const { dbUser, logout } = useAuth()
  const router = useRouter()
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = React.useState(false)
  const [isFollowRequestsOpen, setIsFollowRequestsOpen] = React.useState(false)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-orange-500/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <Link href="/feed" className="flex items-center space-x-3 group hover-lift">
              <div className="relative">
                <MountainIcon className="h-8 w-8 text-orange-500 glow-orange-text" />
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-lg"></div>
              </div>
              <span className="text-2xl font-bold gradient-text flex items-center">
                Peakfolk
                <span className="ml-1 text-3xl text-orange-500 align-middle" style={{lineHeight: 0}}>.</span>
              </span>
            </Link>
          </div>
          {dbUser && (
            <span className="text-sm text-gray-400 mt-1 ml-1">Hello, {dbUser.name || dbUser.username || "Adventurer"}!</span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/explore">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500 hover-lift focus-glow">
              <Search className="h-6 w-6" />
              <span className="sr-only">Search</span>
            </Button>
          </Link>
          <Link href="/messages">
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500 hover-lift focus-glow">
                <MessageSquare className="h-6 w-6" />
                <span className="sr-only">Messages</span>
              </Button>
              {/* Real-time message indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse border-2 border-black"></div>
            </div>
          </Link>
          <Link href="/notifications">
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500 hover-lift focus-glow">
                <Bell className="h-6 w-6" />
                <span className="sr-only">Notifications</span>
              </Button>
              {/* Real-time notification indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse border-2 border-black"></div>
            </div>
          </Link>
          {dbUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-lift">
                  <Avatar className="h-10 w-10 avatar-glow">
                    <AvatarImage src={dbUser.avatar || "/placeholder.svg"} alt={dbUser.username} />
                    <AvatarFallback className="bg-orange-500 text-black font-semibold">{dbUser.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass-card p-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal text-white">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none gradient-text">{dbUser.name || dbUser.username}</p>
                    <p className="text-xs leading-none text-gray-400">@{dbUser.username}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  className="text-white hover:bg-gray-700/50 cursor-pointer hover-lift"
                  onClick={() => router.push(`/profile/${dbUser.id}`)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-white hover:bg-gray-700/50 cursor-pointer hover-lift"
                  onClick={() => setIsProfileSettingsOpen(true)}
                >
                  Settings
                </DropdownMenuItem>
                {dbUser.isPrivate && (
                  <DropdownMenuItem
                    className="text-white hover:bg-gray-700/50 cursor-pointer hover-lift"
                    onClick={() => setIsFollowRequestsOpen(true)}
                  >
                    Follow Requests
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-red-500 hover:bg-red-900/50 cursor-pointer hover-lift" onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                className="btn-peakfolk-secondary hover-lift"
              >
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
      {dbUser && (
        <>
          <ProfileSettingsDialog open={isProfileSettingsOpen} onOpenChange={setIsProfileSettingsOpen} />
          <FollowRequestsDialog open={isFollowRequestsOpen} onOpenChange={setIsFollowRequestsOpen} />
        </>
      )}
    </header>
  )
}
