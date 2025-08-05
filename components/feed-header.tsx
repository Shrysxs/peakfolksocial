"use client"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export function FeedHeader() {
  const { dbUser } = useAuth()

  return (
    <Card className="glass-card p-4 flex items-center justify-between">
      <Link href={`/profile/${dbUser?.id}`} className="flex items-center space-x-3 group">
        <Avatar className="h-12 w-12 border-2 border-orange-500">
          <AvatarImage src={dbUser?.avatar || "/placeholder.svg"} alt={dbUser?.username || "User"} />
          <AvatarFallback>{dbUser?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">
            Hello, {dbUser?.name || dbUser?.username || "Adventurer"}!
          </span>
          <span className="text-sm text-gray-400">Ready for your next peak?</span>
        </div>
      </Link>
      <Link href="/create">
        <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-4 py-2 flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span className="hidden md:inline">Create</span>
        </Button>
      </Link>
    </Card>
  )
}
