"use client"
import { Home, Compass, PlusSquare, Bell, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUnreadCounts } from "@/hooks/use-unread-counts"

export function MobileNavigation() {
  const pathname = usePathname()
  const { unreadNotifications, unreadMessages } = useUnreadCounts()

  const navItems = [
    { href: "/feed", icon: Home, label: "Feed" },
    { href: "/explore", icon: Compass, label: "Explore" },
    { href: "/create", icon: PlusSquare, label: "Create" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/profile", icon: User, label: "Profile" }, // This will be dynamic later
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-nav z-50 md:hidden safe-bottom">
      <div className="max-w-md mx-auto flex w-full justify-between items-center px-2 py-2">
        {navItems.map((item) => {
          // Special styling for the center '+' button
          if (item.href === "/create") {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1",
                  "z-10"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center rounded-full bg-orange-500 text-white shadow-lg border-4 border-black",
                  pathname === item.href ? "scale-110" : "scale-100",
                  "transition-all duration-300 w-16 h-16 -mt-8 mb-1"
                )}>
                  <item.icon className="h-8 w-8" />
                </div>
                <span className="text-xs mt-1 font-bold text-orange-500">{item.label}</span>
              </Link>
            )
          }
          // Notification and message badge placeholders
          const isProfile = item.href === "/profile"
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 text-gray-400 transition-all duration-300 hover-lift p-2 rounded-xl",
                pathname === item.href || (isProfile && pathname.startsWith("/profile"))
                  ? "text-orange-500 glow-orange-text bg-orange-500/10"
                  : "hover:text-orange-400 hover:bg-orange-500/5",
              )}
            >
              <div className="relative">
                <item.icon className={cn(
                  "h-6 w-6 transition-all duration-300",
                  pathname === item.href || (isProfile && pathname.startsWith("/profile"))
                    ? "animate-glow-pulse"
                    : ""
                )} />
                {/* Real-time badge counts */}
                {item.href === "/notifications" && unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold border-2 border-black">
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </span>
                )}
                {item.href === "/messages" && unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold border-2 border-black">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
