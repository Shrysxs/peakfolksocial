"use client"

import React from "react"
import Link from "next/link"
import { Home, Compass, PlusSquare, Bell, MessageSquare, User, Settings, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { ProfileSettingsDialog } from "./profile-settings-dialog"
import { FollowRequestsDialog } from "./follow-requests-dialog"

export function Navigation() {
  const pathname = usePathname()
  const { dbUser, logout } = useAuth()
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = React.useState(false)
  const [isFollowRequestsOpen, setIsFollowRequestsOpen] = React.useState(false)

  const navItems = [
    { href: "/feed", icon: Home, label: "Feed" },
    { href: "/explore", icon: Compass, label: "Explore" },
    { href: "/create", icon: PlusSquare, label: "Create" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="hidden md:flex flex-col w-64 bg-black border-r border-gray-800 p-4 space-y-2 min-h-[calc(100vh-80px)] sticky top-20">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200",
            pathname === item.href
              ? "bg-orange-600 text-white"
              : "text-gray-300 hover:bg-gray-800 hover:text-orange-400",
          )}
        >
          <item.icon className="h-6 w-6" />
          <span className="font-medium">{item.label}</span>
        </Link>
      ))}

      {dbUser && (
        <>
          <Link
            href={`/profile/${dbUser.id}`}
            className={cn(
              "flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200",
              pathname.startsWith("/profile")
                ? "bg-orange-600 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-orange-400",
            )}
          >
            <User className="h-6 w-6" />
            <span className="font-medium">Profile</span>
          </Link>
          <Button
            variant="ghost"
            onClick={() => setIsProfileSettingsOpen(true)}
            className="flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-800 hover:text-orange-400 justify-start"
          >
            <Settings className="h-6 w-6" />
            <span className="font-medium">Settings</span>
          </Button>
          {dbUser.isPrivate && (
            <Button
              variant="ghost"
              onClick={() => setIsFollowRequestsOpen(true)}
              className="flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 text-gray-300 hover:bg-gray-800 hover:text-orange-400 justify-start"
            >
              <User className="h-6 w-6" />
              <span className="font-medium">Follow Requests</span>
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 text-red-500 hover:bg-red-900/50 justify-start"
          >
            <LogOut className="h-6 w-6" />
            <span className="font-medium">Log Out</span>
          </Button>
        </>
      )}
      {dbUser && (
        <>
          <ProfileSettingsDialog open={isProfileSettingsOpen} onOpenChange={setIsProfileSettingsOpen} />
          <FollowRequestsDialog open={isFollowRequestsOpen} onOpenChange={setIsFollowRequestsOpen} />
        </>
      )}
    </nav>
  )
}
